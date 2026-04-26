'use client';

import { useState } from 'react';
import { X, Trophy, Users, Clock, CheckCircle, ChevronDown, ChevronUp, BookOpen, Star } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  skill: string;
  xp: number;
  participants: number;
  daysLeft: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Module {
  title: string;
  lessons: string[];
  duration: string;
}

interface Curriculum {
  outcomes: string[];
  modules: Module[];
  estimatedHours: number;
  instructor: { name: string; title: string };
}

const CURRICULA: Record<string, Curriculum> = {
  '1': {
    outcomes: [
      'Build real CLI tools with argparse',
      'Automate tasks using Python scripts',
      'Package and distribute your tool',
      'Handle file I/O and user input',
    ],
    modules: [
      { title: 'Python Foundations', lessons: ['Variables & data types', 'Functions & modules', 'Reading / writing files'], duration: '1h' },
      { title: 'CLI Fundamentals', lessons: ['What is a CLI?', 'argparse in depth', 'Input validation & help text'], duration: '2h' },
      { title: 'Build Your Tool', lessons: ['Define the problem you\'re solving', 'Write the core logic', 'Add error handling'], duration: '3h' },
      { title: 'Polish & Ship', lessons: ['Writing tests', 'Packaging with pip', 'Sharing on GitHub'], duration: '1h' },
    ],
    estimatedHours: 7,
    instructor: { name: 'Amirul Hakimi', title: 'Software Engineer at Grab' },
  },
  '2': {
    outcomes: [
      'Apply design thinking to real problems',
      'Create high-fidelity screens in Figma',
      'Build a complete 3-screen user flow',
      'Present and iterate on feedback',
    ],
    modules: [
      { title: 'Design Thinking', lessons: ['Empathise & define', 'Ideation techniques', 'User journey mapping'], duration: '1h' },
      { title: 'Figma Essentials', lessons: ['Frames & layers', 'Auto layout', 'Components & variants'], duration: '2h' },
      { title: 'Building the Mockup', lessons: ['Onboarding screen', 'Main dashboard', 'Profile / settings screen'], duration: '3h' },
      { title: 'Feedback & Iteration', lessons: ['Share for critique', 'Implement feedback', 'Final presentation'], duration: '1h' },
    ],
    estimatedHours: 7,
    instructor: { name: 'Syafiqah Noor', title: 'Product Designer at Carousell' },
  },
  '3': {
    outcomes: [
      'Build a 30-day daily learning habit',
      'Publicly document your progress',
      'Grow your accountability circle',
      'Reflect and present your journey',
    ],
    modules: [
      { title: 'Setting Your Goal', lessons: ['Define what you will learn', 'Daily time commitment', 'Your why statement'], duration: '30 min' },
      { title: 'Week 1 — Launch', lessons: ['First post template', 'Finding accountability partners', 'Tools & workflow'], duration: 'Week 1' },
      { title: 'Weeks 2–3 — Momentum', lessons: ['Handling missed days', 'Sharing milestones', 'Community check-ins'], duration: 'Weeks 2–3' },
      { title: 'Week 4 — Finish Strong', lessons: ['Reflecting on growth', 'Writing your final post', 'Celebrating with the community'], duration: 'Week 4' },
    ],
    estimatedHours: 30,
    instructor: { name: 'Nurul Ain', title: 'Career Coach & Learning Specialist' },
  },
};

const DEFAULT_CURRICULUM: Curriculum = {
  outcomes: ['Learn core concepts', 'Build a real project', 'Share with the community', 'Earn XP and level up'],
  modules: [
    { title: 'Introduction', lessons: ['Overview & goals', 'Getting started', 'What you will build'], duration: '1h' },
    { title: 'Core Skills', lessons: ['Fundamentals', 'Practice exercises', 'Mini project'], duration: '3h' },
    { title: 'Final Project', lessons: ['Plan your project', 'Build it', 'Submit & share'], duration: '3h' },
  ],
  estimatedHours: 7,
  instructor: { name: 'HAVEN Mentors', title: 'Community Educators' },
};

const HEADER_GRADIENT = {
  beginner: 'from-green-500 to-emerald-600',
  intermediate: 'from-amber-500 to-orange-500',
  advanced: 'from-rose-500 to-red-600',
};

interface Props {
  challenge: Challenge;
  open: boolean;
  onClose: () => void;
  onEnroll: () => void;
}

export function ChallengeModal({ challenge, open, onClose, onEnroll }: Props) {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const curriculum = CURRICULA[challenge.id] ?? DEFAULT_CURRICULUM;

  if (!open) return null;

  const handleEnroll = async () => {
    setEnrolling(true);
    await new Promise(r => setTimeout(r, 700));
    setEnrolled(true);
    await new Promise(r => setTimeout(r, 1100));
    onEnroll();
    setEnrolled(false);
    setEnrolling(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[92vh] flex flex-col shadow-2xl">
        {/* Gradient header */}
        <div className={`bg-gradient-to-br ${HEADER_GRADIENT[challenge.difficulty]} p-6 pb-5 shrink-0`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/25 text-white font-medium">
                #{challenge.skill}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/25 text-white font-medium capitalize">
                {challenge.difficulty}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/25 hover:bg-white/35 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">{challenge.title}</h2>
          <p className="text-sm text-white/80 leading-relaxed">{challenge.description}</p>

          <div className="flex items-center gap-5 mt-4">
            <div className="flex items-center gap-1.5 text-white">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-semibold">{challenge.xp} XP</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/85">
              <Users className="w-4 h-4" />
              <span className="text-sm">{challenge.participants.toLocaleString()} enrolled</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/85">
              <Clock className="w-4 h-4" />
              <span className="text-sm">~{curriculum.estimatedHours}h</span>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Instructor */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700 shrink-0">
              {curriculum.instructor.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{curriculum.instructor.name}</p>
              <p className="text-xs text-gray-500">{curriculum.instructor.title}</p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className="w-3 h-3 text-amber-400 fill-current" />
              ))}
            </div>
          </div>

          {/* What you'll learn */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">What you&apos;ll learn</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {curriculum.outcomes.map((o, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-700 leading-relaxed">{o}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Course content */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Course content</h3>
              <span className="text-xs text-gray-400">
                {curriculum.modules.length} modules · ~{curriculum.estimatedHours}h
              </span>
            </div>

            <div className="space-y-2">
              {curriculum.modules.map((mod, i) => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedModule(expandedModule === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700 shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{mod.title}</p>
                        <p className="text-[10px] text-gray-400">{mod.lessons.length} lessons · {mod.duration}</p>
                      </div>
                    </div>
                    {expandedModule === i
                      ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>

                  {expandedModule === i && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
                      {mod.lessons.map((lesson, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <BookOpen className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-600">{lesson}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky CTA footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white shrink-0">
          {enrolled ? (
            <div className="w-full py-3 bg-green-100 text-green-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Enrolled! +{challenge.xp} XP earned 🎉
            </div>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full py-3 bg-sage-600 hover:bg-sage-700 disabled:opacity-70 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {enrolling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enrolling…
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  Enroll &amp; earn {challenge.xp} XP
                </>
              )}
            </button>
          )}
          <p className="text-[10px] text-center text-gray-400 mt-2">
            {challenge.daysLeft} days remaining · Free to join
          </p>
        </div>
      </div>
    </div>
  );
}
