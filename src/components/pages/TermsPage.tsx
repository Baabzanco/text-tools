import React, { useEffect } from 'react';
import { updatePageMetadata } from '../../lib/seo/metadata';

export const TermsPage: React.FC = () => {
  useEffect(() => {
    updatePageMetadata(
      {
        title: 'Terms of Service – Text Tools',
        description: 'Read the Terms of Service for using the free Text Tools utility platform.'
      },
      '/terms'
    );
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
      <p className="text-sm text-slate-600 leading-relaxed">
        Text Tools is provided as a free utility platform. By using this platform, you agree to these simple guidelines:
      </p>

      <div className="space-y-4 text-xs text-slate-600 leading-relaxed bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-sm font-bold text-slate-900">1. As-Is Availability</h2>
        <p>
          All tools are provided "as is" without warranties of any kind. While our client-side utilities are tested for precision, users are encouraged to verify critical text calculations before publishing or deploying code.
        </p>

        <h2 className="text-sm font-bold text-slate-900">2. Free Access</h2>
        <p>
          Text Tools is completely free to use for personal, educational, or commercial projects.
        </p>

        <h2 className="text-sm font-bold text-slate-900">3. Intellectual Property</h2>
        <p>
          You retain 100% ownership of any text or code processed using Text Tools. We claim zero rights or ownership over your content.
        </p>
      </div>
    </div>
  );
};
