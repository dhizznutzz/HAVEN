export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RiskHeatmap } from '@/components/counselor/RiskHeatmap';
import { AlertPanel } from '@/components/counselor/AlertPanel';
import { Shield, Download } from 'lucide-react';

export default async function CounselorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school, display_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'counselor') {
    redirect('/feed');
  }

  const school = profile.school || 'Demo School';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-medium text-gray-900">Counselor Dashboard</h1>
          </div>
          <p className="text-sm text-gray-500">
            {school} — Anonymised wellbeing overview. No individual data is shown.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export report
        </button>
      </div>

      {/* Privacy notice */}
      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
        <p className="text-xs text-teal-700">
          <strong>Privacy-first:</strong> All data shown is aggregated at the cohort level.
          No individual student identifiers are stored or displayed. Data is derived from
          anonymous activity patterns only.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              Weekly Risk Heatmap — {new Date().toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}
            </h2>
            <RiskHeatmap school={school} />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Clear', color: 'bg-teal-100 text-teal-900' },
              { label: 'Minimal', color: 'bg-green-200 text-green-900' },
              { label: 'Low', color: 'bg-yellow-100 text-yellow-900' },
              { label: 'Medium', color: 'bg-amber-200 text-amber-900' },
              { label: 'High', color: 'bg-red-200 text-red-900' },
            ].map(({ label, color }) => (
              <span key={label} className={`text-xs px-2 py-1 rounded-md font-medium ${color}`}>{label}</span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Alerts & Insights</h2>
          <AlertPanel />
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Data refreshes daily. For emergencies, call 999 or direct students to Befrienders: 03-7627 2929
      </p>
    </div>
  );
}
