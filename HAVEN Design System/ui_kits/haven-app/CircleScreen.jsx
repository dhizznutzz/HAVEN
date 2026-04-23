// HAVEN — Circle Screen
const CIRCLES = [
  { id:1, name:'UI/UX Bangi', tags:['design','uiux'], members:12, max:20, desc:'Weekly design critique sessions and Figma tutorials.', active:true },
  { id:2, name:'SPM Warriors 2025', tags:['study','spm'], members:28, max:30, desc:'Study group for SPM students. Notes, questions, moral support.', active:false },
  { id:3, name:'Python Malaysia', tags:['python','coding'], members:45, max:50, desc:'Build things together. Beginners welcome!', active:false },
  { id:4, name:'KL Runners Club', tags:['fitness','running'], members:18, max:25, desc:'Weekend runs around KL city. All paces welcome 🏃', active:false },
];

const PILLAR_COLOR = {
  grow: { bg: C.purpleBadge, text: C.purpleText },
  connect: { bg: C.tealBadge, text: C.tealText },
  circle: { bg: C.amberBadge, text: C.amberText },
};

function CircleScreen() {
  const [joined, setJoined] = React.useState(new Set([1]));
  const [tab, setTab] = React.useState('discover');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.gray50 }}>
      <div style={{ background: C.white, padding: '14px 16px 0', borderBottom: `1px solid ${C.gray100}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.gray900 }}>Circle</div>
            <div style={{ fontSize: 12, color: C.gray500 }}>Find your people</div>
          </div>
          <Btn size="sm">
            <PlusIcon size={13} color={C.white} /> New Circle
          </Btn>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          {['discover', 'my circles'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
              color: tab === t ? C.gray900 : C.gray400,
              borderBottom: `2px solid ${tab === t ? C.primary : 'transparent'}`,
              transition: 'all .15s',
            }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 80px' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <SearchIcon size={14} color={C.gray400} />
          </div>
          <input placeholder="Search circles by interest…" style={{
            width: '100%', padding: '10px 12px 10px 34px', borderRadius: 12,
            border: `1.5px solid ${C.gray200}`, fontSize: 13, fontFamily: 'inherit',
            background: C.white, color: C.gray700, outline: 'none', boxSizing: 'border-box',
          }} />
        </div>

        {/* Circles */}
        {CIRCLES.filter(c => tab === 'discover' || joined.has(c.id)).map(circle => {
          const isJoined = joined.has(circle.id);
          const fillPct = Math.round((circle.members / circle.max) * 100);
          return (
            <Card key={circle.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 4, flexWrap: 'wrap' }}>
                    {circle.tags.map(t => (
                      <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: C.amberBadge, color: C.amberText, fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.gray900 }}>{circle.name}</div>
                  <div style={{ fontSize: 12, color: C.gray500, marginTop: 3, lineHeight: 1.5 }}>{circle.desc}</div>
                </div>
                <Btn size="xs" variant={isJoined ? 'success' : 'outlined'}
                  onClick={() => setJoined(s => { const n = new Set(s); isJoined ? n.delete(circle.id) : n.add(circle.id); return n; })}>
                  {isJoined ? <><CheckIcon size={10} color="#065F46"/>Joined</> : 'Join'}
                </Btn>
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: C.gray400 }}>{circle.members}/{circle.max} members</span>
                  <span style={{ fontSize: 11, color: fillPct >= 85 ? '#D97706' : C.gray400 }}>
                    {fillPct >= 85 ? 'Almost full' : `${100 - fillPct}% space left`}
                  </span>
                </div>
                <ProgressBar value={fillPct} color={fillPct >= 85 ? '#F59E0B' : C.purple600} />
              </div>

              {isJoined && (
                <div style={{ marginTop: 10, padding: '8px 10px', background: C.purpleLight, borderRadius: 8, fontSize: 12, color: C.purpleText }}>
                  💬 Next session: Saturday 3PM · Figma critique
                </div>
              )}
            </Card>
          );
        })}

        {tab === 'my circles' && joined.size === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: C.gray400 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⭕</div>
            <div style={{ fontSize: 13 }}>You haven't joined any circles yet</div>
            <button onClick={() => setTab('discover')} style={{ marginTop: 8, fontSize: 13, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Browse circles →</button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { CircleScreen });
