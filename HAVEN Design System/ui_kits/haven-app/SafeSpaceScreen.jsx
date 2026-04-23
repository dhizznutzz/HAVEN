// HAVEN — Safe Space Screen
function SafeSpaceScreen() {
  const [mode, setMode] = React.useState(null); // null | 'ai' | 'peer' | 'counselor'
  const [messages, setMessages] = React.useState([
    { role: 'assistant', content: "Hi, I'm Rakan 🌿 This is a safe, anonymous space. How are you feeling today?" }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const endRef = React.useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'assistant', content: "I hear you. It sounds like you're going through a lot right now. You're not alone — many students feel this way during exam season. What would help you most right now: to vent, or to talk about some coping strategies?" }]);
      setLoading(false);
    }, 1400);
  };

  if (mode === 'ai') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.white }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${C.gray100}`, background: C.white, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.primary, fontSize: 13, fontFamily: 'inherit', padding: 0, fontWeight: 500 }}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BotIcon size={16} color="#9F1239" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.gray900 }}>Rakan</div>
              <div style={{ fontSize: 10, color: '#10B981' }}>● Available now · Anonymous</div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%', padding: '10px 13px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: 13, lineHeight: 1.6,
                background: m.role === 'user' ? C.primary : C.gray100,
                color: m.role === 'user' ? C.white : C.gray700,
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '8px 12px', background: C.gray100, borderRadius: '12px 12px 12px 4px', width: 'fit-content' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: C.gray400, animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '10px 14px 14px', borderTop: `1px solid ${C.gray100}`, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a message…"
            rows={1}
            style={{ flex: 1, border: `1.5px solid ${C.gray200}`, borderRadius: 12, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none', maxHeight: 80, overflowY: 'auto' }}
          />
          <button onClick={sendMessage} style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: C.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/></svg>
          </button>
        </div>

        <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
      </div>
    );
  }

  // Mode selector
  const MODES = [
    { id:'ai', icon: BotIcon, iconColor:'#9F1239', title:'Talk to Rakan', subtitle:'AI companion', desc:'A warm, empathetic AI companion. Available 24/7. Fully anonymous.', badge:'Available now', badgeBg:'#FFE4E6', badgeColor:'#9F1239', border:'#FECDD3', hoverBg:'#FFF1F2' },
    { id:'peer', icon: UsersIcon, iconColor:'#78350F', title:'Peer Listener', subtitle:'Trained youth volunteer', desc:'Chat with a trained peer listener from our community. Anonymous.', badge:'~5 min wait', badgeBg:'#FEF3C7', badgeColor:'#78350F', border:'#FDE68A', hoverBg:'#FFFBEB' },
    { id:'counselor', icon: UserIcon, iconColor:'#065F46', title:'Counselor', subtitle:'Professional support', desc:'Connect with a licensed counselor. For when you need expert help.', badge:'Book session', badgeBg:'#D1FAE5', badgeColor:'#065F46', border:'#BBF7D0', hoverBg:'#F0FDF4' },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: C.white }}>
      <div style={{ padding: '28px 20px 16px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFE4E6', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HeartIcon size={26} color="#9F1239" />
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: C.gray900 }}>Safe Space</div>
        <p style={{ fontSize: 13, color: C.gray500, marginTop: 6, lineHeight: 1.6, maxWidth: 280, margin: '6px auto 0' }}>
          This is a private, judgment-free space. Choose how you'd like to connect today.
        </p>
      </div>

      {/* Anon badge */}
      <div style={{ margin: '0 16px 20px', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <ShieldIcon size={14} color="#9F1239" />
        <p style={{ margin: 0, fontSize: 12, color: '#9F1239', lineHeight: 1.5 }}>
          All conversations here are <strong>anonymous by default</strong>. Your name and profile are never shown.
        </p>
      </div>

      {/* Mode cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
        {MODES.map(m => {
          const I = m.icon;
          return (
            <button key={m.id} onClick={() => m.id === 'ai' && setMode('ai')} style={{
              width: '100%', border: `2px solid ${m.border}`, borderRadius: 14,
              background: C.white, padding: '14px', textAlign: 'left', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = m.hoverBg}
              onMouseLeave={e => e.currentTarget.style.background = C.white}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <I size={18} color={m.iconColor} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.gray900 }}>{m.title}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: m.badgeBg, color: m.badgeColor, fontWeight: 500 }}>{m.badge}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.gray400, marginTop: 1 }}>{m.subtitle}</div>
                  <div style={{ fontSize: 12, color: C.gray600 || C.gray500, marginTop: 5, lineHeight: 1.5 }}>{m.desc}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Crisis footer */}
      <div style={{ margin: '20px 16px 24px', padding: 14, background: C.gray50, borderRadius: 12, border: `1px solid ${C.gray100}`, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: C.gray500, marginBottom: 4 }}>Need immediate support?</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.gray900 }}>Befrienders Malaysia: <span style={{ color: '#9F1239' }}>03-7627 2929</span></div>
        <div style={{ fontSize: 11, color: C.gray400, marginTop: 2 }}>Free, 24/7, confidential</div>
      </div>
    </div>
  );
}

Object.assign(window, { SafeSpaceScreen });
