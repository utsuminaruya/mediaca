'use client';

import { use, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, User, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface SignupPageProps {
  params: Promise<{ locale: string }>;
}

export default function SignupPage({ params }: SignupPageProps) {
  const { locale } = use(params);
  return (
    <Suspense>
      <SignupForm locale={locale} />
    </Suspense>
  );
}

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

function SignupForm({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectAfter = searchParams.get('redirect') || `/${locale}/dashboard`;
  const isJa = locale === 'ja';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const handleOAuthSignup = async (provider: 'google' | 'facebook') => {
    const setLoading = provider === 'google' ? setIsGoogleLoading : setIsFacebookLoading;
    setLoading(true);
    setError('');

    if (!isSupabaseConfigured) {
      setTimeout(() => router.push(`/${locale}/dashboard`), 800);
      return;
    }

    try {
      const supabase = createClient();
      const { error: authError } = await supabase!.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectAfter}`,
        },
      });
      if (authError) {
        setError(isJa ? `${provider === 'google' ? 'Google' : 'Facebook'}ログインに失敗しました` : `Đăng nhập ${provider === 'google' ? 'Google' : 'Facebook'} thất bại`);
        setLoading(false);
      }
    } catch {
      setError(isJa ? 'エラーが発生しました' : 'Đã xảy ra lỗi');
      setLoading(false);
    }
  };

  // メールマジックリンク登録（確認メール不要・1クリックでログイン）
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!agreed) {
      setError(isJa ? '利用規約に同意してください' : 'Vui lòng đồng ý với điều khoản');
      return;
    }
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      setTimeout(() => router.push(redirectAfter), 800);
      return;
    }

    try {
      const supabase = createClient();
      const { error: authError } = await supabase!.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectAfter}`,
        },
      });
      if (authError) {
        setError(authError.message);
        setIsLoading(false);
      } else {
        setSentEmail(email);
        setEmailSent(true);
        setIsLoading(false);
      }
    } catch {
      setError(isJa ? 'エラーが発生しました' : 'Đã xảy ra lỗi');
      setIsLoading(false);
    }
  };

  // ── メール送信完了画面 ────────────────────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-9 w-9 text-[#00B894]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isJa ? 'ログインリンクを送りました！' : 'Đã gửi liên kết đăng nhập!'}
          </h1>
          <p className="text-gray-500 mb-2 leading-relaxed text-sm">
            {isJa ? `${sentEmail} にメールを送りました。` : `Đã gửi email đến ${sentEmail}.`}
          </p>
          <p className="text-gray-700 font-medium mb-6">
            {isJa ? 'メール内の「ログインする」ボタンをクリックするだけで完了です。' : 'Chỉ cần nhấn nút trong email để đăng nhập ngay.'}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-4">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 space-y-1">
                <p><strong>{isJa ? '届かない場合：' : 'Không thấy email?'}</strong></p>
                <p>① {isJa ? '迷惑メール・スパムフォルダを確認' : 'Kiểm tra thư mục spam/junk'}</p>
                <p>② {isJa ? 'リンクの有効期限は1時間です' : 'Liên kết có hiệu lực 1 giờ'}</p>
                <p>③ {isJa ? 'それでも届かない場合はGoogleで登録をお試しください' : 'Nếu vẫn không thấy, hãy dùng Google'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setEmailSent(false); setEmail(''); setName(''); }}
            className="text-[#0066CC] font-semibold hover:underline text-sm"
          >
            {isJa ? '← 別のメールアドレスで試す' : '← Thử email khác'}
          </button>
        </div>
      </div>
    );
  }

  // ── 登録フォーム ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-6">
            <Image src="/images/logo.png" alt="Mediflow Academy" width={40} height={40} style={{ borderRadius: 10, objectFit: 'contain' }} />
            <span className="font-bold text-xl text-gray-900">Mediflow <span className="text-[#0066CC]">Academy</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isJa ? '無料アカウント作成' : 'Tạo tài khoản miễn phí'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isJa ? 'N5〜N1まで全コース無料で始められます' : 'Bắt đầu miễn phí với toàn bộ N5〜N1'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">

          {/* ── Google ── */}
          <button
            onClick={() => handleOAuthSignup('google')}
            disabled={isGoogleLoading}
            className={cn(
              'w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 text-sm font-semibold transition-all mb-3',
              'border-2 border-[#0066CC] text-[#0066CC] bg-blue-50',
              isGoogleLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-100'
            )}
          >
            {isGoogleLoading
              ? <span className="w-5 h-5 border-2 border-[#0066CC]/30 border-t-[#0066CC] rounded-full animate-spin" />
              : <GoogleIcon />}
            {isJa ? 'Googleで登録する（最速・おすすめ）' : 'Đăng ký bằng Google (Nhanh nhất)'}
          </button>

          {/* ── Facebook ── */}
          <button
            onClick={() => handleOAuthSignup('facebook')}
            disabled={isFacebookLoading}
            className={cn(
              'w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 text-sm font-semibold transition-all mb-3',
              'border-2 border-[#1877F2] text-[#1877F2] bg-blue-50',
              isFacebookLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#e7f0ff]'
            )}
          >
            {isFacebookLoading
              ? <span className="w-5 h-5 border-2 border-[#1877F2]/30 border-t-[#1877F2] rounded-full animate-spin" />
              : <FacebookIcon />}
            {isJa ? 'Facebookで登録する' : 'Đăng ký bằng Facebook'}
          </button>

          <p className="text-center text-xs text-gray-400 mb-5">
            {isJa ? 'メール確認不要ですぐに使えます' : 'Không cần xác nhận email, dùng ngay'}
          </p>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">{isJa ? 'またはメールアドレスで' : 'hoặc với email'}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── Email magic link ── */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isJa ? 'お名前' : 'Họ và tên'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={isJa ? '山田 花子' : 'Nguyễn Văn A'}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/10 transition-all bg-gray-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isJa ? 'メールアドレス' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/10 transition-all bg-gray-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">
                {isJa ? (
                  <>
                    <Link href={`/${locale}/terms`} target="_blank" className="text-[#0066CC] hover:underline">利用規約</Link>と
                    <Link href={`/${locale}/privacy`} target="_blank" className="text-[#0066CC] hover:underline">プライバシーポリシー</Link>に同意します
                  </>
                ) : (
                  <>
                    Tôi đồng ý với <Link href={`/${locale}/terms`} target="_blank" className="text-[#0066CC] hover:underline">Điều khoản</Link> và <Link href={`/${locale}/privacy`} target="_blank" className="text-[#0066CC] hover:underline">Chính sách bảo mật</Link>
                  </>
                )}
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3 px-4 bg-[#0066CC] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all mt-2',
                isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#0052A3] hover:shadow-md active:scale-[0.98]'
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isJa ? '送信中...' : 'Đang gửi...'}
                </span>
              ) : (
                <>
                  {isJa ? 'ログインリンクを送る' : 'Gửi liên kết đăng nhập'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              {isJa
                ? 'メールに届くリンクをクリックするだけで登録完了。パスワード不要。'
                : 'Chỉ cần nhấn liên kết trong email. Không cần mật khẩu.'}
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isJa ? 'すでにアカウントをお持ちの方は' : 'Đã có tài khoản?'}{' '}
          <Link href={`/${locale}/auth/login`} className="text-[#0066CC] font-semibold hover:underline">
            {isJa ? 'ログイン' : 'Đăng nhập'}
          </Link>
        </p>
      </div>
    </div>
  );
}
