import React, { useState } from 'react';
import { Settings, Bell, Lock, Shield, Eye } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [placementAlerts, setPlacementAlerts] = useState(true);
  const [eventAlerts, setEventAlerts] = useState(false);
  const [marketingAlerts, setMarketingAlerts] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 font-medium">Configure your notification preferences, credentials security, and portal displays.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Settings categories navigation sidebar layout */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1.5 h-fit">
          <button className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-xs font-extrabold text-slate-800">
            <Bell className="h-4.5 w-4.5 text-slate-500" />
            Notifications
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
            <Lock className="h-4.5 w-4.5 text-slate-400" />
            Password & Security
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
            <Shield className="h-4.5 w-4.5 text-slate-400" />
            Privacy Options
          </button>
        </div>

        {/* Setting content panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Notifications config */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">System Notification Preferences</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Control which updates are delivered immediately via the dashboard notifications center.</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <span className="text-sm font-bold text-slate-700">Important Notices Circulars</span>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Receive immediate notifications for mid-sem schedules and exam schedules.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-200 text-brand-orange focus:ring-brand-orange"
                />
              </label>

              <label className="flex items-start justify-between gap-4 cursor-pointer border-t border-slate-50 pt-4">
                <div>
                  <span className="text-sm font-bold text-slate-700">T&P Placement Job Alerts</span>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Alerts when new internships and campus placements are posted.</p>
                </div>
                <input
                  type="checkbox"
                  checked={placementAlerts}
                  onChange={(e) => setPlacementAlerts(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-200 text-brand-orange focus:ring-brand-orange"
                />
              </label>

              <label className="flex items-start justify-between gap-4 cursor-pointer border-t border-slate-50 pt-4">
                <div>
                  <span className="text-sm font-bold text-slate-700">Campus Sports & Cultural Events</span>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Notifications for upcoming cultural fests, sports trials, or seminars.</p>
                </div>
                <input
                  type="checkbox"
                  checked={eventAlerts}
                  onChange={(e) => setEventAlerts(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-200 text-brand-orange focus:ring-brand-orange"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
