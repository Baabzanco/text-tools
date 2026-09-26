import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToolPage } from './components/pages/ToolPage';
import { NotFoundPage } from './components/pages/NotFoundPage';
import { PublicCmsPage } from './components/cms/PublicCmsPage';

// Public Blog Imports
import { BlogListingPage } from './components/public/BlogListingPage';
import { BlogPostPage } from './components/public/BlogPostPage';

// Admin Imports
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminPagesList } from './components/admin/AdminPagesList';
import { AdminPageEditor } from './components/admin/AdminPageEditor';
import { AdminRevisions } from './components/admin/AdminRevisions';
import { AdminBlogList } from './components/admin/AdminBlogList';
import { AdminBlogEditor } from './components/admin/AdminBlogEditor';
import { AdminBlogCategories } from './components/admin/AdminBlogCategories';
import { AdminBlogTags } from './components/admin/AdminBlogTags';
import { AdminToolsList } from './components/admin/AdminToolsList';
import { AdminToolEditor } from './components/admin/AdminToolEditor';
import { AdminNavigation } from './components/admin/AdminNavigation';
import { AdminSettings } from './components/admin/AdminSettings';
import { MediaLibraryPage } from './components/admin/MediaLibraryPage';

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Public Layout Wrapper
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      <main className="flex-1">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* --- PUBLIC CMS & UTILITY ROUTES --- */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <PublicCmsPage fixedSlug="home" />
            </PublicLayout>
          }
        />
        <Route
          path="/text-tools"
          element={
            <PublicLayout>
              <PublicCmsPage fixedSlug="text-tools" />
            </PublicLayout>
          }
        />
        <Route
          path="/developer-tools"
          element={
            <PublicLayout>
              <PublicCmsPage fixedSlug="developer-tools" />
            </PublicLayout>
          }
        />
        <Route
          path="/seo-tools"
          element={
            <PublicLayout>
              <PublicCmsPage fixedSlug="seo-tools" />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <PublicCmsPage fixedSlug="about" />
            </PublicLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <PublicLayout>
              <PublicCmsPage fixedSlug="privacy" />
            </PublicLayout>
          }
        />
        <Route
          path="/terms"
          element={
            <PublicLayout>
              <PublicCmsPage fixedSlug="terms" />
            </PublicLayout>
          }
        />

        {/* 50 Tools Route */}
        <Route
          path="/tools/:slug"
          element={
            <PublicLayout>
              <ToolPage />
            </PublicLayout>
          }
        />

        {/* --- PUBLIC BLOG CMS ROUTES --- */}
        <Route
          path="/blog"
          element={
            <PublicLayout>
              <BlogListingPage />
            </PublicLayout>
          }
        />
        <Route
          path="/blog/category/:slug"
          element={
            <PublicLayout>
              <BlogListingPage />
            </PublicLayout>
          }
        />
        <Route
          path="/blog/tag/:slug"
          element={
            <PublicLayout>
              <BlogListingPage />
            </PublicLayout>
          }
        />
        <Route
          path="/blog/preview/:slug"
          element={
            <PublicLayout>
              <BlogPostPage />
            </PublicLayout>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <PublicLayout>
              <BlogPostPage />
            </PublicLayout>
          }
        />

        {/* --- ADMIN CMS ROUTES --- */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/pages"
          element={
            <AdminLayout>
              <AdminPagesList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/media"
          element={
            <AdminLayout>
              <MediaLibraryPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/blog"
          element={
            <AdminLayout>
              <AdminBlogList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/blog/new"
          element={
            <AdminLayout>
              <AdminBlogEditor />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/blog/edit/:id"
          element={
            <AdminLayout>
              <AdminBlogEditor />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/blog/categories"
          element={
            <AdminLayout>
              <AdminBlogCategories />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/blog/tags"
          element={
            <AdminLayout>
              <AdminBlogTags />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/blog/:id"
          element={
            <AdminLayout>
              <AdminBlogEditor />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/pages/:id"
          element={
            <AdminLayout>
              <AdminPageEditor />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/pages/:id/revisions"
          element={
            <AdminLayout>
              <AdminRevisions />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/tools"
          element={
            <AdminLayout>
              <AdminToolsList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/tools/:slug"
          element={
            <AdminLayout>
              <AdminToolEditor />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/navigation"
          element={
            <AdminLayout>
              <AdminNavigation />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          }
        />

        {/* Fallback 404 Route */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <NotFoundPage />
            </PublicLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
