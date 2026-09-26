export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface SeoMetadata {
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  schemaJson: string;
}

export interface PageSection {
  id: string;
  type: 'hero' | 'richText' | 'cta' | 'faq' | 'toolGrid';
  data: Record<string, any>;
}

export interface PageVersion {
  id: string;
  pageId: string;
  versionNumber: number;
  content: {
    sections: PageSection[];
  };
  seoMetadata: SeoMetadata;
  changeSummary: string;
  createdBy: string;
  createdAt: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedVersionId: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  createdBy: string;
  updatedBy: string;
}

export interface ToolContent {
  id: string;
  slug: string;
  toolName: string;
  shortDescription: string;
  longDescription: string;
  iconIdentifier: string;
  categoryLabel: string;
  faq: Array<{ question: string; answer: string }>;
  relatedTools: string[];
  seoMetadata: SeoMetadata;
  introContent: string;
  educationalContent: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NavItem {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
  target: '_self' | '_blank';
}

export interface NavigationMenu {
  id: string;
  name: string;
  location: 'header' | 'footer';
  items: NavItem[];
  updatedAt: string;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  defaultSeoTitle: string;
  defaultMetaDescription: string;
  defaultOgImage: string;
  footerText: string;
  socialLinks: Array<{ platform: string; url: string }>;
  updatedAt: string;
}

const TOKEN_KEY = 'text_tools_admin_jwt';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `API request failed with status ${res.status}`);
  }

  return json.data as T;
}

// --- Public API ---
export async function getPublicPage(slug: string, previewToken?: string) {
  const url = previewToken
    ? `/api/public/pages/${slug}?previewToken=${previewToken}`
    : `/api/public/pages/${slug}`;
  return apiRequest<{ page: Page; version: PageVersion }>(url);
}

export async function getPublicTool(slug: string) {
  return apiRequest<ToolContent>(`/api/public/tools/${slug}`);
}

export async function getPublicNavigation() {
  return apiRequest<NavigationMenu[]>('/api/public/navigation');
}

export async function getPublicSettings() {
  return apiRequest<SiteSettings>('/api/public/settings');
}

// --- Admin Auth API ---
export async function adminLogin(email: string, password: string) {
  const res = await apiRequest<{ token: string; user: AdminUser }>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setAdminToken(res.token);
  return res;
}

export async function getAdminMe() {
  return apiRequest<{ user: AdminUser }>('/api/admin/auth/me');
}

// --- Admin Dashboard API ---
export async function getDashboardStats() {
  return apiRequest<{
    totalPages: number;
    publishedPages: number;
    draftPages: number;
    archivedPages: number;
    totalTools: number;
    totalBlogPosts?: number;
    publishedBlogPosts?: number;
    draftBlogPosts?: number;
    totalMediaAssets?: number;
    recentBlogPosts?: Array<{
      id: string;
      slug: string;
      title: string;
      status: string;
      updatedAt: string;
    }>;
    recentRevisions: Array<{
      id: string;
      pageTitle: string;
      pageSlug: string;
      versionNumber: number;
      changeSummary: string;
      createdBy: string;
      createdAt: string;
    }>;
    recentlyUpdatedPages: Array<{
      id: string;
      slug: string;
      title: string;
      status: string;
      updatedAt: string;
      updatedBy: string;
    }>;
  }>('/api/admin/dashboard/stats');
}

// --- Admin Pages API ---
export async function getAdminPages() {
  return apiRequest<Array<{
    id: string;
    slug: string;
    title: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    updatedAt: string;
    publishedAt: string | null;
    createdBy: string;
    updatedBy: string;
    totalVersionsCount: number;
    publishedVersionNumber: number | null;
    latestVersionNumber: number | null;
  }>>('/api/admin/pages');
}

export async function createAdminPage(data: {
  slug: string;
  title: string;
  sections?: PageSection[];
  seoMetadata?: Partial<SeoMetadata>;
}) {
  return apiRequest<{ page: Page; version: PageVersion }>('/api/admin/pages', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getAdminPage(id: string) {
  return apiRequest<{
    page: Page;
    latestVersion: PageVersion;
    publishedVersion: PageVersion | null;
    versionsSummary: Array<{
      id: string;
      versionNumber: number;
      createdAt: string;
      createdBy: string;
      changeSummary: string;
      isPublished: boolean;
    }>;
  }>(`/api/admin/pages/${id}`);
}

export async function saveAdminPageDraft(id: string, data: {
  title?: string;
  sections?: PageSection[];
  seoMetadata?: SeoMetadata;
  changeSummary?: string;
}) {
  return apiRequest<{ page: Page; version: PageVersion }>(`/api/admin/pages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function publishAdminPage(id: string, versionId?: string) {
  return apiRequest<{ page: Page; publishedVersion: PageVersion }>(`/api/admin/pages/${id}/publish`, {
    method: 'POST',
    body: JSON.stringify({ versionId })
  });
}

export async function archiveAdminPage(id: string) {
  return apiRequest<Page>(`/api/admin/pages/${id}/archive`, {
    method: 'POST'
  });
}

export async function getAdminPageRevisions(id: string) {
  return apiRequest<{
    page: Page;
    publishedVersionId: string | null;
    revisions: PageVersion[];
  }>(`/api/admin/pages/${id}/revisions`);
}

export async function restoreAdminPageRevision(id: string, versionId: string) {
  return apiRequest<{
    page: Page;
    restoredVersion: PageVersion;
    restoredFromVersionNumber: number;
  }>(`/api/admin/pages/${id}/revisions/${versionId}/restore`, {
    method: 'POST'
  });
}

// --- Admin Tools API ---
export async function getAdminTools() {
  return apiRequest<ToolContent[]>('/api/admin/tools');
}

export async function getAdminTool(slug: string) {
  return apiRequest<ToolContent>(`/api/admin/tools/${slug}`);
}

export async function updateAdminTool(slug: string, data: Partial<ToolContent>) {
  return apiRequest<ToolContent>(`/api/admin/tools/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// --- Admin Navigation API ---
export async function getAdminNavigation() {
  return apiRequest<NavigationMenu[]>('/api/admin/navigation');
}

export async function updateAdminNavigation(location: 'header' | 'footer', items: NavItem[]) {
  return apiRequest<NavigationMenu>(`/api/admin/navigation/${location}`, {
    method: 'PUT',
    body: JSON.stringify({ items })
  });
}

// --- Admin Settings API ---
export async function getAdminSettings() {
  return apiRequest<SiteSettings>('/api/admin/settings');
}

export async function updateAdminSettings(data: Partial<SiteSettings>) {
  return apiRequest<SiteSettings>('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// ==========================================
// BLOG CMS TYPES & CLIENT APIS
// ==========================================

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent?: BlogCategory | null;
  children?: BlogCategory[];
  featuredImageId: string | null;
  featuredImage?: any;
  seoMetadata: SeoMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  seoMetadata: SeoMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostRevision {
  id: string;
  postId: string;
  versionNumber: number;
  title: string;
  content: any; // Real Tiptap JSON document
  excerpt: string | null;
  seoMetadata: SeoMetadata;
  changeSummary: string | null;
  createdBy: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: any; // Real Tiptap JSON document
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  authorId: string | null;
  author?: AdminUser | null;
  featuredImageId: string | null;
  featuredImage?: any;
  categoryId: string | null;
  category?: BlogCategory | null;
  tags?: BlogTag[];
  seoMetadata: SeoMetadata;
}

export interface BlogListResponse {
  posts: BlogPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// --- Admin Blog APIs ---
export async function getAdminBlogPosts(params?: {
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
  authorId?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.status) query.append('status', params.status);
  if (params?.categoryId) query.append('categoryId', params.categoryId);
  if (params?.authorId) query.append('authorId', params.authorId);
  if (params?.search) query.append('search', params.search);

  return apiRequest<BlogListResponse>(`/api/admin/blog/posts?${query.toString()}`);
}

export async function getAdminBlogPost(id: string) {
  return apiRequest<{ post: BlogPost; revisions: BlogPostRevision[] }>(`/api/admin/blog/posts/${id}`);
}

export async function createAdminBlogPost(data: Partial<BlogPost> & { tagIds?: string[] }) {
  return apiRequest<BlogPost>('/api/admin/blog/posts', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateAdminBlogPost(id: string, data: Partial<BlogPost> & { tagIds?: string[]; changeSummary?: string }) {
  return apiRequest<BlogPost>(`/api/admin/blog/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function publishAdminBlogPost(id: string) {
  return apiRequest<BlogPost>(`/api/admin/blog/posts/${id}/publish`, {
    method: 'POST'
  });
}

export async function scheduleAdminBlogPost(id: string, scheduledAt: string) {
  return apiRequest<BlogPost>(`/api/admin/blog/posts/${id}/schedule`, {
    method: 'POST',
    body: JSON.stringify({ scheduledAt })
  });
}

export async function archiveAdminBlogPost(id: string) {
  return apiRequest<BlogPost>(`/api/admin/blog/posts/${id}/archive`, {
    method: 'POST'
  });
}

export async function duplicateAdminBlogPost(id: string) {
  return apiRequest<BlogPost>(`/api/admin/blog/posts/${id}/duplicate`, {
    method: 'POST'
  });
}

export async function restoreAdminBlogPostRevision(id: string, revisionId: string) {
  return apiRequest<BlogPost>(`/api/admin/blog/posts/${id}/restore`, {
    method: 'POST',
    body: JSON.stringify({ revisionId })
  });
}

export async function deleteAdminBlogPost(id: string) {
  return apiRequest<BlogPost>(`/api/admin/blog/posts/${id}`, {
    method: 'DELETE'
  });
}

export async function getAdminBlogCategories() {
  return apiRequest<BlogCategory[]>('/api/admin/blog/categories');
}

export async function createAdminBlogCategory(data: Partial<BlogCategory>) {
  return apiRequest<BlogCategory>('/api/admin/blog/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateAdminBlogCategory(id: string, data: Partial<BlogCategory>) {
  return apiRequest<BlogCategory>(`/api/admin/blog/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteAdminBlogCategory(id: string) {
  return apiRequest<BlogCategory>(`/api/admin/blog/categories/${id}`, {
    method: 'DELETE'
  });
}

export async function getAdminBlogTags() {
  return apiRequest<BlogTag[]>('/api/admin/blog/tags');
}

export async function createAdminBlogTag(data: Partial<BlogTag>) {
  return apiRequest<BlogTag>('/api/admin/blog/tags', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateAdminBlogTag(id: string, data: Partial<BlogTag>) {
  return apiRequest<BlogTag>(`/api/admin/blog/tags/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteAdminBlogTag(id: string) {
  return apiRequest<BlogTag>(`/api/admin/blog/tags/${id}`, {
    method: 'DELETE'
  });
}

// --- Public Blog APIs ---
export async function getPublicBlogPosts(params?: {
  page?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.categorySlug) query.append('categorySlug', params.categorySlug);
  if (params?.tagSlug) query.append('tagSlug', params.tagSlug);

  return apiRequest<BlogListResponse>(`/api/public/blog/posts?${query.toString()}`);
}

export async function getPublicBlogPost(slug: string, previewToken?: string) {
  const query = previewToken ? `?previewToken=${encodeURIComponent(previewToken)}` : '';
  return apiRequest<{
    post: BlogPost;
    isPreview: boolean;
    relatedPosts: any[];
    articleJsonLd: any;
    breadcrumbJsonLd: any;
    redirect?: { toPath: string; statusCode: number };
  }>(`/api/public/blog/posts/${slug}${query}`);
}

export async function getPublicBlogCategories() {
  return apiRequest<BlogCategory[]>('/api/public/blog/categories');
}

export async function getPublicBlogCategory(slug: string) {
  return apiRequest<BlogCategory>(`/api/public/blog/categories/${slug}`);
}

export async function getPublicBlogTags() {
  return apiRequest<BlogTag[]>('/api/public/blog/tags');
}

export async function getPublicBlogTag(slug: string) {
  return apiRequest<BlogTag>(`/api/public/blog/tags/${slug}`);
}

