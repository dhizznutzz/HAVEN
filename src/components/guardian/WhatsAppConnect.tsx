'use client';

import { useState } from 'react';
import { MessageCircle, Check, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  connected: boolean;
  phoneNumber?: string;
  onConnected: () => void;
  onDisconnected: () => void;
}

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'every_2_days', label: 'Every 2 days' },
  { value: 'weekly', label: 'Weekly' },
];

export function WhatsAppConnect({ connected, phoneNumber, onConnected, onDisconnected }: Props) {
  const [phone, setPhone] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [checkinTime, setCheckinTime] = useState('09:00');
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setSaving(true);

    const res = await fetch('/api/integrations/whatsapp/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone.trim(), frequency, checkinTime: `${checkinTime}:00` }),
    });

    setSaving(false);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.warning) {
        toast(data.warning, { icon: '⚠️', duration: 6000 });
      } else {
        toast.success('WhatsApp connected! A welcome message is on its way 💙');
      }
      onConnected();
    } else {
      let message = 'Connection failed';
      try {
        const err = await res.json();
        message = err.error ?? message;
      } catch {}
      toast.error(message);
    }
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect WhatsApp? This will delete all your check-in history.')) return;
    setDisconnecting(true);
    await fetch('/api/integrations/whatsapp/connect', { method: 'DELETE' });
    setDisconnecting(false);
    toast.success('WhatsApp disconnected');
    onDisconnected();
  }

  if (connected) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">WhatsApp connected</p>
              <p className="text-xs text-gray-500">{phoneNumber}</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleConnect} className="space-y-3">
      <div>
        <label className="block text-xs text-gray-600 mb-1">WhatsApp number (with country code)</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+60123456789"
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-rose-400"
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          HAVEN will only message this number for check-ins. We never read your other messages.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Frequency</label>
          <select
            value={frequency}
            onChange={e => setFrequency(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
          >
            {FREQUENCIES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Preferred time</label>
          <input
            type="time"
            value={checkinTime}
            onChange={e => setCheckinTime(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
        {saving ? 'Connecting…' : 'Connect WhatsApp'}
      </button>
    </form>
  );
}
