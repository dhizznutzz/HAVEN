'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, ChevronRight, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const AGE_GROUPS = [
  { value: 'u18',   label: 'Under 18',  sub: 'School student' },
  { value: '18-21', label: '18 – 21',   sub: 'College / university' },
  { value: '22-25', label: '22 – 25',   sub: 'Fresh grad / early career' },
  { value: '26-30', label: '26 – 30',   sub: 'Working / postgrad' },
];

const GOALS = [
  { value: 'skills',    emoji: '📚', label: 'Learn & grow skills' },
  { value: 'community', emoji: '🤝', label: 'Find my community' },
  { value: 'wellness',  emoji: '🌱', label: 'Take care of myself' },
  { value: 'jobs',      emoji: '💼', label: 'Find jobs or internships' },
];

const INTERESTS = [
  'Technology', 'Design', 'Business', 'Science',
  'Arts & Culture', 'Sports', 'Music', 'Environment',
  'Mental Health', 'Gaming', 'Writing', 'Social Impact',
  'Photography', 'Entrepreneurship', 'Education',
];

function toUsername(name: string) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20);
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername]       = useState('');
  const [ageGroup, setAgeGroup]       = useState('');
  const [goal, setGoal]               = useState('');
  const [interests, setInterests]     = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/login'); return; }
      if (user.user_metadata?.full_name) {
        const name = user.user_metadata.full_name as string;
        setDisplayName(name);
        setUsername(toUsername(name));
      }
    });
  }, [router]);

  const toggleInterest = (item: string) =>
    setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);

  const handleNameChange = (val: string) => {
    setDisplayName(val);
    setUsername(toUsername(val));
  };

  const canAdvance = () => {
    if (step === 1) return displayName.trim().length > 0 && username.length >= 3 && ageGroup !== '' && goal !== '';
    if (step === 2) return interests.length >= 3;
    return false;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    await handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase.from('profiles').insert({
        id:           user.id,
        username,
        display_name: displayName.trim(),
        avatar_url:   user.user_metadata?.avatar_url ?? null,
        age_group:    ageGroup,
        goal,
        interests,
        skills:       [],
      });
      if (error) throw error;

      toast.success('Welcome to HAVEN!');
      router.push('/feed');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong — please try again.';
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sprout className="w-6 h-6 text-sage-600" />
            <span className="text-xl font-medium text-gray-900">HAVEN</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            {step === 1 ? 'Tell us about you' : 'Your interests'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {step === 1 ? 'Helps us personalise everything' : 'Pick at least 3'}
          </p>

          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? 'w-8 bg-sage-600' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleNext} className="space-y-3">

          {/* ── STEP 1: Identity ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-100 focus:border-sage-600"
                />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username"
                    required
                    pattern="[a-z0-9_]+"
                    minLength={3}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-100 focus:border-sage-600"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">How old are you?</p>
                <div className="grid grid-cols-2 gap-2">
                  {AGE_GROUPS.map(a => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setAgeGroup(a.value)}
                      className={`px-3 py-2.5 rounded-xl text-left text-sm transition-all border ${
                        ageGroup === a.value
                          ? 'border-sage-600 bg-sage-50 text-sage-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{a.label}</div>
                      <div className="text-xs opacity-60">{a.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">What brings you to HAVEN?</p>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map(g => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGoal(g.value)}
                      className={`px-3 py-2.5 rounded-xl text-left text-sm transition-all border flex items-center gap-2 ${
                        goal === g.value
                          ? 'border-sage-600 bg-sage-50 text-sage-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span>{g.emoji}</span>
                      <span className="text-xs leading-tight">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Interests ── */}
          {step === 2 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(item => {
                  const selected = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selected
                          ? 'bg-sage-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      {item}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                {interests.length < 3
                  ? `Pick ${3 - interests.length} more`
                  : `${interests.length} selected — looks good!`}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canAdvance()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-sage-600 text-white rounded-xl text-sm font-medium hover:bg-sage-700 disabled:opacity-40 transition-colors mt-2"
          >
            {step === 1
              ? <>Next <ChevronRight className="w-4 h-4" /></>
              : loading ? 'Setting up your account…' : 'Start your journey'}
          </button>
        </form>
      </div>
    </div>
  );
}
