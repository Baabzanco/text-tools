import React, { useEffect, useState } from 'react';
import { Save, Settings, Check, Globe } from 'lucide-react';
import { getAdminSettings, updateAdminSettings, SiteSettings } from '../../lib/api/cms-client';

export const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [settings, setSettings] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    getAdminSettings()
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateAdminSettings(settings);
      setSettings(updated);
      setSuccessMsg('Global site settings persisted to database successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading site settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Global Site Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure site identity, default SEO metadata, and footer copyright copy.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Settings</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Basic Settings Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-600" />
          <span>Site Identity & Branding</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Site Brand Name
            </label>
            <input
              type="text"
              value={settings.siteName || ''}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Site Tagline / Description
            </label>
            <input
              type="text"
              value={settings.siteDescription || ''}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Footer Copyright Text
            </label>
            <input
              type="text"
              value={settings.footerText || ''}
              onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>
        </div>
      </div>

      {/* Default SEO Defaults */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>Global Fallback SEO Metadata</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Default SEO Title
            </label>
            <input
              type="text"
              value={settings.defaultSeoTitle || ''}
              onChange={(e) => setSettings({ ...settings, defaultSeoTitle: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">
              Default Meta Description
            </label>
            <textarea
              value={settings.defaultMetaDescription || ''}
              onChange={(e) => setSettings({ ...settings, defaultMetaDescription: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
