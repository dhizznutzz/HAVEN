'use client';

import { Shield, Eye, Trash2, Check } from 'lucide-react';

interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

export function GuardianOnboarding({ onAccept, onDecline }: Props) {
  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">HAVEN Guardian</h2>
        <p className="text-gray-400 text-sm">
          An optional wellbeing companion. You control everything — connect what you want, disconnect anytime.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Before you connect, here's what you should know:</h3>

        {[
          {
            icon: <Eye className="w-4 h-4 text-blue-400" />,
            title: 'What we collect',
            body: 'Optional WhatsApp check-in replies, optional Instagram post captions, and in-app activity within HAVEN.',
          },
          {
            icon: <Shield className="w-4 h-4 text-green-400" />,
            title: 'How we protect it',
            body: 'Your wellbeing score is private — only you can see it. Counselors see only anonymous school-wide trends, never your individual data.',
          },
          {
            icon: <Trash2 className="w-4 h-4 text-amber-400" />,
            title: 'You can delete everything',
            body: 'Disconnect and delete all Guardian data at any time from this page. Check-ins are deleted after 30 days, Instagram analyses after 60 days.',
          },
        ].map((item, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/5 bg-white/3 p-3">
        <p className="text-xs text-gray-500 text-center">
          WhatsApp — HAVEN only reads replies <em>you send to HAVEN</em>. We never access your private conversations.<br />
          Instagram — HAVEN only requests post caption text. No DMs, followers, or private content.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onDecline}
          className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
        >
          No thanks
        </button>
        <button
          onClick={onAccept}
          className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Check className="w-4 h-4" />
          I understand, let's connect
        </button>
      </div>

      <p className="text-xs text-gray-600 text-center">
        HAVEN never sells, shares, or monetises your personal data.
      </p>
    </div>
  );
}
