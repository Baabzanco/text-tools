import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  FileText,
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Trash2,
  Edit3,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { getAdminToken } from '../../lib/api/cms-client';
import { MediaPickerModal, MediaAssetItem } from './MediaPickerModal';

export const MediaLibraryPage: React.FC = () => {
  const [items, setItems] = useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Search & Filter state
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<{ total: number; totalPages: number; limit: number }>({
    total: 0,
    totalPages: 1,
    limit: 24
  });

  // Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [activeAsset, setActiveAsset] = useState<MediaAssetItem | null>(null);
  const [editingMetadata, setEditingMetadata] = useState<{
    altText: string;
    title: string;
    caption: string;
    description: string;
  }>({ altText: '', title: '', caption: '', description: '' });

  const [savingMetadata, setSavingMetadata] = useState<boolean>(false);
  const [deletingAsset, setDeletingAsset] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Diagnostics State
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  const fetchMediaAssets = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const token = getAdminToken();
      const query = new URLSearchParams();
      query.set('page', String(page));
      query.set('limit', '24');
      if (search) query.set('search', search);
      if (typeFilter) query.set('type', typeFilter);

      const res = await fetch(`/api/admin/media?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setItems(json.data.items);
        setPagination({
          total: json.data.pagination.total,
          totalPages: json.data.pagination.totalPages,
          limit: json.data.pagination.limit
        });
      }
    } catch (err: any) {
      setActionError('Failed to load media library assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaAssets();
  }, [page, search, typeFilter]);

  const handleOpenAssetDrawer = (asset: MediaAssetItem) => {
    setActiveAsset(asset);
    setEditingMetadata({
      altText: asset.altText || '',
      title: asset.title || '',
      caption: asset.caption || '',
      description: (asset as any).description || ''
    });
    setActionError(null);
  };

  const handleSaveMetadata = async () => {
    if (!activeAsset) return;
    setSavingMetadata(true);
    setActionError(null);

    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/media/${activeAsset.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingMetadata)
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to update metadata.');
      }

      setActiveAsset((prev) => (prev ? { ...prev, ...editingMetadata } : null));
      fetchMediaAssets();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update media asset metadata.');
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleDeleteAsset = async () => {
    if (!activeAsset) return;
    if (!window.confirm(`Are you sure you want to delete media asset '${activeAsset.originalFilename}'?`)) return;

    setDeletingAsset(true);
    setActionError(null);

    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/media/${activeAsset.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to delete asset.');
      }

      setActiveAsset(null);
      fetchMediaAssets();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete media asset.');
    } finally {
      setDeletingAsset(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleRunDiagnostics = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch('/api/admin/media/diagnostics/orphans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setDiagnostics(json.data);
        setShowDiagnostics(true);
      }
    } catch {
      // Catch errors
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Self-Hosted Media Library</h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
              VPS File Storage
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage media files physically stored on your server and indexed in PostgreSQL via Prisma.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunDiagnostics}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-4 h-4 text-slate-500" />
            <span>Diagnostics</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search, Filters, View Modes */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search filename or title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Media Types</option>
              <option value="image">Images (JPEG, PNG, WebP, GIF)</option>
              <option value="document">PDF Documents</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Media Assets Grid / List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs font-semibold">Loading media assets...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No media assets found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload images or documents to your self-hosted VPS storage to display them in this library.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
          >
            Upload Your First Asset
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((asset) => {
            const isImg = asset.mimeType.startsWith('image/');
            return (
              <div
                key={asset.id}
                onClick={() => handleOpenAssetDrawer(asset)}
                className="group bg-white rounded-2xl border border-slate-200 p-2.5 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center mb-2">
                  {isImg ? (
                    <img
                      src={asset.publicUrl}
                      alt={asset.altText || asset.originalFilename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                      <FileText className="w-10 h-10 text-rose-500 mb-1" />
                      <span className="text-[10px] font-bold uppercase">{asset.fileExtension}</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800 truncate" title={asset.originalFilename}>
                    {asset.title || asset.originalFilename}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isImg && asset.width && asset.height ? `${asset.width}×${asset.height} • ` : ''}
                    {(asset.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3">Asset</th>
                <th className="p-3">Type</th>
                <th className="p-3">Dimensions</th>
                <th className="p-3">Size</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((asset) => {
                const isImg = asset.mimeType.startsWith('image/');
                return (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {isImg ? (
                            <img src={asset.publicUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-5 h-5 text-rose-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{asset.originalFilename}</p>
                          <p className="text-[10px] text-slate-400">{asset.publicUrl}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">{asset.mimeType}</td>
                    <td className="p-3 text-slate-600">
                      {isImg && asset.width ? `${asset.width}×${asset.height} px` : '—'}
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{(asset.size / 1024).toFixed(1)} KB</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleOpenAssetDrawer(asset)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]"
                      >
                        Inspect / Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500">
            Showing Page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total)
          </span>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Media Detail Drawer / Drawer Modal */}
      {activeAsset && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Asset Details</h3>
              <button
                onClick={() => setActiveAsset(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Asset Preview Box */}
            <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 text-center">
              {activeAsset.mimeType.startsWith('image/') ? (
                <img
                  src={activeAsset.publicUrl}
                  alt={activeAsset.altText || ''}
                  className="max-h-48 rounded-xl mx-auto shadow-sm object-contain"
                />
              ) : (
                <div className="py-8 text-slate-500">
                  <FileText className="w-12 h-12 text-rose-500 mx-auto mb-2" />
                  <p className="text-xs font-bold">{activeAsset.originalFilename}</p>
                </div>
              )}
            </div>

            {/* Asset Specs */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Filename:</span>
                <span className="font-bold text-slate-800 truncate max-w-[180px]">{activeAsset.filename}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>MIME Type:</span>
                <span className="text-slate-800">{activeAsset.mimeType}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Dimensions:</span>
                <span className="text-slate-800">
                  {activeAsset.width ? `${activeAsset.width} × ${activeAsset.height} px` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>File Size:</span>
                <span className="text-slate-800">{(activeAsset.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>

            {/* Public URL Action */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={activeAsset.publicUrl}
                className="flex-1 px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-700"
              />
              <button
                onClick={() => handleCopyUrl(activeAsset.publicUrl)}
                className="px-3 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 text-xs flex items-center gap-1"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Metadata Editor Form */}
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Metadata Settings</h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alt Text (Accessibility)</label>
                <input
                  type="text"
                  value={editingMetadata.altText}
                  onChange={(e) => setEditingMetadata({ ...editingMetadata, altText: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingMetadata.title}
                  onChange={(e) => setEditingMetadata({ ...editingMetadata, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Caption</label>
                <input
                  type="text"
                  value={editingMetadata.caption}
                  onChange={(e) => setEditingMetadata({ ...editingMetadata, caption: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                disabled={deletingAsset}
                onClick={handleDeleteAsset}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {deletingAsset ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Asset</span>
              </button>

              <button
                disabled={savingMetadata}
                onClick={handleSaveMetadata}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                {savingMetadata ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>Save Metadata</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal Wrapper */}
      <MediaPickerModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSelectAsset={() => {
          setIsUploadModalOpen(false);
          fetchMediaAssets();
        }}
        title="Upload Media Asset"
      />

      {/* Diagnostics Modal */}
      {showDiagnostics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Media System Diagnostics</h3>
              <button onClick={() => setShowDiagnostics(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold">
                <div>Total Disk Files: {diagnostics?.totalDiskFiles}</div>
                <div>Total DB Records: {diagnostics?.totalDbRecords}</div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Orphan Disk Files (No DB Record):</h4>
                {diagnostics?.orphanPhysicalFiles?.length > 0 ? (
                  <ul className="bg-amber-50 p-3 rounded-xl text-amber-800 font-mono text-[11px] max-h-32 overflow-y-auto">
                    {diagnostics.orphanPhysicalFiles.map((f: string) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-xl">
                    ✓ Clean! No orphan disk files detected.
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Missing Disk Files for DB Records:</h4>
                {diagnostics?.missingPhysicalFilesForDbRecords?.length > 0 ? (
                  <ul className="bg-rose-50 p-3 rounded-xl text-rose-800 font-mono text-[11px] max-h-32 overflow-y-auto">
                    {diagnostics.missingPhysicalFilesForDbRecords.map((a: any) => (
                      <li key={a.id}>{a.filename}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-xl">
                    ✓ Clean! All database assets exist physically on disk.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowDiagnostics(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
