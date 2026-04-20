'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const moods = [
  { emoji: '😊', label: 'Great', value: 5 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '😔', label: 'Low', value: 2 },
  { emoji: '😢', label: 'Struggling', value: 1 },
];

export function WellbeingCheckIn({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (selected === null) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const score = (selected / 5) * 100;
      await supabase
        .from('profiles')
        .update({ wellbeing_score: Math.round(score) })
        .eq('id', user.id);
    }

    toast.success('Thanks for checking in!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl mb-16">
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400 mb-1">Daily check-in</p>
          <h2 className="text-lg font-medium text-gray-900">How are you doing today?</h2>
          <p className="text-sm text-gray-500 mt-1">Jangan risau — this is just for you.</p>
        </div>

        {step === 1 && (
          <>
            <div className="flex justify-around my-6">
              {moods.map(mood => (
                <button
                  key={mood.value}
                  onClick={() => setSelected(mood.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    selected === mood.value ? 'bg-rose-50 scale-110' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs text-gray-500">{mood.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={selected === null}
                className="flex-1 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-rose-600 transition-colors"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
