'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2, Mail, Lock, Sparkles, ChevronRight, Check, ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

// ─── palette ────────────────────────────────────────────────────────────────
const C = {
  bg: '#080D09',
  card: 'rgba(255,255,255,0.035)',
  cardHover: 'rgba(255,255,255,0.065)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  sage: '#6BBF7A',
  sageDim: 'rgba(107,191,122,0.15)',
  cream: '#EDEAE2',
  cream60: 'rgba(237,234,226,0.60)',
  cream35: 'rgba(237,234,226,0.35)',
  safe: '#FF8A80',
};

const DISPLAY = "font-['DM_Sans'] tracking-tight";

// ─── onboarding data ─────────────────────────────────────────────────────────
const AGE_GROUPS = [
  { value: 'u18',   label: 'Under 18',  sub: 'School student' },
  { value: '18-21', label: '18 – 21',   sub: 'College / uni' },
  { value: '22-25', label: '22 – 25',   sub: 'Fresh grad' },
  { value: '26-30', label: '26 – 30',   sub: 'Working / postgrad' },
];
const GOALS = [
  { value: 'skills',    emoji: '📚', label: 'Learn & grow skills' },
  { value: 'community', emoji: '🤝', label: 'Find my community' },
  { value: 'wellness',  emoji: '🌱', label: 'Take care of myself' },
  { value: 'jobs',      emoji: '💼', label: 'Jobs & internships' },
];
const INTERESTS = [
  'Technology','Design','Business','Science','Arts & Culture',
  'Sports','Music','Environment','Mental Health','Gaming',
  'Writing','Social Impact','Photography','Entrepreneurship','Education',
];

function toUsername(name: string) {
  return name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'').slice(0,20);
}

// ─── component ───────────────────────────────────────────────────────────────
export default function AuthForm({ defaultTab }: { defaultTab: 'signin' | 'signup' }) {
  const [activeTab, setActiveTab]   = useState<'signin' | 'signup'>(defaultTab);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  // sign-in fields
  const [siEmail, setSiEmail]       = useState('');
  const [siPassword, setSiPassword] = useState('');

  // sign-up — step 1
  const [suEmail, setSuEmail]       = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm]   = useState('');

  // sign-up — step 2 (identity)
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername]       = useState('');
  const [ageGroup, setAgeGroup]       = useState('');
  const [goal, setGoal]               = useState('');

  // sign-up — step 3 (interests)
  const [interests, setInterests]   = useState<string[]>([]);

  const [signupStep, setSignupStep] = useState(1);

  const router = useRouter();

  // redirect already-logged-in users
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/feed');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && signupStep === 1 && activeTab === 'signin') router.replace('/feed');
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchTab = (t: 'signin' | 'signup') => {
    setActiveTab(t);
    setError('');
    setSuccess('');
    setSignupStep(1);
  };

  // ── sign in ────────────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({ email: siEmail, password: siPassword });
      if (err) {
        setError(err.message);
      } else {
        toast.success('Welcome back!');
        router.push('/feed');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── sign up step nav ───────────────────────────────────────────────────────
  const handleSignupNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (signupStep === 1) {
      if (suPassword !== suConfirm) { setError('Passwords do not match.'); return; }
      if (suPassword.length < 8)    { setError('Password must be at least 8 characters.'); return; }
      setSignupStep(2);
    } else if (signupStep === 2) {
      if (!displayName.trim() || username.length < 3 || !ageGroup || !goal) {
        setError('Please fill in all fields.'); return;
      }
      setSignupStep(3);
    } else {
      handleSignupSubmit();
    }
  };

  const handleSignupSubmit = async () => {
    if (interests.length < 3) { setError('Pick at least 3 interests.'); return; }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const supabase = createClient();
      const { data, error: signUpErr } = await supabase.auth.signUp({ email: suEmail, password: suPassword });

      if (signUpErr) {
        const msg = signUpErr.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already in use')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(signUpErr.message);
        }
        setSignupStep(1);
        return;
      }
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('An account with this email already exists. Please sign in instead.');
        setSignupStep(1);
        return;
      }
      if (!data.user) throw new Error('Could not create account — please try again.');

      const { error: profileErr } = await supabase.from('profiles').insert({
        id:           data.user.id,
        username,
        display_name: displayName.trim(),
        age_group:    ageGroup,
        goal,
        interests,
        skills:       [],
      });
      if (profileErr) throw profileErr;

      toast.success('Welcome to HAVEN!');
      router.push('/feed');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (item: string) =>
    setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);

  const handleNameChange = (val: string) => {
    setDisplayName(val);
    setUsername(toUsername(val));
  };

  // ── shared input style ─────────────────────────────────────────────────────
  const inputCls = 'w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm font-medium text-[#EDEAE2] placeholder:text-white/35 transition focus:border-[#6BBF7A] focus:outline-none focus:ring-2 focus:ring-[#6BBF7A]/25';

  const signupStepTitles = ['Your details', 'About you', 'Your interests'];
  const signupStepSubs   = ['Create your login', 'Helps us personalise everything', 'Pick at least 3'];

  return (
    <div
      className={`${DISPLAY} relative min-h-screen overflow-x-hidden text-[#EDEAE2]`}
      style={{ backgroundColor: C.bg }}
    >
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />
      <div aria-hidden className="pointer-events-none fixed -right-32 -top-24 h-[32rem] w-[32rem] rounded-full blur-[120px]" style={{ background: 'rgba(107,191,122,0.08)' }} />
      <div aria-hidden className="pointer-events-none fixed -left-20 bottom-0 h-[24rem] w-[24rem] rounded-full blur-[120px]" style={{ background: 'rgba(157,143,255,0.06)' }} />

      <style>{`
        .haven-tab-active { background: rgba(107,191,122,0.18); color: ${C.cream}; border-color: rgba(107,191,122,0.35); }
        .input-wrap { position:relative; }
        .input-wrap svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); width:16px; height:16px; color: rgba(237,234,226,0.35); pointer-events:none; }
      `}</style>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2">
          <div className="hidden lg:flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em]" style={{ borderColor: C.border, color: C.cream35 }}>
              <Sparkles className="h-3.5 w-3.5" style={{ color: C.sage }} />
              Haven Design Language
            </div>
            <h1 className="font-semibold leading-[0.95]" style={{ fontSize: 'clamp(46px,6vw,92px)', letterSpacing: '-0.03em' }}>
              {activeTab === 'signin' ? (
                <>Welcome <span style={{ color: C.sage }}>Back.</span></>
              ) : (
                <>Join <span style={{ color: C.sage }}>HAVEN.</span></>
              )}
            </h1>
            <p className="max-w-md text-base leading-relaxed" style={{ color: C.cream60 }}>
              {activeTab === 'signin'
                ? 'Your community, goals, and support network are right where you left them.'
                : 'Create your profile to start growing skills, finding opportunities, and building your circle.'}
            </p>
          </div>

          {/* ── RIGHT: auth card ── */}
          <div className="flex flex-col gap-5">
            {/* mobile logo */}
            <div className="lg:hidden flex items-center gap-2 justify-center">
              <Sparkles className="h-5 w-5" style={{ color: C.sage }} />
              <span className="text-xl font-semibold tracking-tight">HAVEN</span>
            </div>

            <div className="rounded-[28px] border p-8 backdrop-blur-xl"
              style={{ borderColor: C.borderStrong, background: C.card, boxShadow: '0 24px 80px rgba(0,0,0,0.35)' }}>

              {/* tab switcher — hidden during sign-up steps 2/3 */}
              {!(activeTab === 'signup' && signupStep > 1) && (
                <div className="mb-7 flex gap-2 rounded-full border p-1" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                  {(['signin','signup'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => switchTab(t)}
                      className={`flex-1 rounded-full border py-2.5 text-sm font-medium transition-all duration-200 ${activeTab === t ? 'haven-tab-active' : 'border-transparent text-white/60 hover:text-white'}`}
                    >
                      {t === 'signin' ? 'Sign In' : 'Sign Up'}
                    </button>
                  ))}
                </div>
              )}

              {/* sign-up step header (steps 2 & 3) */}
              {activeTab === 'signup' && signupStep > 1 && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => { setSignupStep(s => s - 1); setError(''); }}
                      className="rounded-xl border p-1.5 transition-colors hover:bg-white/5"
                      style={{ borderColor: C.borderStrong }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="text-base font-semibold leading-none">{signupStepTitles[signupStep - 1]}</div>
                      <div className="mt-0.5 text-xs" style={{ color: C.cream35 }}>{signupStepSubs[signupStep - 1]}</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {[1,2,3].map(s => (
                      <div key={s} className="h-1.5 flex-1 rounded-full transition-all"
                        style={{ background: s <= signupStep ? C.sage : C.border }} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── SIGN IN form ── */}
              {activeTab === 'signin' && (
                <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium" htmlFor="si-email">Email</label>
                    <div className="input-wrap">
                      <Mail />
                      <input id="si-email" type="email" placeholder="you@email.com" required
                        value={siEmail} onChange={e => setSiEmail(e.target.value)} className={inputCls} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium" htmlFor="si-pw">Password</label>
                    <div className="input-wrap">
                      <Lock />
                      <input id="si-pw" type="password" placeholder="••••••••" required
                        value={siPassword} onChange={e => setSiPassword(e.target.value)} className={inputCls} />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border px-4 py-2.5 text-sm font-medium text-red-200" style={{ borderColor: 'rgba(255,138,128,0.5)', background: 'rgba(255,138,128,0.12)' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-full border py-3.5 text-sm font-medium text-[#080D09] transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ background: C.sage, borderColor: C.sage }}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {isLoading ? 'Signing in…' : 'Continue'}
                  </button>
                </form>
              )}

              {/* ── SIGN UP forms ── */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignupNext} className="flex flex-col gap-4">

                  {/* step 1: email + password */}
                  {signupStep === 1 && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium" htmlFor="su-email">Email</label>
                        <div className="input-wrap">
                          <Mail />
                          <input id="su-email" type="email" placeholder="you@email.com" required
                            value={suEmail} onChange={e => setSuEmail(e.target.value)} className={inputCls} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium" htmlFor="su-pw">Password</label>
                        <div className="input-wrap">
                          <Lock />
                          <input id="su-pw" type="password" placeholder="Min 8 characters" required
                            value={suPassword} onChange={e => setSuPassword(e.target.value)} className={inputCls} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium" htmlFor="su-cpw">Confirm Password</label>
                        <div className="input-wrap">
                          <Lock />
                          <input id="su-cpw" type="password" placeholder="••••••••" required
                            value={suConfirm} onChange={e => setSuConfirm(e.target.value)} className={inputCls} />
                        </div>
                      </div>
                    </>
                  )}

                  {/* step 2: name + age + goal */}
                  {signupStep === 2 && (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <input type="text" value={displayName} onChange={e => handleNameChange(e.target.value)}
                          placeholder="Your name" required
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-[#EDEAE2] placeholder:text-white/35 focus:border-[#6BBF7A] focus:outline-none focus:ring-2 focus:ring-[#6BBF7A]/25" />
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/35">@</span>
                          <input type="text" value={username}
                            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))}
                            placeholder="username" required pattern="[a-z0-9_]+" minLength={3}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-8 pr-4 text-sm font-medium text-[#EDEAE2] placeholder:text-white/35 focus:border-[#6BBF7A] focus:outline-none focus:ring-2 focus:ring-[#6BBF7A]/25" />
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold" style={{ color: C.cream35 }}>How old are you?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {AGE_GROUPS.map(a => (
                            <button key={a.value} type="button" onClick={() => setAgeGroup(a.value)}
                              className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                                ageGroup === a.value
                                  ? 'text-[#EDEAE2]'
                                  : 'text-white/65 hover:text-white/85'
                              }`}
                              style={{
                                borderColor: ageGroup === a.value ? 'rgba(107,191,122,0.5)' : C.border,
                                background: ageGroup === a.value ? C.sageDim : 'rgba(255,255,255,0.02)',
                              }}>
                              <div className="text-xs font-semibold">{a.label}</div>
                              <div className="text-[10px] opacity-60">{a.sub}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold" style={{ color: C.cream35 }}>What brings you to HAVEN?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {GOALS.map(g => (
                            <button key={g.value} type="button" onClick={() => setGoal(g.value)}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                                goal === g.value
                                  ? 'text-[#EDEAE2]'
                                  : 'text-white/65 hover:text-white/85'
                              }`}
                              style={{
                                borderColor: goal === g.value ? 'rgba(107,191,122,0.5)' : C.border,
                                background: goal === g.value ? C.sageDim : 'rgba(255,255,255,0.02)',
                              }}>
                              <span>{g.emoji}</span>
                              <span className="text-xs leading-tight">{g.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* step 3: interests */}
                  {signupStep === 3 && (
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {INTERESTS.map(item => {
                          const sel = interests.includes(item);
                          return (
                            <button key={item} type="button" onClick={() => toggleInterest(item)}
                              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                                sel
                                  ? 'text-[#080D09]'
                                  : 'text-white/70 hover:text-white'
                              }`}
                              style={{
                                borderColor: sel ? C.sage : C.border,
                                background: sel ? C.sage : 'rgba(255,255,255,0.02)',
                              }}>
                              {sel && <Check className="w-3 h-3" />}
                              {item}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-xs font-medium" style={{ color: C.cream35 }}>
                        {interests.length < 3
                          ? `Pick ${3 - interests.length} more`
                          : `${interests.length} selected — looking good!`}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl border px-4 py-2.5 text-sm font-medium text-red-200" style={{ borderColor: 'rgba(255,138,128,0.5)', background: 'rgba(255,138,128,0.12)' }}>
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="rounded-xl border px-4 py-2.5 text-sm font-medium" style={{ borderColor: 'rgba(107,191,122,0.45)', background: 'rgba(107,191,122,0.12)', color: '#CFE9D4' }}>
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || (signupStep === 3 && interests.length < 3)}
                    className="flex w-full items-center justify-center gap-2 rounded-full border py-3.5 text-sm font-medium transition-all hover:brightness-110 disabled:opacity-40"
                    style={{ background: signupStep === 3 ? 'rgba(107,191,122,0.9)' : C.sage, borderColor: C.sage, color: '#080D09' }}
                  >
                    {isLoading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : signupStep < 3
                        ? <ChevronRight className="w-4 h-4" />
                        : <Sparkles className="w-4 h-4" />
                    }
                    {isLoading
                      ? 'Creating your account…'
                      : signupStep < 3
                        ? 'Next'
                        : 'Start your journey'}
                  </button>
                </form>
              )}
            </div>

            <Link href="/" className="flex items-center justify-center gap-1.5 text-sm font-medium text-white/45 transition hover:text-white/80">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
