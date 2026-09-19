import { api } from './client';

// ---- Auth (admin/agent staff only) ----
export const authApi = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  changePassword: (data) => api.patch('/auth/change-password', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
};

// ---- Packages ----
export const packageApi = {
  list: (params) => api.get('/packages', { params }).then((r) => r.data),
  bySlug: (slug) => api.get(`/packages/${slug}`).then((r) => r.data),
};

// ---- Categories ----
export const categoryApi = {
  list: () => api.get('/categories').then((r) => r.data),
  blogList: () => api.get('/categories/blog').then((r) => r.data),
};

// ---- Destinations ----
export const destinationApi = {
  list: () => api.get('/destinations').then((r) => r.data),
  trending: () => api.get('/destinations/trending').then((r) => r.data),
};

// ---- Blogs ----
export const blogApi = {
  list: (params) => api.get('/blogs', { params }).then((r) => r.data),
  bySlug: (slug) => api.get(`/blogs/${slug}`).then((r) => r.data),
};

// ---- Stats ----
export const statsApi = {
  public: () => api.get('/stats').then((r) => r.data),
};

// ---- Search ----
export const searchApi = {
  search: (q) => api.get('/search', { params: { q } }).then((r) => r.data),
};

// ---- Reviews ----
export const reviewApi = {
  byPackage: (slug) => api.get(`/reviews/${slug}/reviews`).then((r) => r.data),
  byPackageAdmin: (slug) => api.get(`/reviews/admin/${slug}/reviews`).then((r) => r.data),
  create: (slug, data) => api.post(`/reviews/${slug}/reviews`, data).then((r) => r.data),
  delete: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
};

// ---- Enquiries ----
export const enquiryApi = {
  create: (data) => api.post('/enquiries', data).then((r) => r.data),
  lookup: (params) => api.get('/enquiries/lookup', { params }).then((r) => r.data),
};

// ---- Trip Requests ----
export const tripRequestApi = {
  create: (data) => api.post('/trip-requests', data).then((r) => r.data),
};

// ---- AI chat assistant ----
export const chatApi = {
  // Local Ollama models can take a while on first/long responses, so give the
  // chat endpoint a generous timeout while keeping the global 20s for the rest.
  send: (messages) =>
    api.post('/chat', { messages }, { timeout: 120000 }).then((r) => r.data),
};

// ---- Newsletter ----
export const newsletterApi = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }).then((r) => r.data),
};

// ---- Contact ----
export const contactApi = {
  create: (data) => api.post('/contact', data).then((r) => r.data),
};

// ---- Site content ----
export const siteContentApi = {
  get: (section) => api.get(`/site-content/${section}`).then((r) => r.data),
};

// ---- Admin ----
export const adminApi = {
  // Dashboard
  dashboard: () => api.get('/admin/dashboard').then((r) => r.data),

  // Users
  users: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  user: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  createUser: (data) => api.post('/admin/users', data).then((r) => r.data),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),

  // Enquiries
  enquiries: (params) => api.get('/admin/enquiries', { params }).then((r) => r.data),
  updateEnquiry: (id, body) => api.patch(`/admin/enquiries/${id}`, body).then((r) => r.data),
  deleteEnquiry: (id) => api.delete(`/admin/enquiries/${id}`).then((r) => r.data),

  // Categories
  categories: (params) => api.get('/admin/categories', { params }).then((r) => r.data),
  createCategory: (data) => api.post('/admin/categories', data).then((r) => r.data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data).then((r) => r.data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data),

  // Newsletter
  subscribers: (params) => api.get('/admin/newsletter/subscribers', { params }).then((r) => r.data),
  createSubscriber: (email) => api.post('/admin/newsletter/subscribers', { email }).then((r) => r.data),
  toggleSubscriber: (id) => api.patch(`/admin/newsletter/subscribers/${id}`).then((r) => r.data),
  deleteSubscriber: (id) => api.delete(`/admin/newsletter/subscribers/${id}`).then((r) => r.data),
  sendNewsletter: (data) => api.post('/admin/newsletter/send', data).then((r) => r.data),

  // Contact requests
  contactRequests: () => api.get('/contact/admin').then((r) => r.data),
  contactRequest: (id) => api.get(`/contact/admin/${id}`).then((r) => r.data),
  updateContactRequest: (id, body) => api.patch(`/contact/admin/${id}`, body).then((r) => r.data),
  deleteContactRequest: (id) => api.delete(`/contact/admin/${id}`).then((r) => r.data),

  // Trip requests
  tripRequests: () => api.get('/trip-requests/admin').then((r) => r.data),
  updateTripRequest: (id, body) => api.patch(`/trip-requests/admin/${id}`, body).then((r) => r.data),
  deleteTripRequest: (id) => api.delete(`/trip-requests/admin/${id}`).then((r) => r.data),

  // Reviews
  reviews: (params) => api.get('/reviews/admin', { params }).then((r) => r.data),
  updateReview: (id, body) => api.patch(`/reviews/admin/${id}`, body).then((r) => r.data),

  // Packages (admin: full CRUD over existing endpoints)
  packages: (params) => api.get('/packages', { params }).then((r) => r.data),
  package: (id) => api.get(`/packages/${id}`).then((r) => r.data),
  packageBySlug: (slug) => api.get(`/admin/packages/slug/${slug}`).then((r) => r.data),
  createPackage: (data) => api.post('/packages', data).then((r) => r.data),
  updatePackage: (id, data) => api.patch(`/packages/${id}`, data).then((r) => r.data),
  deletePackage: (id) => api.delete(`/packages/${id}`).then((r) => r.data),
  uploadPackageImage: (formData) =>
    api.post('/packages/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),

  // Blogs (admin: full CRUD over existing endpoints)
  blogs: (params) => api.get('/blogs', { params }).then((r) => r.data),
  blog: (id) => api.get(`/blogs/${id}`).then((r) => r.data),
  createBlog: (formData) =>
    api.post('/blogs', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  updateBlog: (id, formData) =>
    api.patch(`/blogs/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  deleteBlog: (id) => api.delete(`/blogs/${id}`).then((r) => r.data),

  // Site content
  siteContentAll: () => api.get('/site-content/admin').then((r) => r.data),
  updateSiteContent: (section, data) => api.put(`/site-content/admin/${section}`, data).then((r) => r.data),

  // Notifications
  notifications: (params) => api.get('/admin/notifications', { params }).then((r) => r.data),
  broadcastNotification: (body) => api.post('/admin/notifications/broadcast', body).then((r) => r.data),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`).then((r) => r.data),
};
