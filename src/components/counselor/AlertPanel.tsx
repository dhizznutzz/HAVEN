'use client';

import { AlertTriangle, TrendingUp, Users } from 'lucide-react';

interface Alert {
  id: string;
  type: 'high_risk' | 'trending' | 'isolation';
  cohort: string;
  message: string;
  timestamp: string;
}

interface AlertPanelProps {
  alerts?: Alert[];
}

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'high_risk',
    cohort: 'Form 5A',
    message: 'Elevated stress signals detected. 3 anonymous Safe Space sessions this week.',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    type: 'isolation',
    cohort: 'Form 4C',
    message: 'Low engagement for 7+ days. Consider outreach.',
    timestamp: '1 day ago',
  },
  {
    id: '3',
    type: 'trending',
    cohort: 'Form 3B',
    message: 'Wellbeing improving — up 15% from last week.',
    timestamp: '2 days ago',
  },
];

const alertConfig = {
  high_risk: { icon: AlertTriangle, color: 'text-red-500 bg-red-50 border-red-200', label: 'High Risk' },
  trending: { icon: TrendingUp, color: 'text-green-500 bg-green-50 border-green-200', label: 'Improving' },
  isolation: { icon: Users, color: 'text-amber-500 bg-amber-50 border-amber-200', label: 'Isolation' },
};

export function AlertPanel({ alerts = MOCK_ALERTS }: AlertPanelProps) {
  return (
    <div className="space-y-3">
      {alerts.map(alert => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;

        return (
          <div key={alert.id} className={`rounded-xl border p-4 ${config.color}`}>
            <div className="flex items-start gap-3">
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{alert.cohort}</span>
                  <span className="text-xs opacity-60">{config.label}</span>
                </div>
                <p className="text-xs">{alert.message}</p>
                <p className="text-xs opacity-50 mt-1">{alert.timestamp}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
