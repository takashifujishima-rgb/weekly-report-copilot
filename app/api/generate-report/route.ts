import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // 1. ログインユーザーのセッションチェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // フロントエンドからのリクエスト（トーン選択）を取得
    const { tone } = await request.json();

    // 2. SupabaseからGoogleのトークンとユーザー設定を一撃で取得
    const [tokenRes, settingsRes] = await Promise.all([
      supabase.from('google_tokens').select('*').eq('user_id', user.id).single(),
      supabase.from('user_settings').select('*').eq('id', user.id).single()
    ]);

    if (tokenRes.error || !tokenRes.data) {
      return NextResponse.json({ error: 'Googleトークンが見つかりません。再ログインしてください。' }, { status: 400 });
    }

    const { encrypted_access_token } = tokenRes.data;
    const challengeText = settingsRes.data?.challenge_text || '未設定';
    const divisionText = settingsRes.data?.division_text || '未設定';

    // 3. Google APIから過去5日間のデータをパラレルで高速取得
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    
    const [calendarData, gmailData] = await Promise.all([
      fetchGoogleCalendar(encrypted_access_token, fiveDaysAgo, now),
      fetchGoogleGmail(encrypted_access_token, fiveDaysAgo)
    ]);

    // 4. Geminiへ流し込む最強のプロンプトを組み立て
    const systemPrompt = `
    あなたは企業の優秀なチーフコパイロット（AI補佐官）です。
    提出された【行動ログ】から業務成果を抽出し、ユーザーの【今年度のチャレンジ】および【事務分掌】の文脈に合致する、極めて完成度の高い「週報」をMarkdown形式で生成してください。

    ■ ユーザー属性・目標
    ・今年度のチャレンジ: ${challengeText}
    ・担当する事務分掌: ${divisionText}

    ■ レポートの出力トーン
    指定されたトーン [${tone || 'executive'}] に厳格に従ってください。
    - executive: 経営層・上長向け。組織へのインパクト、課題、ネクストアクションを構造的に記述。高潔かつ簡潔な文体。
    - analytical: 定量分析向け。時間配分、完了タスク数、進捗パーセンテージなど、数値をベースとしたロジカルな事実中心の記述。

    ■ 絶対制約
    ・ハルシネーション（嘘の事実）は厳禁。ログにないプロジェクトや会議は絶対に創作しないこと。
    ・出力は美しく構造化されたMarkdown（見出し、箇条書き、太字）のみ。挨拶や余計なプロローグは一切不要。
    `;

    const userPrompt = `
    以下の実データ（過去5日間のログ）をもとに週報を作成してください。

    【カレンダーの予定ログ】
    ${JSON.stringify(calendarData, null, 2)}

    【Gmailの送受信トピック】
    ${JSON.stringify(gmailData, null, 2)}
    `;

    // 5. Gemini 1.5 Flash API の呼び出し
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          { role: 'user', parts: [{ text: userPrompt }] }
        ],
        generationConfig: {
          temperature: 0.2 // 嘘をつきにくくし、事実に基づいた堅実な文章にする設定
        }
      })
    });

    if (!geminiResponse.ok) {
      const errData = await geminiResponse.json();
      throw new Error(`Gemini API Error: ${JSON.stringify(errData)}`);
    }

    const geminiData = await geminiResponse.json();
    const aiReport = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '週報の生成に失敗しました。';

    return NextResponse.json({ report: aiReport });

  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// --- Google API 連携用のサブ関数群 ---
async function fetchGoogleCalendar(token: string, start: Date, end: Date) {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items?.map((item: any) => ({
    summary: item.summary,
    start: item.start?.dateTime || item.start?.date
  })) || [];
}

async function fetchGoogleGmail(token: string, after: Date) {
  const q = `after:${Math.floor(after.getTime() / 1000)}`;
  const url = `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.messages) return [];
  
  const details = await Promise.all(data.messages.map(async (msg: any) => {
    const detailRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!detailRes.ok) return null;
    const detailData = await detailRes.json();
    const subjectHeader = detailData.payload?.headers?.find((h: any) => h.name === 'Subject');
    return subjectHeader ? subjectHeader.value : null;
  }));
  return details.filter(Boolean);
}
