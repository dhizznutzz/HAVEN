'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// ── Design tokens (from Landing Page.html) ──────────────────────────────────
const T = {
  bg:         '#080D09',
  bgCard:     'rgba(255,255,255,0.035)',
  bgCardH:    'rgba(255,255,255,0.065)',
  border:     'rgba(255,255,255,0.08)',
  borderH:    'rgba(255,255,255,0.16)',
  sage:       '#6BBF7A',
  sageDim:    'rgba(107,191,122,0.15)',
  cream:      '#EDEAE2',
  cream60:    'rgba(237,234,226,0.60)',
  cream35:    'rgba(237,234,226,0.35)',
  cream15:    'rgba(237,234,226,0.15)',
  grow:       '#9D8FFF',
  growDim:    'rgba(157,143,255,0.12)',
  connect:    '#4ECFAD',
  connectDim: 'rgba(78,207,173,0.12)',
  circle:     '#F0B04A',
  circleDim:  'rgba(240,176,74,0.12)',
  safe:       '#FF8A80',
  safeDim:    'rgba(255,138,128,0.12)',
};

// ── Lucide-style inline SVGs ─────────────────────────────────────────────────
function SproutIcon({ size = 18, color = T.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/>
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
    </svg>
  );
}
function ArrowRightIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
}
function CheckIcon({ color = T.safe }: { color?: string }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function ShieldIcon({ color = T.safe }: { color?: string }) {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

function PillarIcon({ pillar, color, size = 22 }: { pillar: string; color: string; size?: number }) {
  const p: Record<string, React.ReactElement> = {
    grow: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>,
    connect: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
    circle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    safe: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
    bot: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>,
  };
  return p[pillar] ?? null;
}

// ── Reusable components ──────────────────────────────────────────────────────
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.cream35 }}>
      <span style={{ color: T.sage, fontSize: 9 }}>✦</span>
      {children}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.lp-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const root: React.CSSProperties = {
    background: T.bg,
    color: T.cream,
    fontFamily: 'var(--font-body, DM Sans, system-ui, sans-serif)',
    fontSize: 16,
    lineHeight: 1.6,
    overflowX: 'hidden',
    minHeight: '100vh',
  };

  const container: React.CSSProperties = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 40px',
    position: 'relative',
  };

  return (
    <>
      <style>{`
        .lp-reveal { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
        .lp-visible { opacity: 1 !important; transform: none !important; }
        @media (max-width: 900px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-img-grid  { display: none !important; }
          .lp-pillars   { grid-template-columns: 1fr 1fr !important; }
          .lp-problem   { grid-template-columns: 1fr !important; }
          .lp-safe-inner{ grid-template-columns: 1fr !important; gap: 40px !important; }
          .lp-steps     { grid-template-columns: 1fr !important; gap: 40px !important; }
          .lp-steps-line{ display: none !important; }
          .lp-nav-links { display: none !important; }
          .lp-stat-strip{ flex-wrap: wrap !important; }
          .lp-stat-item { flex-basis: 50% !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
          .lp-container { padding: 0 20px !important; }
        }
        @media (max-width: 600px) {
          .lp-pillars { grid-template-columns: 1fr !important; }
          .lp-hero-h1 { font-size: 48px !important; }
        }
      `}</style>

      <div style={root} className="md:-mt-14">

        {/* ── Noise overlay ── */}
        <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, opacity: 0.025 }} />

        {/* ── Nav ── */}
        <nav style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 100,
          background: navScrolled ? 'rgba(8,13,9,0.95)' : 'rgba(8,13,9,0.75)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${T.border}`,
          borderRadius: 9999,
          padding: '10px 10px 10px 20px',
          display: 'flex', alignItems: 'center', gap: 6,
          width: 'min(760px, calc(100vw - 40px))',
          transition: 'background .3s',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: T.cream, textDecoration: 'none', letterSpacing: '-0.01em', marginRight: 4 }}>
            <SproutIcon size={18} color={T.sage} />
            HAVEN
          </Link>
          <div className="lp-nav-links" style={{ display: 'flex', gap: 2, flex: 1 }}>
            {[['#pillars','Platform'],['#how','How it works'],['#safe-space','Safe Space']].map(([href,label])=>(
              <a key={href} href={href} style={{ fontSize: 13, fontWeight: 400, color: T.cream60, textDecoration: 'none', padding: '6px 12px', borderRadius: 9999, transition: 'color .2s, background .2s' }}
                onMouseEnter={e=>{(e.target as HTMLElement).style.color=T.cream;(e.target as HTMLElement).style.background=T.cream15;}}
                onMouseLeave={e=>{(e.target as HTMLElement).style.color=T.cream60;(e.target as HTMLElement).style.background='transparent';}}
              >{label}</a>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: T.cream60, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 9999, fontFamily: 'var(--font-body)', transition: 'color .2s', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/signup" style={{ fontSize: 13, fontWeight: 500, color: T.bg, background: T.sage, border: 'none', cursor: 'pointer', padding: '9px 18px', borderRadius: 9999, fontFamily: 'var(--font-body)', transition: 'background .2s', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>Get started</Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'calc(72px + 60px) 0 100px', position: 'relative', overflow: 'hidden' }}>
          {/* BG orbs */}
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(107,191,122,0.07)', top: -100, right: -200, filter: 'blur(120px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(157,143,255,0.06)', bottom: 0, left: -100, filter: 'blur(120px)', pointerEvents: 'none' }} />
          {/* Orbit rings */}
          <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', border: `1px solid ${T.border}`, top: -80, right: -160, opacity: 0.4, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', border: `1px solid ${T.border}`, top: 80, right: 0, opacity: 0.25, pointerEvents: 'none' }} />

          <div style={container} className="lp-container">
            <div className="lp-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
              {/* Left: copy */}
              <div>
                <div style={{ marginBottom: 28 }}>
                  <Tag>Malaysian Youth Platform ✦ Powered by AI</Tag>
                </div>
                <h1 className="lp-hero-h1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 7.5vw, 104px)', fontWeight: 700, lineHeight: 1.0, letterSpacing: '-0.03em', color: T.cream, maxWidth: '10ch', marginBottom: 28 }}>
                  Grow <em style={{ fontStyle: 'normal', color: T.sage }}>Together.</em>
                </h1>
                <p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: T.cream60, maxWidth: 480, lineHeight: 1.7, marginBottom: 40, fontWeight: 300 }}>
                  The platform where Malaysian youth aged 15–30 develop skills, find opportunities, build circles, and support each other — all in one place.
                </p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link href="/signup" style={{ fontSize: 15, fontWeight: 500, color: T.bg, background: T.sage, border: 'none', cursor: 'pointer', padding: '14px 28px', borderRadius: 9999, fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', transition: 'background .2s' }}>
                    Start for free <ArrowRightIcon />
                  </Link>
                  <a href="#pillars" style={{ fontSize: 14, fontWeight: 500, color: T.cream, background: 'transparent', border: `1px solid ${T.borderH}`, cursor: 'pointer', padding: '12px 24px', borderRadius: 9999, fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', transition: 'border-color .2s, background .2s' }}>
                    See the platform
                  </a>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.cream35, marginTop: 60 }}>
                  <span style={{ color: T.sage }}>✦</span> Built at UPM Hackathon 2025 &nbsp;·&nbsp; Privacy-first by design
                </div>
              </div>

              {/* Right: staggered image grid */}
              <div className="lp-img-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=420&q=80&fit=crop&crop=faces', h: 200, mt: 0 },
                  { src: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=420&q=80&fit=crop&crop=faces', h: 200, mt: 24 },
                  { src: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=420&q=80&fit=crop', h: 160, mt: 0 },
                  { src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=420&q=80&fit=crop&crop=faces', h: 160, mt: -24 },
                ].map((img, i) => (
                  <div key={i} style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.border}`, height: img.h, marginTop: img.mt, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 30%,rgba(8,13,9,0.5) 100%)', zIndex: 1 }} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85) brightness(0.85)', display: 'block' }} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>

            {/* Stat strip */}
            <div className="lp-stat-strip lp-reveal" style={{ display: 'flex', gap: 0, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, marginTop: 80 }}>
              {[
                { num: '4', em: '✦', label: 'Core Pillars' },
                { num: '24', em: '/7', label: 'AI Companion' },
                { num: '100', em: '%', label: 'Anonymous in Safe Space' },
                { num: '15', em: '–30', label: 'Age group served' },
              ].map((s, i) => (
                <div key={i} className="lp-stat-item" style={{ flex: 1, padding: '28px 0', textAlign: 'center', borderRight: i < 3 ? `1px solid ${T.border}` : undefined }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: T.cream, letterSpacing: '-0.03em', display: 'block' }}>
                    {s.num}<em style={{ fontStyle: 'normal', color: T.sage }}>{s.em}</em>
                  </span>
                  <div style={{ fontSize: 12, color: T.cream35, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Problem ── */}
        <section id="problem" style={{ padding: '120px 0', position: 'relative' }}>
          <div style={container} className="lp-container">
            <div className="lp-reveal" style={{ marginBottom: 64 }}>
              <Tag>01 — The Problem</Tag>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 600, letterSpacing: '-0.025em', color: T.cream, lineHeight: 1.1, marginTop: 20 }}>Three walls most youth<br />hit alone.</h2>
              <p style={{ fontSize: 16, color: T.cream60, marginTop: 16, maxWidth: 480, fontWeight: 300, lineHeight: 1.7 }}>Malaysian youth face a fragmented system. Skills with nowhere to apply them. Stress with no one to talk to. Opportunities they never knew existed.</p>
            </div>
            <div className="lp-problem" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { num: '01 — Skills',        accent: T.grow,    accentDim: T.growDim,    pillar: 'grow',    title: 'Learning with no direction',  desc: 'Self-taught youth don\'t know which skills matter. No feedback loop, no community, no pathway from learning to doing.' },
                { num: '02 — Mental Health', accent: T.safe,    accentDim: T.safeDim,    pillar: 'safe',    title: 'Nowhere safe to talk',         desc: 'Stigma around mental health means most students suffer silently. Counselors are scarce. Peers don\'t know what to say.' },
                { num: '03 — Opportunities', accent: T.connect, accentDim: T.connectDim, pillar: 'connect', title: 'Invisible opportunities',       desc: 'Internships, volunteering, and youth programs exist — but discovery is broken. Word-of-mouth isn\'t a system.' },
                { num: '04 — Community',     accent: T.circle,  accentDim: T.circleDim,  pillar: 'circle',  title: 'Isolated by default',          desc: 'University and school environments rarely foster genuine peer connection across interests. Study groups never form.' },
              ].map((c, i) => (
                <div key={i} className="lp-reveal" style={{ border: `1px solid ${T.border}`, borderRadius: 20, padding: 36, background: T.bgCard, transition: 'border-color .25s, background .25s', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.borderH; (e.currentTarget as HTMLElement).style.background = T.bgCardH; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.background = T.bgCard; }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.cream35, marginBottom: 20 }}>{c.num}</div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: c.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <PillarIcon pillar={c.pillar} color={c.accent} size={20} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: T.cream, marginBottom: 12, letterSpacing: '-0.01em' }}>{c.title}</h3>
                  <p style={{ fontSize: 14, color: T.cream60, lineHeight: 1.7 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Platform Pillars ── */}
        <section id="pillars" style={{ padding: '80px 0 120px', position: 'relative' }}>
          <div style={container} className="lp-container">
            <div className="lp-reveal" style={{ marginBottom: 64 }}>
              <Tag>02 — The Platform</Tag>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 600, letterSpacing: '-0.025em', color: T.cream, lineHeight: 1.1, marginTop: 20 }}>Four pillars.<br />One platform.</h2>
              <p style={{ fontSize: 16, color: T.cream60, marginTop: 16, maxWidth: 480, fontWeight: 300, lineHeight: 1.7 }}>HAVEN wraps skill development, opportunity discovery, community building, and mental health support into a single, AI-powered experience.</p>
            </div>
            <div className="lp-pillars" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { id: 'grow',    href: '/grow',       label: 'Grow',       accent: T.grow,    accentDim: T.growDim,    title: 'Skills & Challenges',       desc: 'Share skills, join peer challenges, earn badges, and get AI-powered learning path recommendations tailored to the Malaysian job market.' },
                { id: 'connect', href: '/connect',    label: 'Connect',    accent: T.connect, accentDim: T.connectDim, title: 'Opportunities Near You',    desc: 'Discover volunteering, internships, and programs mapped to your location. AI matches you based on skills and interest.' },
                { id: 'circle',  href: '/circle',     label: 'Circle',     accent: T.circle,  accentDim: T.circleDim,  title: 'Interest Groups',           desc: 'Join study circles, find accountability partners, and build genuine peer relationships around shared interests.' },
                { id: 'safe',    href: '/safe-space', label: 'Safe Space', accent: T.safe,    accentDim: T.safeDim,    title: 'Private Support',           desc: 'Talk to Rakan, our AI companion, or connect with trained peer listeners and licensed counselors — always anonymous.' },
              ].map((p) => (
                <Link key={p.id} href={p.href} className="lp-reveal" style={{ border: `1px solid ${T.border}`, borderRadius: 20, padding: '32px 28px', background: T.bgCard, position: 'relative', overflow: 'hidden', transition: 'transform .25s, border-color .25s, background .25s', cursor: 'pointer', textDecoration: 'none', display: 'block' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = T.borderH; (e.currentTarget as HTMLElement).style.background = T.bgCardH; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.background = T.bgCard; }}
                >
                  {/* Colored top border */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: p.accent, borderRadius: '20px 20px 0 0' }} />
                  <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 9999, background: p.accentDim, color: p.accent, marginBottom: 16 }}>{p.label}</span>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: p.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <PillarIcon pillar={p.id} color={p.accent} size={22} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: T.cream, marginBottom: 10, letterSpacing: '-0.01em' }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: T.cream60, lineHeight: 1.7 }}>{p.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how" style={{ padding: '120px 0', position: 'relative' }}>
          <div style={container} className="lp-container">
            <div className="lp-reveal" style={{ marginBottom: 64, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Tag>03 — How It Works</Tag>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 600, letterSpacing: '-0.025em', color: T.cream, lineHeight: 1.1, marginTop: 20 }}>Up and running<br />in 2 minutes.</h2>
            </div>
            <div className="lp-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, position: 'relative' }}>
              <div className="lp-steps-line" style={{ position: 'absolute', top: 28, left: 'calc(100%/6)', right: 'calc(100%/6)', height: 1, background: T.border }} />
              {[
                { n: '01', title: 'Build your profile',         desc: 'Tell us your skills, interests, and goals. Takes under 2 minutes. No LinkedIn required.' },
                { n: '02', title: 'AI learns your world',       desc: 'HAVEN builds a personalised feed, opportunity matches, and learning path from day one.' },
                { n: '03', title: 'Grow with your community',   desc: 'Share wins, join challenges, find your circle, and reach out when you need support.' },
              ].map((s, i) => (
                <div key={i} className="lp-reveal" style={{ textAlign: 'center', padding: '0 32px' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', border: `1px solid ${T.border}`, background: T.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: T.cream35, position: 'relative', zIndex: 1 }}>{s.n}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: T.cream, marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: T.cream60, lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Safe Space ── */}
        <section id="safe-space" style={{ padding: '120px 0', background: 'linear-gradient(135deg, rgba(255,138,128,0.06) 0%, rgba(8,13,9,0) 60%)', borderTop: '1px solid rgba(255,138,128,0.15)', borderBottom: '1px solid rgba(255,138,128,0.15)' }}>
          <div style={container} className="lp-container">
            <div className="lp-safe-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
              <div className="lp-reveal">
                <Tag>04 — Safe Space</Tag>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 600, letterSpacing: '-0.025em', color: T.cream, lineHeight: 1.15, margin: '20px 0 16px' }}>You don't have to<br />carry it alone.</h2>
                <p style={{ fontSize: 15, color: T.cream60, lineHeight: 1.7, marginBottom: 24, fontWeight: 300 }}>HAVEN's Safe Space is a private, stigma-free environment. Choose between Rakan (our AI companion), trained peer listeners, or licensed counselors. All conversations are anonymous by default.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Anonymous by default — no name, no profile','AI companion Rakan available 24/7','Data never shared with institutions'].map(txt => (
                    <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: T.cream60 }}>
                      <CheckIcon color={T.safe} /> {txt}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 28, padding: '14px 18px', background: 'rgba(255,138,128,0.08)', border: '1px solid rgba(255,138,128,0.2)', borderRadius: 12, fontSize: 13, color: T.cream60 }}>
                  Crisis line — Befrienders Malaysia: <strong style={{ color: T.safe }}>03-7627 2929</strong> · Free, 24/7, confidential
                </div>
              </div>

              <div className="lp-reveal" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Wellbeing photo */}
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 20, overflow: 'hidden', border: `1px solid ${T.border}`, position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800&q=80&fit=crop" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.8) brightness(0.75)' }} loading="lazy" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(8,13,9,0.7) 0%, rgba(255,138,128,0.15) 100%)', display: 'flex', alignItems: 'flex-end', padding: 32 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: T.cream, maxWidth: 360, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                      You don't have to carry it <em style={{ fontStyle: 'normal', color: T.safe }}>alone.</em>
                    </div>
                  </div>
                </div>

                {/* Rakan chat preview */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`, borderRadius: 20, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.safeDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PillarIcon pillar="bot" color={T.safe} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.cream }}>Rakan</div>
                      <div style={{ fontSize: 11, color: T.safe }}>● Online · Anonymous session</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: T.cream35, marginBottom: 4 }}>Rakan 🌿</div>
                      <div style={{ padding: '10px 13px', borderRadius: '4px 18px 18px 18px', fontSize: 13, lineHeight: 1.6, background: 'rgba(255,255,255,0.07)', color: T.cream, border: `1px solid ${T.border}`, maxWidth: '85%' }}>Hi, I'm Rakan. This is a safe, anonymous space. How are you feeling today?</div>
                    </div>
                    <div style={{ alignSelf: 'flex-end', textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: T.cream35, marginBottom: 4, textAlign: 'right' }}>You</div>
                      <div style={{ padding: '10px 13px', borderRadius: '18px 4px 18px 18px', fontSize: 13, lineHeight: 1.6, background: 'rgba(255,138,128,0.18)', color: T.cream, maxWidth: '85%', marginLeft: 'auto' }}>Exam season is really getting to me. I haven't been sleeping well.</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: T.cream35, marginBottom: 4 }}>Rakan 🌿</div>
                      <div style={{ padding: '10px 13px', borderRadius: '4px 18px 18px 18px', fontSize: 13, lineHeight: 1.6, background: 'rgba(255,255,255,0.07)', color: T.cream, border: `1px solid ${T.border}`, maxWidth: '85%' }}>I hear you. Exam stress is real and it takes a toll on your whole body. You're not alone in this.</div>
                    </div>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.safe, background: T.safeDim, padding: '5px 12px', borderRadius: 9999, marginTop: 16 }}>
                    <ShieldIcon color={T.safe} /> Anonymous by default
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '120px 0', textAlign: 'center', background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(107,191,122,0.1) 0%, transparent 70%)' }}>
          <div style={container} className="lp-container">
            <div className="lp-reveal">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><Tag>05 — Join HAVEN</Tag></div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, letterSpacing: '-0.03em', color: T.cream, maxWidth: 700, margin: '0 auto 24px', lineHeight: 1.1 }}>
                The support system<br />Malaysian youth were<br />never <em style={{ fontStyle: 'normal', color: T.sage }}>given.</em>
              </h2>
              <p style={{ fontSize: 16, color: T.cream60, marginBottom: 40, fontWeight: 300 }}>Free to join. Private by design. Built for you.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link href="/signup" style={{ fontSize: 15, fontWeight: 500, color: T.bg, background: T.sage, border: 'none', cursor: 'pointer', padding: '14px 32px', borderRadius: 9999, fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                  Create your profile <ArrowRightIcon />
                </Link>
                <a href="#pillars" style={{ fontSize: 15, fontWeight: 500, color: T.cream, background: 'transparent', border: `1px solid ${T.borderH}`, cursor: 'pointer', padding: '14px 28px', borderRadius: 9999, fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                  Explore the platform
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: `1px solid ${T.border}`, padding: '40px 0' }}>
          <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }} className="lp-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: T.cream }}>
              <SproutIcon size={16} color={T.sage} /> HAVEN
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {[['Feed','/feed'],['Grow','/grow'],['Connect','/connect'],['Safe Space','/safe-space']].map(([label,href])=>(
                <Link key={href} href={href} style={{ fontSize: 13, color: T.cream35, textDecoration: 'none', transition: 'color .2s' }}>{label}</Link>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.cream35 }}>Privacy-first · Anonymous by default · © 2025 HAVEN</div>
          </div>
        </footer>

      </div>
    </>
  );
}
