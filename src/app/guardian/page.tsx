'use client';

import { useEffect, useState, Suspense } from 'react';
import { Shield, MessageCircle, Camera, Activity, Lock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

import { GuardianOnboarding } from '@/components/guardian/GuardianOnboarding';
import { WellbeingScoreCard } from '@/components/guardian/WellbeingScoreCard';
import { WhatsAppConnect } from '@/components/guardian/WhatsAppConnect';
import { InstagramConnect } from '@/components/guardian/InstagramConnect';
import { BehaviourInsights } from '@/components/guardian/BehaviourInsights';

interface WAIntegration {
  phone_number: string;
  is_active: boolean;
  checkin_frequency: string;
  last_checkin_sent_at: string | null;
  last_reply_at: string | null;
}

interface IGIntegration {
  instagram_username: string;
  is_active: boolean;
  last_synced_at: string | null;
}

interface IGPost {
  caption: string;
  sentiment_score: number;
  risk_level: string;
  posted_at: string;
}

export default function GuardianPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <GuardianInner />
    </Suspense>
  );
}

function GuardianInner() {
  const params = useSearchParams();
  const [consented, setConsented] = useState<boolean | null>(null); // null = loading
  const [waIntegration, setWaIntegration] = useState<WAIntegration | null>(null);
  const [igIntegration, setIgIntegration] = useState<IGIntegration | null>(null);
  const [igPosts, setIgPosts] = useState<IGPost[]>([]);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Check if user has previously consented (stored in localStorage for simplicity)
    const stored = localStorage.getItem('haven_guardian_consented');
    setConsented(stored === 'true');

    loadIntegrations();

    if (params.get('connected') === 'instagram') {
      toast.success('Instagram connected! Analysing your posts…');
    }
    if (params.get('error') === 'ig_auth_failed') {
      toast.error('Instagram connection failed — please try again');
    }
  }, []);

  async function loadIntegrations() {
    const [waRes, igRes, igPostRes] = await Promise.all([
      fetch('/api/integrations/whatsapp/connect').catch(() => null),
      fetch('/api/integrations/instagram/sync').catch(() => null),
      fetch('/api/integrations/instagram/posts').catch(() => null),
    ]);

    if (waRes?.ok) {
      const data = await waRes.json();
      setWaIntegration(data?.integration ?? null);
    }
    if (igRes?.ok) {
      const data = await igRes.json();
      setIgIntegration(data?.integration ?? null);
    }
    if (igPostRes?.ok) {
      const data = await igPostRes.json();
      setIgPosts(Array.isArray(data) ? data : []);
    }
  }

  async function handleDeleteAllData() {
    if (!confirm('Delete ALL Guardian data? This cannot be undone.')) return;
    setDeleting(true);

    await Promise.all([
      fetch('/api/integrations/whatsapp/connect', { method: 'DELETE' }),
      fetch('/api/integrations/instagram/sync', { method: 'DELETE' }),
    ]);

    localStorage.removeItem('haven_guardian_consented');
    setConsented(false);
    setWaIntegration(null);
    setIgIntegration(null);
    setIgPosts([]);
    setDeleting(false);
    toast.success('All Guardian data deleted');
  }

  // Loading state
  if (consented === null) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
    </div>;
  }

  // Onboarding (first visit / consent revoked)
  if (!consented) {
    return (
      <div className="min-h-screen bg-gray-950 pt-16">
        <GuardianOnboarding
          onAccept={() => {
            localStorage.setItem('haven_guardian_consented', 'true');
            setConsented(true);
          }}
          onDecline={() => window.history.back()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16 pb-24">
      <div className="max-w-lg mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="pt-6">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-bold text-white">HAVEN Guardian</h1>
          </div>
          <p className="text-sm text-gray-400">
            An optional wellbeing companion. Connect what you want, disconnect anytime.
          </p>
          <p className="text-xs text-rose-400 mt-2">
            📞 Befrienders Malaysia: <span className="font-semibold">03-7627 2929</span> (free, 24/7)
          </p>
        </div>

        {/* Wellbeing Score */}
        <WellbeingScoreCard />

        {/* WhatsApp Section */}
        <Section icon={<MessageCircle className="w-5 h-5 text-green-400" />} title="WhatsApp Guardian" subtitle="Daily mood check-ins via WhatsApp">
          <WhatsAppConnect
            connected={!!waIntegration?.is_active}
            phoneNumber={waIntegration?.phone_number}
            onConnected={loadIntegrations}
            onDisconnected={() => setWaIntegration(null)}
          />
        </Section>

        {/* Instagram Section */}
        <Section icon={<Camera className="w-5 h-5 text-purple-400" />} title="Instagram Pulse" subtitle="Analyse your post captions for sentiment trends">
          <InstagramConnect
            connected={!!igIntegration?.is_active}
            username={igIntegration?.instagram_username}
            lastSynced={igIntegration?.last_synced_at}
            recentPosts={igPosts}
            onConnected={loadIntegrations}
            onDisconnected={() => { setIgIntegration(null); setIgPosts([]); }}
          />
        </Section>

        {/* In-App Behaviour Section */}
        <Section
          icon={<Activity className="w-5 h-5 text-blue-400" />}
          title="HAVEN Behaviour Monitor"
          subtitle="Always on — runs entirely within the app"
          badge="Active"
        >
          <BehaviourInsights />
        </Section>

        {/* Privacy Transparency */}
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <button
            onClick={() => setPrivacyOpen(!privacyOpen)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">Privacy & Data</span>
            </div>
            {privacyOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {privacyOpen && (
            <div className="px-4 pb-4 space-y-3 text-xs text-gray-400">
              <div className="border-t border-white/5 pt-3 space-y-2">
                <p><strong className="text-gray-300">WhatsApp:</strong> HAVEN only reads replies you send directly to HAVEN's number. We never access your private conversations.</p>
                <p><strong className="text-gray-300">Instagram:</strong> HAVEN only reads post captions using the <code>instagram_basic</code> permission. We do not access DMs, followers, or private-account content.</p>
                <p><strong className="text-gray-300">Wellbeing score:</strong> Never shared with counselors, parents, or any third party. Counselors only see anonymous school-wide trends.</p>
                <p><strong className="text-gray-300">Retention:</strong> WhatsApp check-ins deleted after 30 days. Instagram analyses deleted after 60 days. Behaviour snapshots deleted after 90 days.</p>
                <p><strong className="text-gray-300">Data selling:</strong> HAVEN never sells, shares, or monetises your personal data.</p>
              </div>

              <button
                onClick={handleDeleteAllData}
                disabled={deleting}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? 'Deleting…' : 'Delete all my Guardian data'}
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-gray-600 pb-4">
          HAVEN never sells, shares, or monetises your personal data.
        </p>
      </div>
    </div>
  );
}

function Section({
  icon, title, subtitle, badge, children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h3 className="font-semibold text-white text-sm">{title}</h3>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
        {badge && (
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}
