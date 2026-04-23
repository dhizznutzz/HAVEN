// HAVEN App — Shared UI Components
// Exports all shared primitives to window for cross-file use

// ── Color tokens ──────────────────────────────────────────────
const C = {
  // Brand primary — Sage Green
  primary:     '#4E7A56',
  primaryHover:'#3C6142',
  primaryLight:'#EEF3EC',
  primaryBadge:'#D4E8CE',
  primaryText: '#1C3820',
  // Grow pillar — Purple (semantic, kept)
  purple600: '#7C3AED', purple700: '#6D28D9',
  purpleLight: '#F5F3FF', purpleBadge: '#EDE9FE', purpleText: '#4C1D95',
  // Connect pillar — Teal
  tealLight: '#F0FDF4', tealBadge: '#D1FAE5', tealText: '#065F46',
  // Circle pillar — Amber
  amberLight: '#FFFBEB', amberBadge: '#FEF3C7', amberText: '#78350F',
  // Safe Space pillar — Rose
  roseLight: '#FFF1F2', roseBadge: '#FFE4E6', roseText: '#9F1239',
  // Neutrals
  gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB',
  gray400: '#9CA3AF', gray500: '#6B7280', gray700: '#374151', gray900: '#111827',
  white: '#fff',
};

const PILLAR = {
  grow:       { bg: C.purpleLight, badge: C.purpleBadge, text: C.purpleText, label: 'Grow',       emoji: '🌱' },
  connect:    { bg: C.tealLight,   badge: C.tealBadge,   text: C.tealText,   label: 'Connect',    emoji: '🔗' },
  circle:     { bg: C.amberLight,  badge: C.amberBadge,  text: C.amberText,  label: 'Circle',     emoji: '⭕' },
  safe_space: { bg: C.roseLight,   badge: C.roseBadge,   text: C.roseText,   label: 'Safe Space', emoji: '💙' },
};

// ── Lucide-compatible SVG icons ───────────────────────────────
function Icon({ d, size = 16, color = 'currentColor', strokeWidth = 2, fill = 'none', paths }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {d && <path d={d} />}
      {paths && paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const SproutIcon = ({ size = 16, color = C.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/>
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
  </svg>
);
const HomeIcon = ({ size=20, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const CompassIcon = ({ size=20, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
const UsersIcon = ({ size=20, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const HeartIcon = ({ size=20, color='currentColor', filled=false }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const UserIcon = ({ size=20, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const BellIcon = ({ size=16, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const SearchIcon = ({ size=16, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const PlusIcon = ({ size=16, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const MessageIcon = ({ size=16, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const ShareIcon = ({ size=16, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>;
const SparklesIcon = ({ size=14, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>;
const StarIcon = ({ size=14, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const TrophyIcon = ({ size=14, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const ClockIcon = ({ size=12, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const ShieldIcon = ({ size=14, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const BotIcon = ({ size=18, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>;
const CheckIcon = ({ size=12, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

// ── Reusable UI primitives ────────────────────────────────────

function HavenBottomNav({ active, onNav }) {
  const items = [
    { id: 'feed',       label: 'Home',       Icon: HomeIcon },
    { id: 'grow',       label: 'Grow',       Icon: CompassIcon },
    { id: 'circle',     label: 'Circle',     Icon: UsersIcon },
    { id: 'safe_space', label: 'Safe Space', Icon: HeartIcon },
    { id: 'profile',    label: 'Me',         Icon: UserIcon },
  ];
  return (
    <div style={{
      display: 'flex', height: 64, borderTop: `1px solid ${C.gray100}`,
      background: C.white, paddingBottom: 4,
    }}>
      {items.map(({ id, label, Icon: I }) => {
        const isActive = active === id;
        const color = isActive ? C.primary : C.gray400;
        return (
          <button key={id} onClick={() => onNav(id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 3, background: 'none', border: 'none',
            cursor: 'pointer', padding: '8px 0',
          }}>
            <I size={20} color={color} />
            <span style={{ fontSize: 10, fontWeight: 500, color }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function HavenTopBar({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px 10px', background: C.white,
      borderBottom: `1px solid ${C.gray100}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <SproutIcon size={20} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.gray900, lineHeight: 1.2 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: C.gray400 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {action}
        <button style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gray500, cursor: 'pointer' }}>
          <BellIcon size={16} color={C.gray500} />
        </button>
      </div>
    </div>
  );
}

function PillarBadge({ pillar }) {
  const p = PILLAR[pillar];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 10, fontWeight: 500, padding: '2px 8px',
      borderRadius: 9999, background: p.badge, color: p.text,
    }}>
      {p.emoji} {p.label}
    </span>
  );
}

function Avatar({ name, pillar, size = 36 }) {
  const p = pillar ? PILLAR[pillar] : null;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: p ? p.badge : C.gray100,
      color: p ? p.text : C.gray500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 500,
    }}>
      {name === '?' ? '?' : name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, style: s = {} }) {
  const baseStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    border: 'none', cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'inherit', fontWeight: 500, transition: 'opacity .15s',
    opacity: disabled ? .55 : 1,
  };
  const sizeStyle = size === 'sm'
    ? { padding: '5px 12px', fontSize: 12, borderRadius: 8 }
    : size === 'xs'
    ? { padding: '4px 9px', fontSize: 11, borderRadius: 7 }
    : { padding: '8px 16px', fontSize: 13, borderRadius: 12 };
  const variantStyle =
    variant === 'primary'   ? { background: C.primary, color: C.white } :
    variant === 'ghost'     ? { background: C.gray100, color: C.gray700 } :
    variant === 'success'   ? { background: '#D1FAE5', color: '#065F46' } :
    variant === 'outlined'  ? { background: C.white, color: C.primary, border: `1.5px solid ${C.primaryBadge}` } :
    {};
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...baseStyle, ...sizeStyle, ...variantStyle, ...s }}>
      {children}
    </button>
  );
}

function Card({ children, style: s = {}, hover = true }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: C.white, borderRadius: 12,
        border: `1px solid ${hovered ? C.gray200 : C.gray100}`,
        padding: 16, transition: 'border-color .15s', ...s,
      }}>
      {children}
    </div>
  );
}

function Tag({ children }) {
  return <span style={{ fontSize: 11, color: C.purple600 }}>#{children}</span>;
}

function ProgressBar({ value, color = C.purple600 }) {
  return (
    <div style={{ height: 6, background: C.gray100, borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 9999, transition: 'width .3s' }} />
    </div>
  );
}

// Export everything to window
Object.assign(window, {
  C, PILLAR,
  SproutIcon, HomeIcon, CompassIcon, UsersIcon, HeartIcon, UserIcon,
  BellIcon, SearchIcon, PlusIcon, MessageIcon, ShareIcon,
  SparklesIcon, StarIcon, TrophyIcon, ClockIcon, ShieldIcon, BotIcon, CheckIcon,
  HavenBottomNav, HavenTopBar, PillarBadge, Avatar, Btn, Card, Tag, ProgressBar,
});
