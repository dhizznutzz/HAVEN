'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AICompanionChat } from '@/components/safe-space/AICompanionChat';
import { CounselorChat } from '@/components/safe-space/CounselorChat';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SessionContent() {
  const params = useSearchParams();
  const mode = params.get('mode') || 'ai_companion';

  const modeLabels: Record<string, string> = {
    ai_companion: 'Rakan — AI Companion',
    peer_listener: 'Peer Listener',
    counselor: 'Counselor',
  };

  return (
    <div className="max-w-lg mx-auto h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <Link href="/safe-space" className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-sm font-medium text-gray-900">{modeLabels[mode]}</h1>
          <p className="text-xs text-gray-400">Anonymous session</p>
        </div>
      </div>

      <div className="flex-1 bg-white overflow-hidden">
        {mode === 'ai_companion' ? (
          <AICompanionChat />
        ) : mode === 'counselor' ? (
          <CounselorChat />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-2xl">
              👥
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900">Finding a peer listener...</h2>
              <p className="text-xs text-gray-500 mt-1">A trained peer volunteer will be with you shortly.</p>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              While you wait — Befrienders: <span className="text-rose-600 font-medium">03-7627 2929</span> (24/7, free)
            </p>
          </div>
        )}
      </div>

      {/* Non-negotiable crisis footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400">
          Befrienders Malaysia: <span className="text-rose-500 font-medium">03-7627 2929</span> — Free, 24/7 crisis support
        </p>
      </div>
    </div>
  );
}

export default function SafeSpaceSessionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-sm text-gray-400">Loading...</div>}>
      <SessionContent />
    </Suspense>
  );
}
