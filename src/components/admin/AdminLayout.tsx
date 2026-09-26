import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Wand2,
  Navigation,
  Settings,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  UserCheck,
  ExternalLink
} from 'lucide-react';
import { getAdminMe, removeAdminToken, AdminUser } from '../../lib/api/cms-client';

interface Props {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    getAdminMe()
      .then((res) => {
        setUser(res.user);
        setLoading(false);
      })
      .catch(() => {
        removeAdminToken();
        navigate('/admin/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    removeAdminToken();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Authenticating admin session...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    {
      label: 'Blog Posts',
      path: '/admin/blog',
      icon: BookOpen,
      subItems: [
        { label: 'All Posts', path: '/admin/blog' },
        { label: 'New Post', path: '/admin/blog/new' },
        { label: 'Categories', path: '/admin/blog/categories' },
        { label: 'Tags', path: '/admin/blog/tags' }
      ]
    },
    { label: 'Pages', path: '/admin/pages', icon: FileText },
    { label: 'Media Library', path: '/admin/media', icon: ImageIcon },
    { label: '50 Tools Content', path: '/admin/tools', icon: Wand2 },
    { label: 'Navigation', path: '/admin/navigation', icon: Navigation },
    { label: 'Site Settings', path: '/admin/settings', icon: Settings }
  ];

  const isActivePath = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2 text-white font-extrabold text-base tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              TT
            </div>
            <span>Text Tools CMS</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
            Active CMS
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(item.path);
            const isBlogActive = item.path === '/admin/blog' && location.pathname.startsWith('/admin/blog');

            return (
              <div key={item.path} className="space-y-1">
                <Link
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>

                {/* Sub-items for Blog when on Blog routes */}
                {item.subItems && isBlogActive && (
                  <div className="pl-9 pr-2 py-1 space-y-1 border-l-2 border-indigo-500/30 ml-4 my-1">
                    {item.subItems.map((sub) => {
                      const subActive =
                        sub.path === '/admin/blog'
                          ? location.pathname === '/admin/blog'
                          : location.pathname.startsWith(sub.path);
                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`block px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                            subActive
                              ? 'text-indigo-400 font-bold bg-indigo-950/50'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Footer Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">{user?.name}</span>
              <span className="text-[10px] text-indigo-400 font-mono block">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout Admin Session"
            className="text-slate-400 hover:text-rose-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Text Tools CMS Administration
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
              <span>View Live Website</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 text-slate-300 p-4 border-b border-slate-800 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item.path);
              const isBlogActive = item.path === '/admin/blog' && location.pathname.startsWith('/admin/blog');

              return (
                <div key={item.path} className="space-y-1">
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      active ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>

                  {item.subItems && isBlogActive && (
                    <div className="pl-9 pr-2 py-1 space-y-1 border-l-2 border-indigo-500/30 ml-4 my-1">
                      {item.subItems.map((sub) => {
                        const subActive =
                          sub.path === '/admin/blog'
                            ? location.pathname === '/admin/blog'
                            : location.pathname.startsWith(sub.path);
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
                              subActive ? 'text-indigo-400 font-bold bg-indigo-950/50' : 'text-slate-400'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
