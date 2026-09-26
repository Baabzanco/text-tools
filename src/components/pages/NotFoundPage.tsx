import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wand2, ArrowLeft } from 'lucide-react';
import { updatePageMetadata } from '../../lib/seo/metadata';

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    updatePageMetadata(
      {
        title: '404 - Page Not Found | Text Tools',
        description: 'The requested page could not be found.'
      },
      '/404'
    );
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-3xl flex items-center justify-center mx-auto">
        <Wand2 className="w-8 h-8 text-indigo-600" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-semibold text-rose-600 uppercase tracking-widest">
          404 Error
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-600">
          The page or text utility you requested doesn't exist or has been moved.
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/text-tools"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <span>All Text Tools</span>
        </Link>
      </div>
    </div>
  );
};
