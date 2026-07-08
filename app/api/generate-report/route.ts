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

    // フロントエンドからのリクエスト（選択されたトーン：executive / analytical）を取得
    const { tone } = await request.json();

    // 2. SupabaseからGoogleのトークンとユーザー設定（事務分掌など）を一撃で取得
    const [tokenRes, settingsRes] = await Promise.all([
      supabase.from('google_tokens').select('*').eq('user_id', user.id).single(),
      supabase.from('user_settings').select('*').eq('id', user.id).single()
    ]);

    if (tokenRes.error || !tokenRes.data) {
      return NextResponse.json({ error: 'Google token not found. Please re-login.' }, { status: 400 });
    }

    const { encrypted_access_token } = tokenRes.data;
    const challengeText = settingsRes.data?.challenge_text || '未設定';
    const divisionText = settingsRes.data?.division_text || '未設定';

    // 3. Google APIから過去5日間のデータをパラレル（並列）で超高速フェッチ
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    
    const [calendarData, gmailData] = await Promise.all([
      fetchGoogleCalendar(encrypted_access_token, fiveDaysAgo, now),
      fetchGoogleGmail(encrypted_access_token, fiveDaysAgo)
    ]);

    // 4. AIへ流し込む最強のプロンプト（指示書）を動的に組み立て
    const systemPrompt = `
あなたは企業の優秀なチーフコパイロット（AI補佐官）です。
提出された【行動ログ】から業務成果を抽出し、ユーザーの【今年度のチャレンジ】および【事務分掌】の文脈に合致する、極めて完成度の高い「週報」をMarkdown形式で生成してください。

■ ユーザー属性・目標
・今年度のチャレンジ: ${challengeText}
・担当する事務分掌: ${divisionText}

■ レポートの出力トーン
指定されたトーン [${tone || 'executive'}] に厳格に従ってください。
- executive: 経営層・上長向け。細かな作業雑務は排除し、組織へのインパクト、課題、ネクストアクションを構造的に記述。高潔かつ簡潔な文体。
- analytical: 定量分析向け。時間配分、完了タスク数、進捗パーセンテージなど、数値をベースとしたロジカルで客観的な事実中心の記述。

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

    // 5. LLM（今回はVercel環境と親和性の高いGemini API / またはOpenAI）へリクエスト
    // ※ 費用効率とスピード、日本語の要約コンテキストの美しさからGemini 1.5 Flash等を推奨
    const aiResponse = await callLLM(systemPrompt, userPrompt);

    return NextResponse.json({ report: aiResponse });

  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// --- 以下、Google APIを安全に叩くためのサブ関数群 ---

async function fetchGoogleCalendar(token: string, start: Date, end: Date) {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items?.map((item: any) => ({
    summary: item.summary,
    start: item.start?.dateTime || item.start?.date,
    description: item.description ? item.description.substring(0, 100) : ''
  })) || [];
}

async function fetchGoogleGmail(token: string, after: Date) {
  const q = `after:${Math.floor(after.getTime() / 1000)}`;
  const url = `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const data = await res.json();
  
  if (!data.messages) return [];
  
  // 各メールの「件名（Subject）」だけをパースしてプライバシーに配慮しつつ業務内容を特定
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

async function callLLM(system: string, user: string) {
  // ここにGemini / OpenAI API等の呼び出し処理が入ります
  // 実装をシンプルにするため、次のステップでキーを設定した後に完全結合させます
  return `【週報ドラフト】\n\n現在、データ連携テストに成功しています。\nカレンダー履歴およびメール件名からタスクを抽出しました。`;
}
