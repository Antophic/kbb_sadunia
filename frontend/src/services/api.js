const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:8000/api");
const GET_CACHE_TTL = 60_000;
const getCache = new Map();

function getAuthHeader() {
  // Authentication is handled automatically via HTTPOnly cookie
  return {};
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return "";
}

async function ensureCSRFToken() {
  if (getCookie("csrf_token")) return;

  const tryEndpoints = [
    `${API_URL}/sitemap`,
    `${API_URL}/articles`,
    `${API_URL}/me`,
    `${API_URL}/health`,
  ];

  for (const url of tryEndpoints) {
    if (getCookie("csrf_token")) return;
    try {
      await fetch(url, {
        method: "GET",
        credentials: "include",
      });
    } catch {
      // ignore and try next
    }
  }
}

function canUseGetCache(endpoint, method) {
  if (method !== "GET") return false;
  if (!/^\/(articles|books|categories|library|sitemap|tags|trending)(\/|\?|$)/.test(endpoint)) return false;
  if (/[?&](include_content=1|status=(all|draft|review|scheduled|archived))/.test(endpoint)) return false;
  return true;
}

function rememberGetResponse(cacheKey, promise) {
  getCache.set(cacheKey, {
    expiresAt: Date.now() + GET_CACHE_TTL,
    promise,
  });

  promise.catch(() => {
    if (getCache.get(cacheKey)?.promise === promise) {
      getCache.delete(cacheKey);
    }
  });

  return promise;
}

export async function fetchAPI(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const cacheableGet = canUseGetCache(endpoint, method);
  const cacheKey = `${method}:${endpoint}`;
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    getCache.clear();
  }

  if (cacheableGet) {
    const cached = getCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.promise;
    }
    getCache.delete(cacheKey);
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    await ensureCSRFToken();
  }

  const csrfToken = getCookie("csrf_token");

  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const request = (async () => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: "include",
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "An error occurred");
    }

    return data;
  })();

  return cacheableGet ? rememberGetResponse(cacheKey, request) : request;
}

async function fetchFormAPI(endpoint, formData, fallbackError) {
  await ensureCSRFToken();

  const send = async () => {
    const csrf = getCookie("csrf_token");
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRF-Token": csrf, ...getAuthHeader() },
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  };

  let { response, data } = await send();
  if (!response.ok && response.status === 403) {
    await ensureCSRFToken();
    ({ response, data } = await send());
  }

  if (!response.ok) throw new Error(data.error || fallbackError);
  return data;
}

// Articles API
export const apiGetArticles = (params = "") => fetchAPI(`/articles${params}`);
export const apiSearchArticles = (query) => fetchAPI(`/articles?search=${encodeURIComponent(query)}`);
export const apiGetArticleById = (id) => fetchAPI(`/articles/${id}`);
export const apiGetArticleBySlug = (slug) => fetchAPI(`/articles/slug/${slug}`);
export const apiGetTrending = () => fetchAPI("/trending");
export const apiGetCategories = () => fetchAPI("/categories");
export const apiGetSitemap = () => fetchAPI("/sitemap");
export const apiGetArticleComments = (id) => fetchAPI(`/articles/${id}/comments`);
export const apiSubmitCorrection = (data) => fetchAPI("/corrections", { method: "POST", body: JSON.stringify(data) });

export const apiCreateArticle = (data) => fetchAPI("/articles", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateArticle = (id, data) => fetchAPI(`/articles/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const apiDeleteArticle = (id) => fetchAPI(`/articles/${id}`, { method: "DELETE" });

export const apiUploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return fetchFormAPI("/upload", formData, "Failed to upload image");
};

// Contact & Newsletter API
export const apiCreateContact = (name, email, subject, message) =>
  fetchAPI("/contact", { method: "POST", body: JSON.stringify({ name, email, subject, message }) });
export const apiSubscribeNewsletter = (email) =>
  fetchAPI("/newsletter", { method: "POST", body: JSON.stringify({ email }) });

// Comments API
export const apiCreateComment = (articleId, name, email, content) =>
  fetchAPI("/comments", { method: "POST", body: JSON.stringify({ article_id: articleId, author_name: name, author_email: email, content }) });
export const apiGetAdminComments = () => fetchAPI("/comments");
export const apiUpdateCommentStatus = (id, status) => fetchAPI(`/comments/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
export const apiDeleteComment = (id) => fetchAPI(`/comments/${id}`, { method: "DELETE" });

// Auth API
export const apiLogin = (email, password) =>
  fetchAPI("/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const apiLogout = () => fetchAPI("/logout", { method: "POST" });
export const apiGetMe = () => fetchAPI("/me");
export const apiForgotPassword = (email) => fetchAPI("/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
export const apiResetPassword = (token, password) => fetchAPI("/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });

// CMS Features
export const apiIncrementView = (slug) => fetchAPI(`/articles/slug/${slug}/view`, { method: "POST", body: JSON.stringify({}) });
export const apiGetRelatedArticles = (id) => fetchAPI(`/articles/${id}/related`);
export const apiReactToArticle = (id, type) => fetchAPI(`/articles/${id}/react`, { method: "POST", body: JSON.stringify({ type }) });

// Category CRUD
export const apiCreateCategory = (data) => fetchAPI("/categories", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateCategory = (id, data) => fetchAPI(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const apiDeleteCategory = (id) => fetchAPI(`/categories/${id}`, { method: "DELETE" });

// Tag CRUD
export const apiGetTags = () => fetchAPI("/tags");
export const apiCreateTag = (data) => fetchAPI("/tags", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateTag = (id, data) => fetchAPI(`/tags/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const apiDeleteTag = (id) => fetchAPI(`/tags/${id}`, { method: "DELETE" });

// User Management (Admin Only)
export const apiGetUsers = () => fetchAPI("/users");
export const apiCreateUser = (data) => fetchAPI("/users", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateUser = (id, data) => fetchAPI(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const apiDeleteUser = (id) => fetchAPI(`/users/${id}`, { method: "DELETE" });

// Media Library
export const apiGetMedia = () => fetchAPI("/media");
export const apiDeleteMedia = (filename) => fetchAPI(`/media/${encodeURIComponent(filename)}`, { method: "DELETE" });

// Settings
export const apiGetSettings = () => fetchAPI("/settings");
export const apiUpdateSettings = (data) => fetchAPI("/settings", { method: "POST", body: JSON.stringify(data) });

// Books (Digital Library)
export const apiGetBooks = (params = "") => fetchAPI(`/books${params}`);
export const apiCreateBook = (data) => fetchAPI("/books", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateBook = (id, data) => fetchAPI(`/books/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const apiDeleteBook = (id) => fetchAPI(`/books/${id}`, { method: "DELETE" });

export const apiUploadBookFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return fetchFormAPI("/upload-book", formData, "Failed to upload file");
};
