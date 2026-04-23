// HAVEN — Grow Screen
const CHALLENGES = [
  { id:1, skill:'python', title:'Build a Python CLI tool', desc:'Create a command-line tool that solves a real problem in your daily life.', xp:50, participants:234, daysLeft:5, difficulty:'beginner' },
  { id:2, skill:'ui-ux', title:'Design a mobile app mockup', desc:'Use Figma to design 3 screens for an app idea. Focus on user experience.', xp:75, participants:189, daysLeft:8, difficulty:'intermediate' },
  { id:3, skill:'discipline', title:'30-Day Consistency Challenge', desc:'Post your learning progress every day for 30 days.', xp:200, participants:512, daysLeft:22, difficulty:'advanced' },
];
const SKILL_RECS = [
  { name:'Data Analysis', reason:'High demand in Malaysian tech sector', resources:['Kaggle','Google Certificate'] },
  { name:'UI/UX Design', reason:'Growing market for digital products in SEA', resources:['Figma Community','YouTube'] },
  { name:'Cloud Computing', reason:'AWS/Azure skills are scarce locally', resources:['AWS Free Tier','freeCodeCamp'] },
];
const DIFF_COLOR = {
  beginner: { bg:'#D1FAE5', color:'#065F46' },
  intermediate: { bg:'#FEF3C7', color:'#78350F' },
  advanced: { bg:'#FEE2E2', color:'#991B1B' },
};

function GrowScreen() {
  const [joined, setJoined] = React.useState(new Set());
  const level = 3, points = 430, nextLevel = 600;
  const progress = Math.round((points / nextLevel) * 100);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: C.gray50 }}>
      <div style={{ background: C.white, padding: '14px 16px 12px', borderBottom: `1px solid ${C.gray100}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.gray900 }}>Grow</div>
            <div style={{ fontSize: 12, color: C.gray500 }}>Skills, challenges, learning</div>
          </div>
          <Btn size="sm">
            <PlusIcon size={13} color={C.white} />
            Share
          </Btn>
        </div>
      </div>

      <div style={{ padding: '12px 12px 80px' }}>
        {/* Level progress */}
        <Card style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.purpleBadge, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StarIcon size={16} color={C.purple600} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.gray900 }}>Level {level}</div>
                <div style={{ fontSize: 11, color: C.gray500 }}>{points} total XP</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: C.gray400 }}>Next level</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: C.purple600 }}>{nextLevel - points} XP to go</div>
            </div>
          </div>
          <ProgressBar value={progress} />
          <div style={{ fontSize: 11, color: C.gray400, marginTop: 4 }}>{points}/{nextLevel} XP to Level {level+1}</div>
        </Card>

        {/* Skills */}
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: C.gray400, marginBottom: 8 }}>Your Skills</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Python', 'Design'].map(s => (
              <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: C.purpleBadge, color: C.purpleText, fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 8 }}>
                <CheckIcon size={11} color={C.purpleText} />{s}
              </span>
            ))}
          </div>
        </Card>

        {/* AI Picks */}
        <div style={{ background: C.purpleLight, borderRadius: 12, padding: 14, border: `1px solid #DDD6FE`, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <SparklesIcon size={14} color={C.purple600} />
            <span style={{ fontSize: 12, fontWeight: 600, color: C.purpleText }}>AI Skill Picks for You</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SKILL_RECS.map((r, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.gray900 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: C.gray500, marginTop: 2 }}>{r.reason}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {r.resources.map(res => (
                    <span key={res} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: C.gray100, color: C.gray500 }}>{res}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges */}
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: C.gray400, marginBottom: 8 }}>Active Challenges</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CHALLENGES.map(c => {
            const isJoined = joined.has(c.id);
            const dc = DIFF_COLOR[c.difficulty];
            return (
              <Card key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: C.purple600 }}>#{c.skill}</span>
                      <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 9999, fontWeight: 500, background: dc.bg, color: dc.color }}>{c.difficulty}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.gray900 }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: C.gray500, marginTop: 3, lineHeight: 1.5 }}>{c.desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D97706', flexShrink: 0 }}>
                    <TrophyIcon size={13} color="#D97706" />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{c.xp} XP</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 11, color: C.gray400, display: 'flex', gap: 4, alignItems: 'center' }}>
                      <UsersIcon size={12} color={C.gray400} /> {c.participants} joined
                    </span>
                    <span style={{ fontSize: 11, color: C.gray400, display: 'flex', gap: 4, alignItems: 'center' }}>
                      <ClockIcon size={11} color={C.gray400} /> {c.daysLeft}d left
                    </span>
                  </div>
                  <Btn size="xs" variant={isJoined ? 'success' : 'primary'}
                    onClick={() => setJoined(s => { const n = new Set(s); n.add(c.id); return n; })}>
                    {isJoined ? <><CheckIcon size={11} color="#065F46" /> Joined!</> : 'Join'}
                  </Btn>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GrowScreen });
