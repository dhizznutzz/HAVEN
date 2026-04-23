'use client';

import { useState } from 'react';
import { Camera, Check, Loader2, X, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface RecentPost {
  caption: string;
  sentiment_score: number;
  risk_level: string;
  posted_at: string;
}

interface Props {
  connected: boolean;
  username?: string;
  lastSynced?: string | null;
  recentPosts?: RecentPost[];
  onConnected: () => void;
  onDisconnected: () => void;
}

export function InstagramConnect({
  connected, username, lastSynced, recentPosts = [], onConnected, onDisconnected,
}: Props) {
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  async function handleSync() {
    setSyncing(true);
    const res = await fetch('/api/integrations/instagram/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    setSyncing(false);
    if (res.ok) {
      const { analysed } = await res.json();
      toast.success(`Analysed ${analysed} new posts`);
      onConnected();
    } else {
      toast.error('Sync failed — try again later');
    }
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect Instagram? This will delete all post analyses.')) return;
    setDisconnecting(true);
    await fetch('/api/integrations/instagram/sync', { method: 'DELETE' });
    setDisconnecting(false);
    toast.success('Instagram disconnected');
    onDisconnected();
  }

  if (connected) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">@{username}</p>
                {lastSynced && (
                  <p className="text-xs text-gray-400">
                    Synced {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Sync
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {recentPosts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Recent posts analysed</p>
            {recentPosts.slice(0, 5).map((post, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                <SentimentDot score={post.sentiment_score} riskLevel={post.risk_level} />
                <p className="text-xs text-gray-300 line-clamp-2 flex-1">{post.caption}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        Connect your Instagram to let HAVEN analyse your post captions for sentiment trends.
        We only request caption text — no DMs, followers, or images.
      </p>
      <a
        href="/api/integrations/instagram/connect"
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-2.5 rounded-lg text-sm transition-all"
      >
        <Camera className="w-4 h-4" />
        Connect Instagram
      </a>
    </div>
  );
}

function SentimentDot({ score, riskLevel }: { score: number; riskLevel: string }) {
  const color =
    riskLevel === 'high' ? 'bg-red-500' :
    riskLevel === 'medium' ? 'bg-amber-500' :
    score >= 0 ? 'bg-green-500' : 'bg-gray-400';

  return <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${color}`} />;
}
