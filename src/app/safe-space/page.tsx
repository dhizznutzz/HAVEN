'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Heart, Shield, MessageCircle, Camera, Activity,
  Lock, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { ModeSelector } from '@/components/safe-space/ModeSelector';
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

export default function SafeSpacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SafeSpaceInner />
    </Suspense>
  );
}

function SafeSpaceInner() {
  const params = useSearchParams();
  const [activeTab, setActiveTab] = useState<'connect' | 'guardian'>(
    params.get('tab') === 'guardian' ? 'guardian' : 'connect',
  );
  const [consented, setConsented] = useState<boolean | null>(null);
  const [waIntegration, setWaIntegration] = useState<WAIntegration | null>(null);
  const [igIntegration, setIgIntegration] = useState<IGIntegration | null>(null);
  const [igPosts, setIgPosts] = useState<IGPost[]>([]);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('haven_guardian_consented');
    setConsented(stored === 'true');
    loadIntegrations();

    if (params.get('connected') === 'instagram') {
      setActiveTab('guardian');
      toast.success('Instagram connected! Analysing your posts…');
    }
    if (params.get('error') === 'ig_auth_failed') {
      setActiveTab('guardian');
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

  return (
    <div className="min-h-screen pb-24">
      {/* Tab switcher */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-3">
          <div className="flex rounded-xl p-1 bg-gray-100">
            <button
              onClick={() => setActiveTab('connect')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'connect'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Heart className="w-4 h-4" />
              Safe Space
            </button>
            <button
              onClick={() => setActiveTab('guardian')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'guardian'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              Guardian
            </button>
          </div>
        </div>
      </div>

      {/* Safe Space tab */}
      {activeTab === 'connect' && (
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-rose-500" />
            </div>
            <h1 className="text-xl font-medium text-gray-900">Safe Space</h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              This is a private, judgment-free space. Choose how you&apos;d like to connect today.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-6">
            <Shield className="w-4 h-4 text-rose-500 shrink-0" />
            <p className="text-xs text-rose-700">
              All conversations here are <strong>anonymous by default</strong>. Your name and profile are never shown.
            </p>
          </div>

          <ModeSelector />

          <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-1">Need immediate support?</p>
            <p className="text-sm font-medium text-gray-800">
              Befrienders Malaysia: <span className="text-rose-600">03-7627 2929</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Free, 24/7, confidential</p>
          </div>
        </div>
      )}

      {/* Guardian tab */}
      {activeTab === 'guardian' && (
        <>
          {consented === null && (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
            </div>
          )}

          {consented === false && (
            <div className="pt-8">
              <GuardianOnboarding
                onAccept={() => {
                  localStorage.setItem('haven_guardian_consented', 'true');
                  setConsented(true);
                }}
                onDecline={() => setActiveTab('connect')}
              />
            </div>
          )}

          {consented === true && (
            <div className="max-w-lg mx-auto px-4 space-y-6 pt-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Shield className="w-6 h-6 text-rose-500" />
                  <h1 className="text-2xl font-bold text-gray-900">HAVEN Guardian</h1>
                </div>
                <p className="text-sm text-gray-500">
                  An optional wellbeing companion. Connect what you want, disconnect anytime.
                </p>
                <p className="text-xs text-rose-600 mt-2">
                  📞 Befrienders Malaysia:{' '}
                  <span className="font-semibold">03-7627 2929</span> (free, 24/7)
                </p>
              </div>

              <WellbeingScoreCard />

              <GuardianSection
                icon={<MessageCircle className="w-5 h-5 text-green-400" />}
                title="WhatsApp Guardian"
                subtitle="Daily mood check-ins via WhatsApp"
              >
                <WhatsAppConnect
                  connected={!!waIntegration?.is_active}
                  phoneNumber={waIntegration?.phone_number}
                  onConnected={loadIntegrations}
                  onDisconnected={() => setWaIntegration(null)}
                />
              </GuardianSection>

              <GuardianSection
                icon={<Camera className="w-5 h-5 text-purple-400" />}
                title="Instagram Pulse"
                subtitle="Analyse your post captions for sentiment trends"
              >
                <InstagramConnect
                  connected={!!igIntegration?.is_active}
                  username={igIntegration?.instagram_username}
                  lastSynced={igIntegration?.last_synced_at}
                  recentPosts={igPosts}
                  onConnected={loadIntegrations}
                  onDisconnected={() => { setIgIntegration(null); setIgPosts([]); }}
                />
              </GuardianSection>

              <GuardianSection
                icon={<Activity className="w-5 h-5 text-blue-400" />}
                title="HAVEN Behaviour Monitor"
                subtitle="Always on — runs entirely within the app"
                badge="Active"
              >
                <BehaviourInsights />
              </GuardianSection>

              {/* Privacy accordion */}
              <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => setPrivacyOpen(!privacyOpen)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Privacy & Data</span>
                  </div>
                  {privacyOpen
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {privacyOpen && (
                  <div className="px-4 pb-4 space-y-3 text-xs text-gray-500">
                    <div className="border-t border-gray-100 pt-3 space-y-2">
                      <p><strong className="text-gray-700">WhatsApp:</strong> HAVEN only reads replies you send directly to HAVEN&apos;s number. We never access your private conversations.</p>
                      <p><strong className="text-gray-700">Instagram:</strong> HAVEN only reads post captions using the <code>instagram_basic</code> permission. We do not access DMs, followers, or private-account content.</p>
                      <p><strong className="text-gray-700">Wellbeing score:</strong> Never shared with counselors, parents, or any third party. Counselors only see anonymous school-wide trends.</p>
                      <p><strong className="text-gray-700">Retention:</strong> WhatsApp check-ins deleted after 30 days. Instagram analyses deleted after 60 days. Behaviour snapshots deleted after 90 days.</p>
                      <p><strong className="text-gray-700">Data selling:</strong> HAVEN never sells, shares, or monetises your personal data.</p>
                    </div>

                    <button
                      onClick={handleDeleteAllData}
                      disabled={deleting}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deleting ? 'Deleting…' : 'Delete all my Guardian data'}
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-center text-gray-400 pb-4">
                HAVEN never sells, shares, or monetises your personal data.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GuardianSection({
  icon, title, subtitle, badge, children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        {badge && (
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}
