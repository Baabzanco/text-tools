import React, { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Check, Navigation } from 'lucide-react';
import { getAdminNavigation, updateAdminNavigation, NavItem } from '../../lib/api/cms-client';

export const AdminNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'header' | 'footer'>('header');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [headerItems, setHeaderItems] = useState<NavItem[]>([]);
  const [footerItems, setFooterItems] = useState<NavItem[]>([]);

  const fetchNav = () => {
    setLoading(true);
    getAdminNavigation()
      .then((menus) => {
        const hMenu = menus.find((m) => m.location === 'header');
        const fMenu = menus.find((m) => m.location === 'footer');
        if (hMenu) setHeaderItems(hMenu.items || []);
        if (fMenu) setFooterItems(fMenu.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNav();
  }, []);

  const currentItems = activeTab === 'header' ? headerItems : footerItems;
  const setCurrentItems = activeTab === 'header' ? setHeaderItems : setFooterItems;

  const handleAddItem = () => {
    const newItem: NavItem = {
      id: `item-${Date.now()}`,
      label: 'New Link',
      url: '/text-tools',
      order: currentItems.length + 1,
      isActive: true,
      target: '_self'
    };
    setCurrentItems([...currentItems, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setCurrentItems(currentItems.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof NavItem, val: any) => {
    setCurrentItems(
      currentItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAdminNavigation(activeTab, currentItems);
      setSuccessMsg(`Navigation menu for '${activeTab}' updated successfully! Public site menus will render updated links.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save navigation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading navigation menus...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Navigation Menu Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add, reorder, edit, or disable header and footer menu items.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Navigation</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('header')}
          className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'header'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Main Header Menu
        </button>
        <button
          onClick={() => setActiveTab('footer')}
          className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'footer'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Footer Links Menu
        </button>
      </div>

      {/* Items List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-indigo-600" />
            <span>{activeTab === 'header' ? 'Header Links' : 'Footer Links'}</span>
          </h2>

          <button
            onClick={handleAddItem}
            className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {currentItems.map((item, idx) => (
            <div
              key={item.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
            >
              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Label
                </label>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => handleUpdateItem(item.id, 'label', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  URL / Target Path
                </label>
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => handleUpdateItem(item.id, 'url', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Order
                </label>
                <input
                  type="number"
                  value={item.order}
                  onChange={(e) => handleUpdateItem(item.id, 'order', Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-center"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 pt-3 sm:pt-0">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={(e) => handleUpdateItem(item.id, 'isActive', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="sm:col-span-1 text-right">
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
