// HAVEN — Feed Screen
const POSTS = [
  { id:1, author:'Fariz', pillar:'grow', anon:false, content:'Just completed my first Python script to automate my study schedule! Coding really does solve real problems 🐍', tags:['python','automation','beginner'], likes:24, time:'2h ago' },
  { id:2, author:'Siti Aishah', pillar:'connect', anon:false, content:"Looking for volunteers for our Hari Raya community clean-up in Cheras this Saturday! Free lunch provided. Let's make our neighbourhood shine ✨", tags:['volunteer','community','kuala-lumpur'], likes:18, time:'5h ago' },
  { id:3, author:'?', pillar:'safe_space', anon:true, content:"Exam season is rough. Anyone else feel like they're running on 3 hours of sleep and pure anxiety? SPM really tests more than just knowledge 😮‍💨", tags:['exam','stress'], likes:41, time:'8h ago' },
  { id:4, author:'Priya', pillar:'circle', anon:false, content:'Our UI/UX Bangi Circle had our first design critique session! Everyone gave such thoughtful feedback. DM if you want to join 💜', tags:['uiux','design','bangi'], likes:33, time:'12h ago' },
];

function FeedScreen({ onNav }) {
  const [filter, setFilter] = React.useState('all');
  const [likedIds, setLikedIds] = React.useState(new Set());
  const [showCreate, setShowCreate] = React.useState(false);

  const filters = ['all', 'grow', 'connect', 'circle', 'safe_space'];
  const filterLabel = { all:'All', grow:'Grow', connect:'Connect', circle:'Circle', safe_space:'Safe Space' };
  const filtered = filter === 'all' ? POSTS : POSTS.filter(p => p.pillar === filter);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.gray50 }}>
      <HavenTopBar title="HAVEN" subtitle="Grow Together" />

      {/* Filter tabs */}
      <div style={{ background: C.white, padding: '8px 12px', borderBottom: `1px solid ${C.gray100}`, display: 'flex', gap: 5, overflowX: 'auto' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'inherit',
            background: filter === f ? C.white : 'transparent',
            color: filter === f ? C.gray900 : C.gray500,
            boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
            transition: 'all .15s',
          }}>{filterLabel[f]}</button>
        ))}
      </div>

      {/* Posts */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 80px' }}>
        {filtered.map(post => {
          const liked = likedIds.has(post.id);
          return (
            <Card key={post.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <Avatar name={post.anon ? '?' : post.author} pillar={post.pillar} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.gray900 }}>
                      {post.anon ? 'Anonymous' : post.author}
                    </span>
                    <PillarBadge pillar={post.pillar} />
                    <span style={{ fontSize: 11, color: C.gray400, marginLeft: 'auto' }}>{post.time}</span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: C.gray700, lineHeight: 1.6 }}>{post.content}</p>
                  <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                    {post.tags.map(t => <span key={t} style={{ fontSize: 11, color: C.primary }}>#{t}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, alignItems: 'center' }}>
                    <button onClick={() => setLikedIds(s => { const n = new Set(s); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n; })}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#EF4444' : C.gray400, fontSize: 12, fontFamily: 'inherit', padding: 0 }}>
                      <HeartIcon size={14} color={liked ? '#EF4444' : C.gray400} filled={liked} />
                      {post.likes + (liked ? 1 : 0)}
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: C.gray400, padding: 0 }}>
                      <MessageIcon size={14} color={C.gray400} />
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: C.gray400, marginLeft: 'auto', padding: 0 }}>
                      <ShareIcon size={14} color={C.gray400} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* FAB */}
      <button onClick={() => setShowCreate(true)} style={{
        position: 'absolute', bottom: 80, right: 16,
        width: 48, height: 48, borderRadius: '50%', border: 'none',
        background: C.primary, color: C.white, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(78,122,86,.4)',
      }}>
        <PlusIcon size={20} color={C.white} />
      </button>

      {/* Compose sheet */}
      {showCreate && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}>
          <div style={{ background: C.white, borderRadius: '20px 20px 0 0', width: '100%', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.gray900 }}>Share something</span>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.gray400, lineHeight: 1 }}>×</button>
            </div>
            <textarea placeholder="What's on your mind? Share a win, a learning, or ask for support…"
              style={{ width: '100%', height: 90, border: `1.5px solid ${C.gray200}`, borderRadius: 12, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', color: C.gray700, resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <Btn onClick={() => setShowCreate(false)}>Post</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { FeedScreen });
