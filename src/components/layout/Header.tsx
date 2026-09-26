import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wand2, Menu, X, ArrowRight } from 'lucide-react';
import { getPublicNavigation, NavItem } from '../../lib/api/cms-client';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: '1', label: 'All Tools', url: '/text-tools', order: 1, isActive: true, target: '_self' },
    { id: '2', label: 'Developer', url: '/developer-tools', order: 2, isActive: true, target: '_self' },
    { id: '3', label: 'SEO', url: '/seo-tools', order: 3, isActive: true, target: '_self' },
    { id: '4', label: 'Blog', url: '/blog', order: 4, isActive: true, target: '_self' },
    { id: '5', label: 'About', url: '/about', order: 5, isActive: true, target: '_self' }
  ]);

  const location = useLocation();

  useEffect(() => {
    getPublicNavigation()
      .then((menus) => {
        const hMenu = menus.find((m) => m.location === 'header');
        if (hMenu && hMenu.items && hMenu.items.length > 0) {
          const activeItems = hMenu.items.filter((i) => i.isActive).sort((a, b) => a.order - b.order);
          if (activeItems.length > 0) {
            setNavItems(activeItems);
          }
        }
      })
      .catch(() => {});
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-indigo-600 transition-colors">
            <Wand2 className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
              Text Tools
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase mt-0.5">
              100% Client-Side
            </span>
          </div>
        </Link>

        {/* Zone 2: Navigation Links (from CMS) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.url}
              target={item.target}
              className={`transition-colors hover:text-slate-900 ${
                isActive(item.url) ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Primary Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors whitespace-nowrap"
          >
            <span>Admin Portal</span>
          </Link>

          <Link
            to="/tools/word-counter"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-indigo-600 transition-colors shadow-xs whitespace-nowrap"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.url}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
            >
              <span>Admin Portal</span>
            </Link>
            <Link
              to="/tools/word-counter"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
