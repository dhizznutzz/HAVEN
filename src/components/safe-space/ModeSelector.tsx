'use client';

import { useRouter } from 'next/navigation';
import { Bot, Users, User } from 'lucide-react';

const modes = [
  {
    id: 'ai_companion',
    icon: Bot,
    title: 'Talk to Rakan',
    subtitle: 'AI companion',
    description: 'A warm, empathetic AI companion. Available 24/7. Fully anonymous.',
    color: 'border-rose-200 hover:border-rose-400 hover:bg-rose-50',
    iconColor: 'text-rose-500',
    badge: 'Available now',
    badgeColor: 'bg-rose-100 text-rose-700',
  },
  {
    id: 'peer_listener',
    icon: Users,
    title: 'Peer Listener',
    subtitle: 'Trained youth volunteer',
    description: 'Chat with a trained peer listener from our community. Anonymous.',
    color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50',
    iconColor: 'text-amber-500',
    badge: '~5 min wait',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'counselor',
    icon: User,
    title: 'Counselor',
    subtitle: 'Professional support',
    description: 'Connect with a licensed counselor. For when you need expert help.',
    color: 'border-teal-200 hover:border-teal-400 hover:bg-teal-50',
    iconColor: 'text-teal-500',
    badge: 'Book session',
    badgeColor: 'bg-teal-100 text-teal-700',
  },
];

export function ModeSelector() {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {modes.map(mode => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            onClick={() => router.push(`/safe-space/session?mode=${mode.id}`)}
            className={`w-full rounded-xl border-2 bg-white p-4 text-left transition-all ${mode.color}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <Icon className={`w-5 h-5 ${mode.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">{mode.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${mode.badgeColor}`}>
                    {mode.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{mode.subtitle}</p>
                <p className="text-xs text-gray-600 mt-1.5">{mode.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
