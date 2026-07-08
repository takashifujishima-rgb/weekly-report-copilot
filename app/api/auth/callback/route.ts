import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/auth-error?message=Missing_code`);
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth-error?message=${encodeURIComponent(error.message)}`);
  }

  // ログイン成功時、セッションデータからGoogleのProvider Tokenを安全に抽出
  const providerToken = data.session?.provider_token;
  const providerRefreshToken = data.session?.provider_refresh_token;
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 通常GoogleのAccessTokenは1時間で失効

  if (providerToken && data.user) {
    // スプリント1の要件としてDBにトークン情報を同期格納（※スプリント4で暗号化層を噛ませます）
    await supabase.from('google_tokens').upsert({
      user_id: data.user.id,
      encrypted_access_token: providerToken, 
      encrypted_refresh_token: providerRefreshToken ?? 'EXISTING_TOKEN', // 2回目以降のログイン対策
      expires_at: expiresAt.toISOString(),
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
