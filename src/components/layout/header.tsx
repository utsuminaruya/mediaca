'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Menu, X, MessageSquare, FileText, Bot, Briefcase } from 'lucide-react';

interface HeaderProps {
  locale: string;
}

const JpMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill="#fff" stroke="rgba(10,27,61,0.15)"/>
    <circle cx="12" cy="12" r="6" fill="#BC002D"/>
  </svg>
);

const VnMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <rect x="1" y="1" width="22" height="22" rx="11" fill="#DA251D"/>
    <path d="M12 6l1.47 4.53H18l-3.76 2.74L15.71 18 12 15.27 8.29 18l1.47-4.73L6 10.53h4.53L12 6z" fill="#FFCD00"/>
  </svg>
);

// ナビアイテム共通スタイル
const navItemStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '8px 12px', borderRadius: 8, fontSize: 13.5, fontWeight: 500,
  color: 'var(--ink-soft)', transition: 'all .2s', textDecoration: 'none',
};

const comingSoonBadge = (label: string): React.ReactNode => (
  <span style={{
    fontSize: 9, fontWeight: 700, color: 'var(--ink-soft)',
    background: 'rgba(10,27,61,0.07)', border: '1px solid rgba(10,27,61,0.12)',
    borderRadius: 4, padding: '1px 5px', letterSpacing: '0.05em',
  }}>{label}</span>
);

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isJa = locale !== 'vi';
  const lineUrl = process.env.NEXT_PUBLIC_LINE_JOBSEEKER || 'https://lin.ee/xUocVyI';

  // 現在のパスのロケール部分だけ入れ替える
  const switchLocalePath = (targetLocale: string) =>
    pathname.replace(/^\/(ja|vi)(\/|$)/, `/${targetLocale}$2`) || `/${targetLocale}`;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(251,249,244,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, padding: '12px 32px',
      }}>

        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link href={`/${locale}`} style={{
          display: 'flex', alignItems: 'center', gap: 9,
          textDecoration: 'none', fontWeight: 800, fontSize: 17,
          color: 'var(--ink)', letterSpacing: '-0.01em', flexShrink: 0,
        }}>
          <Image
            src="/images/logo.png"
            alt="Mediflow Academy"
            width={34}
            height={34}
            style={{ borderRadius: 8, objectFit: 'contain' }}
            priority
          />
          <span>Mediflow <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>Academy</span></span>
        </Link>

        {/* ── Desktop nav ───────────────────────────────────────── */}
        <nav style={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, justifyContent: 'center' }} className="hidden-mobile">

          {/* コース */}
          <Link href={`/${locale}/courses`} style={navItemStyle}
            onMouseEnter={e => { const el = e.currentTarget; el.style.color = 'var(--ink)'; el.style.background = 'rgba(10,27,61,0.04)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'var(--ink-soft)'; el.style.background = 'transparent'; }}
          >
            {isJa ? 'コース' : 'Khóa học'}
          </Link>

          {/* AI家庭教師 */}
          <Link href={`/${locale}/ai-tutor`} style={navItemStyle}
            onMouseEnter={e => { const el = e.currentTarget; el.style.color = 'var(--ink)'; el.style.background = 'rgba(0,102,204,0.06)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'var(--ink-soft)'; el.style.background = 'transparent'; }}
          >
            <Bot size={13} style={{ color: '#0066CC' }} />
            {isJa ? 'Medi先生' : 'Medi-sensei'}
          </Link>

          {/* 就職相談 */}
          <a href={lineUrl} target="_blank" rel="noopener noreferrer" style={navItemStyle}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--ink)'; el.style.background = 'rgba(0,184,148,0.06)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--ink-soft)'; el.style.background = 'transparent'; }}
          >
            <Briefcase size={13} style={{ color: '#00B894' }} />
            {isJa ? '就職相談' : 'Tư vấn việc làm'}
          </a>

          {/* AIロールプレイ 準備中 */}
          <span title={isJa ? 'まもなく開設予定' : 'Sắp ra mắt'} style={{
            ...navItemStyle, color: 'rgba(139,92,246,0.5)', cursor: 'default', userSelect: 'none',
          }}>
            <MessageSquare size={13} style={{ color: 'rgba(139,92,246,0.45)' }} />
            {isJa ? 'AIロールプレイ' : 'Luyện hội thoại'}
            {comingSoonBadge(isJa ? '準備中' : 'Sắp ra mắt')}
          </span>

          {/* 過去問 準備中 */}
          <span title={isJa ? 'まもなく開設予定' : 'Sắp ra mắt'} style={{
            ...navItemStyle, color: 'rgba(59,130,246,0.5)', cursor: 'default', userSelect: 'none',
          }}>
            <FileText size={13} style={{ color: 'rgba(59,130,246,0.45)' }} />
            {isJa ? '過去問' : 'Đề thi'}
            {comingSoonBadge(isJa ? '準備中' : 'Sắp ra mắt')}
          </span>

        </nav>

        {/* ── Desktop right ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }} className="hidden-mobile">
          {/* Language toggle */}
          <div style={{
            display: 'flex', background: 'rgba(10,27,61,0.05)', padding: 3, borderRadius: 8,
            fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
          }}>
            <Link href={switchLocalePath('ja')} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 5, textDecoration: 'none', transition: 'all .2s',
              background: locale === 'ja' ? 'var(--white)' : 'transparent',
              color: locale === 'ja' ? 'var(--ink)' : 'var(--ink-soft)',
              boxShadow: locale === 'ja' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}>
              <JpMark/> 日本語
            </Link>
            <Link href={switchLocalePath('vi')} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 5, textDecoration: 'none', transition: 'all .2s',
              background: locale === 'vi' ? 'var(--white)' : 'transparent',
              color: locale === 'vi' ? 'var(--ink)' : 'var(--ink-soft)',
              boxShadow: locale === 'vi' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}>
              <VnMark/> Tiếng Việt
            </Link>
          </div>

          <Link href={`/${locale}/auth/login`} style={{
            fontSize: 13.5, padding: '8px 14px', fontWeight: 600, color: 'var(--ink)',
            border: '1px solid var(--line-strong)', borderRadius: 8, textDecoration: 'none',
            transition: 'all .2s',
          }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'var(--ink)'; el.style.color = 'var(--cream)'; }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'transparent'; el.style.color = 'var(--ink)'; }}
          >
            {t('login')}
          </Link>
          <Link href={`/${locale}/auth/signup`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10, fontWeight: 600, fontSize: 13.5,
            background: 'var(--ink)', color: 'var(--cream)', textDecoration: 'none',
            transition: 'all .2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink)'; }}
          >
            {t('signup')}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ display: 'none', padding: 8, color: 'var(--ink-soft)', cursor: 'pointer', background: 'none', border: 'none' }}
          className="show-mobile"
        >
          {mobileOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────── */}
      {mobileOpen && (
        <div style={{
          borderTop: '1px solid var(--line)', background: 'var(--cream)',
          padding: '16px 24px 24px',
        }}>
          {/* Active links */}
          {[
            { href: `/${locale}/courses`,   label: isJa ? 'コース' : 'Khóa học', icon: null },
            { href: `/${locale}/ai-tutor`,  label: isJa ? 'Medi先生' : 'Medi-sensei', icon: <Bot size={15} style={{ color: '#0066CC' }} /> },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 0', fontSize: 15, fontWeight: 500,
              color: 'var(--ink-soft)', textDecoration: 'none',
              borderBottom: '1px solid var(--line)',
            }}>
              {item.icon}
              {item.label}
            </Link>
          ))}
          {/* 就職相談 (external) */}
          <a href={lineUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 0', fontSize: 15, fontWeight: 500,
            color: 'var(--ink-soft)', textDecoration: 'none',
            borderBottom: '1px solid var(--line)',
          }}>
            <Briefcase size={15} style={{ color: '#00B894' }} />
            {isJa ? '就職相談（LINE）' : 'Tư vấn việc làm (LINE)'}
          </a>
          {/* AIロールプレイ 準備中 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 0', fontSize: 15, fontWeight: 500,
            color: 'rgba(139,92,246,0.5)',
            borderBottom: '1px solid var(--line)',
          }}>
            <MessageSquare size={15} style={{ color: 'rgba(139,92,246,0.45)' }} />
            {isJa ? 'AIロールプレイ' : 'Luyện hội thoại AI'}
            <span style={{
              fontSize: 9, fontWeight: 700, color: 'var(--ink-soft)',
              background: 'rgba(10,27,61,0.07)', border: '1px solid rgba(10,27,61,0.12)',
              borderRadius: 4, padding: '1px 5px',
            }}>{isJa ? '準備中' : 'Sắp ra mắt'}</span>
          </div>
          {/* 過去問 準備中 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 0', fontSize: 15, fontWeight: 500,
            color: 'rgba(59,130,246,0.5)',
            borderBottom: '1px solid var(--line)',
          }}>
            <FileText size={15} style={{ color: 'rgba(59,130,246,0.45)' }} />
            {isJa ? '過去問' : 'Đề thi'}
            <span style={{
              fontSize: 9, fontWeight: 700, color: 'var(--ink-soft)',
              background: 'rgba(10,27,61,0.07)', border: '1px solid rgba(10,27,61,0.12)',
              borderRadius: 4, padding: '1px 5px',
            }}>{isJa ? '準備中' : 'Sắp ra mắt'}</span>
          </div>

          {/* Language toggle */}
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <Link href={switchLocalePath('ja')} onClick={() => setMobileOpen(false)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none',
              background: locale === 'ja' ? 'var(--primary)' : 'rgba(10,27,61,0.05)',
              color: locale === 'ja' ? '#fff' : 'var(--ink-soft)',
            }}>
              <JpMark/> 日本語
            </Link>
            <Link href={switchLocalePath('vi')} onClick={() => setMobileOpen(false)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none',
              background: locale === 'vi' ? 'var(--primary)' : 'rgba(10,27,61,0.05)',
              color: locale === 'vi' ? '#fff' : 'var(--ink-soft)',
            }}>
              <VnMark/> Tiếng Việt
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            <Link href={`/${locale}/auth/login`} onClick={() => setMobileOpen(false)} style={{
              display: 'block', textAlign: 'center', padding: '12px', borderRadius: 12,
              border: '1px solid var(--line-strong)', fontSize: 15, fontWeight: 600,
              color: 'var(--ink)', textDecoration: 'none',
            }}>
              {t('login')}
            </Link>
            <Link href={`/${locale}/auth/signup`} onClick={() => setMobileOpen(false)} style={{
              display: 'block', textAlign: 'center', padding: '12px', borderRadius: 12,
              background: 'var(--ink)', fontSize: 15, fontWeight: 600,
              color: 'var(--cream)', textDecoration: 'none',
            }}>
              {t('signup')}
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:900px){
          .hidden-mobile{display:none!important}
          .show-mobile{display:flex!important}
        }
      `}</style>
    </header>
  );
}
