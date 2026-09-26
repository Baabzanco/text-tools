import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wand2, ShieldCheck } from 'lucide-react';
import { getPublicNavigation, getPublicSettings, NavItem, SiteSettings } from '../../lib/api/cms-client';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    siteName: 'Text Tools',
    footerText: '© 2026 Text Tools Platform. Free & Open Client-Side Utilities.'
  });

  const [footerLinks, setFooterLinks] = useState<NavItem[]>([
    { id: '1', label: 'All Tools', url: '/text-tools', order: 1, isActive: true, target: '_self' },
    { id: '2', label: 'Privacy Policy', url: '/privacy', order: 2, isActive: true, target: '_self' },
    { id: '3', label: 'Terms of Service', url: '/terms', order: 3, isActive: true, target: '_self' },
    { id: '4', label: 'About Architecture', url: '/about', order: 4, isActive: true, target: '_self' }
  ]);

  useEffect(() => {
    getPublicSettings()
      .then((data) => setSettings(data))
      .catch(() => {});

    getPublicNavigation()
      .then((menus) => {
        const fMenu = menus.find((m) => m.location === 'footer');
        if (fMenu && fMenu.items && fMenu.items.length > 0) {
          const active = fMenu.items.filter((i) => i.isActive).sort((a, b) => a.order - b.order);
          if (active.length > 0) {
            setFooterLinks(active);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Brand & Privacy Statement */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                <Wand2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">{settings.siteName || 'Text Tools'}</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fast, privacy-friendly online text utility platform. All operations execute client-side in your browser for maximum data protection.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Server Transmission</span>
            </div>
          </div>

          {/* Tools & Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/text-tools?category=text" className="hover:text-white transition-colors">
                  Text Operations
                </Link>
              </li>
              <li>
                <Link to="/developer-tools" className="hover:text-white transition-colors">
                  Developer Utilities
                </Link>
              </li>
              <li>
                <Link to="/seo-tools" className="hover:text-white transition-colors">
                  SEO & Content
                </Link>
              </li>
            </ul>
          </div>

          {/* CMS Footer Menu Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Navigation & Legal
            </h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.map((item) => (
                <li key={item.id}>
                  <Link to={item.url} target={item.target} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Link */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Administration
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/admin" className="hover:text-white text-indigo-400 font-semibold transition-colors">
                  CMS Admin Portal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
          <p>{settings.footerText || `© ${new Date().getFullYear()} Text Tools Platform. Free & Open Client-Side Utilities.`}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>No Cookies</span>
            <span>·</span>
            <span>No External Tracking</span>
            <span>·</span>
            <span>No Account Required for Tools</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
