import { ModeSelector } from '@/components/safe-space/ModeSelector';
import { Heart, Shield } from 'lucide-react';

export default function SafeSpacePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-7 h-7 text-rose-500" />
        </div>
        <h1 className="text-xl font-medium text-gray-900">Safe Space</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          This is a private, judgment-free space. Choose how you&apos;d like to connect today.
        </p>
      </div>

      {/* Anonymous badge */}
      <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-6">
        <Shield className="w-4 h-4 text-rose-500 shrink-0" />
        <p className="text-xs text-rose-700">
          All conversations here are <strong>anonymous by default</strong>. Your name and profile are never shown.
        </p>
      </div>

      <ModeSelector />

      {/* Crisis line — non-negotiable footer */}
      <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
        <p className="text-xs text-gray-500 mb-1">Need immediate support?</p>
        <p className="text-sm font-medium text-gray-800">
          Befrienders Malaysia: <span className="text-rose-600">03-7627 2929</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">Free, 24/7, confidential</p>
      </div>
    </div>
  );
}
