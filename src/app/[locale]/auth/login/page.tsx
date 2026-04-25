'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default function LoginPage({ params }: LoginPageProps) {
  const { locale } = use(params);
  const router = useRouter();
  const isJa = locale === 'ja';

  const [tab, setTab] = useState<'oauth' | 'magic' | 'password'>('oauth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const handleOAuth = async (provider: 'google' | 'facebook') => {
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
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard` },
      });
      if (authError) {
        setError(isJa ? `${provider === 'google' ? 'Google' : 'Facebook'}ログインに失敗しました` : `Đăng nhập thất bại`);
        setLoading(false);
      }
    } catch {
      setError(isJa ? 'エラーが発生しました' : 'Đã xảy ra lỗi');
      setLoading(false);
    }
  };

  // マジックリンク送信
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      setTimeout(() => router.push(`/${locale}/dashboard`), 800);
      return;
    }
    try {
      const supabase = createClient();
      const { error: authError } = await supabase!.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
        },
      });
      if (authError) {
        setError(authError.message);
        setIsLoading(false);
      } else {
        setSentEmail(email);
        setMagicSent(true);
        setIsLoading(false);
      }
    } catch {
      setError(isJa ? 'エラーが発生しました' : 'Đã xảy ra lỗi');
      setIsLoading(false);
    }
  };

  // パスワードログイン
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      setTimeout(() => router.push(`/${locale}/dashboard`), 800);
      return;
    }
    try {
      const supabase = createClient();
      const { error: authError } = await supabase!.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(isJa ? 'メールアドレスまたはパスワードが正しくありません' : 'Email hoặc mật khẩu không đúng');
        setIsLoading(false);
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch {
      setError(isJa ? 'エラーが発生しました' : 'Đã xảy ra lỗi');
      setIsLoading(false);
    }
  };

  // ── マジックリンク送信完了 ────────────────────────────────────────
  if (magicSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-9 w-9 text-[#00B894]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isJa ? 'ログインリンクを送りました！' : 'Đã gửi liên kết đăng nhập!'}
          </h1>
          <p className="text-gray-500 mb-6 leading-relaxed text-sm">
            {isJa
              ? `${sentEmail} にメールを送りました。メール内のボタンをクリックしてログインしてください。`
              : `Đã gửi email đến ${sentEmail}. Nhấn nút trong email để đăng nhập.`}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-4">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                {isJa
                  ? '届かない場合は迷惑メールフォルダを確認してください。リンクの有効期限は1時間です。'
                  : 'Không thấy email? Kiểm tra thư mục spam. Liên kết có hiệu lực 1 giờ.'}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setMagicSent(false); setEmail(''); }}
            className="text-[#0066CC] font-semibold hover:underline text-sm"
          >
            {isJa ? '← 戻る' : '← Quay lại'}
          </button>
        </div>
      </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-6">
            <Image src="/images/logo.png" alt="Mediflow Academy" width={40} height={40} style={{ borderRadius: 10, objectFit: 'contain' }} />
            <span className="font-bold text-xl text-gray-900">Mediflow <span className="text-[#0066CC]">Academy</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isJa ? 'ログイン' : 'Đăng nhập'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isJa ? 'アカウントにログインして学習を続けよう' : 'Đăng nhập để tiếp tục học tập'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">

          {/* ── Google ── */}
          <button
            onClick={() => handleOAuth('google')}
            disabled={isGoogleLoading}
            className={cn(
              'w-full py-3 px-4 border border-gray-200 rounded-xl flex items-center justify-center gap-3 text-sm font-medium text-gray-700 transition-all mb-3',
              isGoogleLoading ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 hover:border-gray-300'
            )}
          >
            {isGoogleLoading
              ? <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : <GoogleIcon />}
            {isJa ? 'Googleでログイン' : 'Đăng nhập với Google'}
          </button>

          {/* ── Facebook ── */}
          <button
            onClick={() => handleOAuth('facebook')}
            disabled={isFacebookLoading}
            className={cn(
              'w-full py-3 px-4 border border-gray-200 rounded-xl flex items-center justify-center gap-3 text-sm font-medium text-gray-700 transition-all mb-5',
              isFacebookLoading ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 hover:border-gray-300'
            )}
          >
            {isFacebookLoading
              ? <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : <FacebookIcon />}
            {isJa ? 'Facebookでログイン' : 'Đăng nhập với Facebook'}
          </button>

          {/* ── タブ切替 ── */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden mb-5">
            <button
              onClick={() => { setTab('magic'); setError(''); }}
              className={cn(
                'flex-1 py-2.5 text-xs font-semibold transition-all',
                tab === 'magic' ? 'bg-[#0066CC] text-white' : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              {isJa ? 'メールリンク' : 'Liên kết email'}
            </button>
            <button
              onClick={() => { setTab('password'); setError(''); }}
              className={cn(
                'flex-1 py-2.5 text-xs font-semibold transition-all',
                tab === 'password' ? 'bg-[#0066CC] text-white' : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              {isJa ? 'パスワード' : 'Mật khẩu'}
            </button>
          </div>

          {/* ── マジックリンク ── */}
          {tab === 'magic' && (
            <form onSubmit={handleMagicLink} className="space-y-4">
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
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full py-3 px-4 bg-[#0066CC] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all',
                  isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#0052A3] hover:shadow-md'
                )}
              >
                {isLoading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isJa ? '送信中...' : 'Đang gửi...'}</span>
                  : <>{isJa ? 'ログインリンクを送る' : 'Gửi liên kết đăng nhập'}<ArrowRight className="h-4 w-4" /></>}
              </button>
              <p className="text-center text-xs text-gray-400">
                {isJa ? 'メールに届くリンクをクリックするだけでログイン。パスワード不要。' : 'Nhấn liên kết trong email để đăng nhập. Không cần mật khẩu.'}
              </p>
            </form>
          )}

          {/* ── パスワード ── */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
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
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    {isJa ? 'パスワード' : 'Mật khẩu'}
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/10 transition-all bg-gray-50 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full py-3 px-4 bg-[#0066CC] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all',
                  isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#0052A3] hover:shadow-md active:scale-[0.98]'
                )}
              >
                {isLoading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isJa ? 'ログイン中...' : 'Đang đăng nhập...'}</span>
                  : <>{isJa ? 'ログイン' : 'Đăng nhập'}<ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isJa ? 'アカウントをお持ちでない方は' : 'Chưa có tài khoản?'}{' '}
          <Link href={`/${locale}/auth/signup`} className="text-[#0066CC] font-semibold hover:underline">
            {isJa ? '無料登録' : 'Đăng ký miễn phí'}
          </Link>
        </p>
      </div>
    </div>
  );
}
