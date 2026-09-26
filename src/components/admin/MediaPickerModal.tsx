import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, FileText, Upload, Search, X, Check, Loader2 } from 'lucide-react';
import { getAdminToken } from '../../lib/api/cms-client';

export interface MediaAssetItem {
  id: string;
  originalFilename: string;
  filename: string;
  mimeType: string;
  fileExtension: string;
  size: number;
  publicUrl: string;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  title?: string | null;
  caption?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: MediaAssetItem) => void;
  title?: string;
  filterType?: string; // 'image' | 'document' | ''
}

export const MediaPickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectAsset,
  title = 'Select Media Asset',
  filterType = ''
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [items, setItems] = useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>(filterType);
  const [selectedItem, setSelectedItem] = useState<MediaAssetItem | null>(null);

  // Upload State
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [altText, setAltText] = useState<string>('');

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const query = new URLSearchParams();
      query.set('page', '1');
      query.set('limit', '40');
      if (search) query.set('search', search);
      if (typeFilter) query.set('type', typeFilter);

      const res = await fetch(`/api/admin/media?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setItems(json.data.items);
      }
    } catch {
      // Silently catch fetch errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen, search, typeFilter]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);

    try {
      const token = getAdminToken();
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Upload failed.');
      }

      const newAsset = json.data;
      onSelectAsset(newAsset);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedItem) {
      onSelectAsset(selectedItem);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">Choose an asset from your Media Library or upload a new file.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Filters */}
        <div className="px-5 pt-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'library'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Media Library
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Upload New
            </button>
          </div>

          {activeTab === 'library' && (
            <div className="flex items-center gap-2 pb-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Types</option>
                <option value="image">Images</option>
                <option value="document">PDF Documents</option>
              </select>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-5 overflow-y-auto min-h-[320px]">
          {activeTab === 'library' ? (
            loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="text-xs font-medium">Loading media assets...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No media assets found</p>
                <p className="text-[11px] text-slate-500 mt-1">Upload a file or adjust search filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {items.map((asset) => {
                  const isSelected = selectedItem?.id === asset.id;
                  const isImg = asset.mimeType.startsWith('image/');

                  return (
                    <button
                      key={asset.id}
                      onClick={() => setSelectedItem(asset)}
                      className={`group relative rounded-xl border p-2 text-left transition-all overflow-hidden flex flex-col ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-full aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center relative mb-2">
                        {isImg ? (
                          <img
                            src={asset.publicUrl}
                            alt={asset.altText || asset.originalFilename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                            <FileText className="w-8 h-8 text-rose-500 mb-1" />
                            <span className="text-[10px] font-bold uppercase">{asset.fileExtension}</span>
                          </div>
                        )}

                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-800 truncate w-full">{asset.title || asset.originalFilename}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {isImg && asset.width && asset.height ? `${asset.width}×${asset.height} • ` : ''}
                        {(asset.size / 1024).toFixed(0)} KB
                      </p>
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div className="max-w-md mx-auto py-8">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Drop your file here, or browse</h4>
                <p className="text-xs text-slate-500 mt-1">Supports JPEG, PNG, WebP, GIF, PDF (Max 20MB)</p>

                {uploading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600 text-xs font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading and validating media...</span>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Alt Text / Caption (Optional)</label>
                  <input
                    type="text"
                    placeholder="Descriptive text for accessibility"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {uploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                    {uploadError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {selectedItem ? (
              <span className="font-semibold text-slate-800">Selected: {selectedItem.originalFilename}</span>
            ) : (
              <span>No asset selected</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!selectedItem || activeTab === 'upload'}
              onClick={handleConfirmSelection}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              Insert Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
