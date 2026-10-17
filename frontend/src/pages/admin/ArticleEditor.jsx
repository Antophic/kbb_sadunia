import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apiCreateArticle, apiUpdateArticle, apiGetArticleById, apiGetArticles, apiGetCategories, apiGetTags, apiCreateTag, apiUploadImage } from "../../services/api";
import { Helmet } from "react-helmet-async";
import ReactQuill from "react-quill-new";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";
import { ArrowLeft, Image as ImageIcon, FolderTree, Tags, Search, X, Upload, Loader2, AlertCircle, CheckCircle, Clock, Link as LinkIcon, Star, Video, ExternalLink } from "lucide-react";
import OptimizedImage from "../../components/OptimizedImage";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    [{ align: [] }],
    ["clean"],
  ],
};

const slugify = (value) =>
  (value || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) return { valid: false, error: "Format gambar harus JPEG, PNG, atau WebP" };
  if (file.size > maxSize) return { valid: false, error: "Ukuran gambar tidak boleh lebih dari 5MB" };
  return { valid: true };
};

const validateImageUrl = (url) => {
  if (!url) return false;
  if (url.startsWith("/uploads/")) return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  try {
    const urlObj = new URL(url);
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(urlObj.pathname);
  } catch {
    return false;
  }
};

const articleHtmlSanitizeConfig = {
  USE_PROFILES: { html: true },
  ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "a", "img"],
  ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class"],
  ALLOW_DATA_ATTR: false,
};

const sanitizeArticleHtml = (value = "") => DOMPurify.sanitize(value, articleHtmlSanitizeConfig);

const getPlainText = (html = "") =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const estimateReadTime = (wordCount) => `${Math.max(1, Math.ceil(wordCount / 200))} menit`;

const normalizeTitle = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const titleSimilarity = (a, b) => {
  const wordsA = new Set(normalizeTitle(a).split(" ").filter((word) => word.length > 3));
  const wordsB = new Set(normalizeTitle(b).split(" ").filter((word) => word.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const shared = [...wordsA].filter((word) => wordsB.has(word)).length;
  return shared / Math.min(wordsA.size, wordsB.size);
};

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const abortControllerRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    image_caption: "",
    image_credit: "",
    video_url: "",
    category_id: "",
    status: "draft",
    published_at: "",
    read_time: "5 menit",
    source_name: "",
    source_url: "",
    editor_note: "",
    featured: false,
    meta_title: "",
    meta_description: "",
    tags: [],
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [existingArticles, setExistingArticles] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("post");
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imageContextConfirmed, setImageContextConfirmed] = useState(false);
  const plainContent = getPlainText(formData.content);
  const wordCount = plainContent ? plainContent.split(/\s+/).length : 0;
  const estimatedReadTime = estimateReadTime(wordCount);
  const completionItems = [
    { label: "Judul", done: Boolean(formData.title.trim()) },
    { label: "Konten", done: wordCount >= 20 },
    { label: "Kategori", done: Boolean(formData.category_id) },
    { label: "Gambar", done: Boolean(formData.image_url && validateImageUrl(formData.image_url)) },
    { label: "Konteks gambar", done: Boolean(imageContextConfirmed && formData.image_caption.trim() && formData.image_credit.trim()) },
    { label: "Kutipan", done: Boolean(formData.excerpt.trim()) },
    { label: "Sumber", done: Boolean(formData.source_name.trim() || formData.source_url.trim()) },
  ];
  const completionScore = Math.round((completionItems.filter((item) => item.done).length / completionItems.length) * 100);
  const similarArticles = existingArticles
    .filter((article) => String(article.id) !== String(id || ""))
    .map((article) => ({ article, score: titleSimilarity(formData.title, article.title || "") }))
    .filter((item) => item.score >= 0.55)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const duplicateImageArticle = existingArticles.find(
    (article) =>
      String(article.id) !== String(id || "") &&
      formData.image_url.trim() &&
      (article.image_url || "").trim() === formData.image_url.trim(),
  );

  const validateForm = useCallback((targetStatus = formData.status) => {
    const newErrors = {};
    const mustBeComplete = ["review", "published", "scheduled"].includes(targetStatus);
    if (!formData.title.trim()) newErrors.title = "Judul artikel wajib diisi";
    if (!formData.slug.trim()) newErrors.slug = "Slug wajib diisi";

    const plainContent = formData.content?.replace(/<[^>]*>/g, "").trim();
    if (mustBeComplete && !plainContent) newErrors.content = "Konten wajib diisi sebelum artikel diterbitkan";
    if (mustBeComplete && !formData.category_id) newErrors.category_id = "Kategori wajib dipilih sebelum artikel diterbitkan";
    if (mustBeComplete && (!formData.image_url || !validateImageUrl(formData.image_url))) newErrors.image_url = "Gambar andalan wajib valid sebelum artikel diterbitkan";
    if (mustBeComplete && formData.image_caption.trim().length < 12) newErrors.image_caption = "Caption harus menjelaskan siapa, kegiatan, atau konteks yang benar-benar tampak pada foto";
    if (mustBeComplete && formData.image_credit.trim().length < 2) newErrors.image_credit = "Kredit atau pemilik foto wajib dicantumkan";
    if (mustBeComplete && !formData.source_name.trim()) newErrors.source_name = "Nama sumber artikel wajib dicantumkan";
    if (mustBeComplete && !imageContextConfirmed) newErrors.image_context = "Periksa foto dan konfirmasi bahwa konteksnya sesuai dengan judul serta isi artikel";
    if (mustBeComplete && duplicateImageArticle) newErrors.image_url = `Gambar ini sudah dipakai pada artikel "${duplicateImageArticle.title}"`;
    if (targetStatus === "scheduled" && !formData.published_at) newErrors.published_at = "Tanggal terbit wajib diisi untuk artikel terjadwal";
    if (formData.meta_title.length > 60) newErrors.meta_title = "Meta title maksimal 60 karakter";
    if (formData.meta_description.length > 160) newErrors.meta_description = "Meta description maksimal 160 karakter";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [duplicateImageArticle, formData, imageContextConfirmed]);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const loadData = async () => {
      try {
        const [cats, tgs, articleList] = await Promise.all([
          apiGetCategories(),
          apiGetTags(),
          apiGetArticles("?per_page=100&status=all"),
        ]);
        if (controller.signal.aborted) return;
        const tagList = tgs.data || [];
        setCategories(cats.data || []);
        setAvailableTags(tagList);
        setExistingArticles(articleList.data || []);

        if (isEdit) {
          const res = await apiGetArticleById(id);
          if (!controller.signal.aborted && res.data) {
            const article = res.data;
            const selectedTagIds = (article.tags || [])
              .map((tagName) => tagList.find((t) => t.name === tagName)?.id)
              .filter(Boolean);
            setFormData({
              title: article.title || "",
              slug: article.slug || "",
              excerpt: article.excerpt || "",
              content: article.content || "",
              image_url: article.image_url || "",
              image_caption: article.image_caption || "",
              image_credit: article.image_credit || "",
              video_url: article.video_url || "",
              category_id: article.category_id || "",
              status: article.status || "draft",
              published_at: toDateTimeLocal(article.published_at),
              read_time: article.read_time || "5 menit",
              featured: Boolean(Number(article.featured || 0)),
              source_name: article.source_name || "",
              source_url: article.source_url || "",
              editor_note: article.editor_note || "",
              meta_title: article.meta_title || "",
              meta_description: article.meta_description || "",
              tags: selectedTagIds,
            });
            setSlugEdited(true);
            setImageContextConfirmed(false);
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") setErrorMessage("Gagal memuat data: " + err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [id, isEdit]);

  const updateTitle = (value) => {
    setFormData((prev) => ({ ...prev, title: value, slug: slugEdited ? prev.slug : slugify(value) }));
    setImageContextConfirmed(false);
  };

  const handleSubmit = useCallback(async (statusOverride = null) => {
    const nextStatus = statusOverride || formData.status;
    if (!validateForm(nextStatus)) {
      setErrorMessage("Mohon perbaiki bagian yang ditandai sebelum menyimpan");
      return;
    }

    const cleanContent = sanitizeArticleHtml(formData.content);
    const fallbackExcerpt = getPlainText(cleanContent).slice(0, 180);
    const dataToSubmit = {
      ...formData,
      content: cleanContent,
      status: nextStatus,
      excerpt: formData.excerpt.trim() || fallbackExcerpt,
      read_time: formData.read_time.trim() || estimatedReadTime,
      image_context_confirmed: imageContextConfirmed,
    };

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (isEdit) await apiUpdateArticle(id, dataToSubmit);
      else await apiCreateArticle(dataToSubmit);
      setSuccessMessage(nextStatus === "scheduled" ? "Artikel berhasil dijadwalkan" : nextStatus === "published" ? "Artikel berhasil diterbitkan" : "Artikel berhasil disimpan");
      setTimeout(() => navigate("/admin/articles"), 1200);
    } catch (err) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan artikel");
    } finally {
      setSaving(false);
    }
  }, [estimatedReadTime, formData, id, imageContextConfirmed, isEdit, validateForm, navigate]);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }
    setUploading(true);
    setErrorMessage("");
    try {
      const res = await apiUploadImage(file);
      setFormData((prev) => ({ ...prev, image_url: res.url }));
      setImageContextConfirmed(false);
      setSuccessMessage("Gambar berhasil diunggah");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      setErrorMessage(err.message || "Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleTagToggle = useCallback((tagId) => {
    setFormData((prev) => {
      const current = prev.tags || [];
      return { ...prev, tags: current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId] };
    });
  }, []);

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    try {
      const res = await apiCreateTag({ name });
      const tag = res.data;
      if (tag?.id) {
        setAvailableTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
        setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), tag.id] }));
      }
      setNewTagName("");
    } catch (err) {
      setErrorMessage("Gagal membuat tag: " + err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-surface-500 font-medium"><Loader2 size={24} className="animate-spin mr-2" /> Memuat editor...</div>;

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col font-sans">
      <Helmet><title>{isEdit ? "Edit" : "Buat"} Artikel - Admin</title></Helmet>

      {errorMessage && <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center gap-3"><AlertCircle size={18} className="text-red-600 shrink-0" /><p className="text-sm text-red-800 flex-1">{errorMessage}</p><button onClick={() => setErrorMessage("")} className="text-red-400 hover:text-red-600"><X size={16} /></button></div>}
      {successMessage && <div className="bg-green-50 border-b border-green-200 px-4 py-3 flex items-center gap-3"><CheckCircle size={18} className="text-green-600 shrink-0" /><p className="text-sm text-green-800 flex-1">{successMessage}</p><button onClick={() => setSuccessMessage("")} className="text-green-400 hover:text-green-600"><X size={16} /></button></div>}

      <div className="sticky top-0 z-30 bg-white border-b border-surface-200 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate("/admin/articles")} className="w-10 h-10 flex items-center justify-center border border-surface-200 rounded hover:bg-surface-50" title="Kembali"><ArrowLeft size={18} /></button>
          <div className="h-6 w-px bg-surface-200" />
          <span className="text-surface-500 text-sm">{isEdit ? "Mengedit Artikel" : "Artikel Baru"}</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => handleSubmit("draft")} disabled={saving} className="px-4 py-1.5 text-sm font-medium border border-surface-300 rounded hover:bg-surface-50 text-surface-700 disabled:opacity-50">Simpan Draft</button>
          <button type="button" onClick={() => handleSubmit("review")} disabled={saving} className="px-4 py-1.5 text-sm font-medium border border-amber-200 text-amber-800 rounded hover:bg-amber-50 disabled:opacity-50">Kirim Review</button>
          <button type="button" onClick={() => handleSubmit("scheduled")} disabled={saving || !formData.published_at} className="px-4 py-1.5 text-sm font-medium border border-primary-200 text-primary-700 rounded hover:bg-primary-50 disabled:opacity-50"><Clock size={14} className="inline mr-1" /> Jadwalkan</button>
          <button type="button" onClick={() => handleSubmit("published")} disabled={saving} className="px-5 py-1.5 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700 disabled:opacity-70 shadow-sm">{saving ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}Terbitkan</button>
          {formData.slug && (
            <Link to={`/article/${formData.slug}`} target="_blank" className="w-10 h-10 flex items-center justify-center hover:bg-surface-50 rounded" title="Pratinjau artikel">
              <ExternalLink size={18} />
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-y-auto bg-surface-50">
          <div className="max-w-4xl mx-auto py-10 px-8">
            <div className="bg-white p-10 md:p-14 shadow-sm border border-surface-200 min-h-screen">
              <div className="mb-5">
                <textarea value={formData.title} onChange={(e) => updateTitle(e.target.value)} placeholder="Tambahkan judul" className={`w-full text-4xl md:text-5xl font-serif font-bold placeholder:text-surface-300 outline-none resize-none leading-tight ${errors.title ? "text-red-600 border-2 border-red-300" : "text-surface-900"}`} rows={1} onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"; }} />
                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
              </div>
              <div className="mb-6 flex items-center gap-2 text-sm text-surface-500">
                <LinkIcon size={15} />
                <span>Slug:</span>
                <input value={formData.slug} onChange={(e) => { setSlugEdited(true); setFormData({ ...formData, slug: slugify(e.target.value) }); }} className={`flex-1 px-2 py-1 rounded border ${errors.slug ? "border-red-300" : "border-surface-200"}`} placeholder="slug-artikel" />
              </div>
              {similarArticles.length > 0 && (
                <div className="mb-6 border-l-4 border-amber-500 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-black text-amber-900 mb-2">Judul mirip sudah pernah ada</p>
                  <div className="space-y-1">
                    {similarArticles.map(({ article }) => (
                      <Link key={article.id} to={`/admin/articles/edit/${article.id}`} className="block text-sm font-semibold text-amber-900 hover:text-amber-700">
                        {article.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div className={`prose-editor-wp ${errors.content ? "border-2 border-red-300 rounded" : ""}`}>
                <ReactQuill theme="snow" value={formData.content} onChange={(val) => { setFormData({ ...formData, content: val }); setImageContextConfirmed(false); }} modules={quillModules} placeholder="Mulai menulis isi artikel..." />
              </div>
              {errors.content && <p className="text-sm text-red-600 mt-2">{errors.content}</p>}
            </div>
          </div>
        </div>

        <div className="w-80 bg-white border-l border-surface-200 overflow-y-auto shrink-0 flex flex-col">
          <div className="flex border-b border-surface-200">
            <button onClick={() => setActiveTab("post")} className={`flex-1 py-3 text-sm font-medium text-center border-b-2 ${activeTab === "post" ? "border-primary-600 text-surface-900" : "border-transparent text-surface-500"}`}>Pos</button>
            <button onClick={() => setActiveTab("seo")} className={`flex-1 py-3 text-sm font-medium text-center border-b-2 ${activeTab === "seo" ? "border-primary-600 text-surface-900" : "border-transparent text-surface-500"}`}>SEO</button>
          </div>

          {activeTab === "post" && <div className="p-4 space-y-6">
            <div className="border border-surface-200 rounded p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-surface-900">Kelengkapan</h3>
                <span className="text-xs font-black text-primary-700">{completionScore}%</span>
              </div>
              <div className="h-2 bg-surface-100 rounded overflow-hidden">
                <div className="h-full bg-primary-600 transition-all" style={{ width: `${completionScore}%` }} />
              </div>
              <div className="grid grid-cols-1 gap-2">
                {completionItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs text-surface-600">
                    <span className={`w-2 h-2 rounded-full ${item.done ? "bg-green-500" : "bg-surface-300"}`} />
                    <span className={item.done ? "text-surface-800 font-semibold" : ""}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-surface-100 text-xs text-surface-500 flex items-center justify-between">
                <span>{wordCount} kata</span>
                <button type="button" onClick={() => setFormData({ ...formData, read_time: estimatedReadTime })} className="font-bold text-primary-700 hover:text-primary-900">
                  Pakai {estimatedReadTime}
                </button>
              </div>
            </div>

            <div className="border border-surface-200 rounded p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-900">Ringkasan</h3>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-surface-300 rounded text-sm">
                <option value="draft">Draft</option><option value="review">Menunggu Review</option><option value="published">Terbit</option><option value="scheduled">Terjadwal</option><option value="archived">Arsip</option>
              </select>
              <div>
                <label className="text-xs font-semibold text-surface-600 flex items-center gap-1 mb-1"><Clock size={13} /> Tanggal/Jam Terbit</label>
                <input type="datetime-local" value={formData.published_at} onChange={(e) => setFormData({ ...formData, published_at: e.target.value })} className={`w-full px-3 py-2 border rounded text-sm ${errors.published_at ? "border-red-300" : "border-surface-300"}`} />
                {errors.published_at && <p className="text-xs text-red-600 mt-1">{errors.published_at}</p>}
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} /> <Star size={15} /> Jadikan headline/unggulan</label>
              <input value={formData.read_time} onChange={(e) => setFormData({ ...formData, read_time: e.target.value })} className="w-full px-3 py-2 border border-surface-300 rounded text-sm" placeholder="5 menit" />
            </div>

            <details className="border border-surface-200 rounded group" open>
              <summary className="px-4 py-3 border-b bg-surface-50 flex items-center justify-between cursor-pointer hover:bg-surface-100 list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-sm font-bold">Kategori</h3>
                <FolderTree size={16} className="group-open:text-primary-600" />
              </summary>
              <div className="p-4">
                <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className={`w-full px-3 py-2 border rounded text-sm ${errors.category_id ? "border-red-300" : "border-surface-300"}`}>
                  <option value="">Pilih Kategori...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category_id && <p className="text-sm text-red-600 mt-1">{errors.category_id}</p>}
              </div>
            </details>

            <details className="border border-surface-200 rounded group">
              <summary className="px-4 py-3 border-b bg-surface-50 flex items-center justify-between cursor-pointer hover:bg-surface-100 list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-sm font-bold">Tag</h3>
                <Tags size={16} className="group-open:text-primary-600" />
              </summary>
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateTag(); } }} className="flex-1 px-3 py-2 border border-surface-300 rounded text-sm" placeholder="Tambah tag" />
                  <button type="button" onClick={handleCreateTag} className="px-3 py-2 bg-surface-900 text-white rounded text-xs hover:bg-surface-800">Tambah</button>
                </div>
                <div className="max-h-44 overflow-y-auto pr-2">
                  {availableTags.length === 0 ? (
                    <p className="text-xs text-surface-500">Tidak ada tag.</p>
                  ) : availableTags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-surface-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                      />
                      <span className="text-sm">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </details>

            <details className="border border-surface-200 rounded group" open>
              <summary className="px-4 py-3 border-b bg-surface-50 flex items-center justify-between cursor-pointer hover:bg-surface-100 list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-sm font-bold">Gambar Andalan</h3>
                <ImageIcon size={16} className="group-open:text-primary-600" />
              </summary>
              <div className="p-4 space-y-3">
                {formData.image_url ? (
                  <div className="relative group rounded border overflow-hidden">
                    <OptimizedImage
                      src={formData.image_url}
                      alt="Preview gambar andalan"
                      className="w-full h-auto"
                      sizes="360px"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image_url: "" });
                        setImageContextConfirmed(false);
                      }}
                      className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      aria-label="Hapus gambar andalan"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center w-full h-32 bg-surface-50 border border-dashed rounded cursor-pointer transition-colors hover:bg-surface-100 ${errors.image_url ? "border-red-300 bg-red-50" : "border-surface-300"}`}>
                    {uploading ? (
                      <Loader2 size={24} className="animate-spin text-primary-600" />
                    ) : (
                      <Upload size={24} className="mb-2 text-surface-500" />
                    )}
                    <span className="text-xs text-center text-surface-600">
                      {uploading ? "Mengunggah..." : "Upload gambar andalan"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
                <input value={formData.image_url} onChange={(e) => { setFormData({ ...formData, image_url: e.target.value }); setImageContextConfirmed(false); }} className={`w-full px-3 py-2 text-xs border rounded ${errors.image_url ? "border-red-300" : "border-surface-300"}`} placeholder="Atau tempel URL gambar..." />
                <input value={formData.image_caption} onChange={(e) => { setFormData({ ...formData, image_caption: e.target.value }); setImageContextConfirmed(false); }} className={`w-full px-3 py-2 text-xs border rounded ${errors.image_caption ? "border-red-300 bg-red-50" : "border-surface-300"}`} placeholder="Jelaskan siapa/kegiatan/lokasi yang tampak pada foto..." />
                <input value={formData.image_credit} onChange={(e) => { setFormData({ ...formData, image_credit: e.target.value }); setImageContextConfirmed(false); }} className={`w-full px-3 py-2 text-xs border rounded ${errors.image_credit ? "border-red-300 bg-red-50" : "border-surface-300"}`} placeholder="Kredit/pemilik foto..." />
                {formData.image_url && (
                  <div className="border border-surface-200 bg-surface-50 p-3 space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-wider text-surface-700">Pemeriksaan konteks</p>
                    <p className="text-xs font-bold text-surface-900 leading-snug">{formData.title || "Judul artikel belum diisi"}</p>
                    <p className="text-xs text-surface-600 leading-snug">{formData.image_caption || "Caption belum menjelaskan isi foto."}</p>
                    <label className={`flex items-start gap-2 text-xs cursor-pointer p-2 border ${errors.image_context ? "border-red-300 bg-red-50 text-red-800" : "border-primary-200 bg-white text-surface-700"}`}>
                      <input type="checkbox" checked={imageContextConfirmed} onChange={(e) => setImageContextConfirmed(e.target.checked)} className="mt-0.5" />
                      <span>Saya sudah memeriksa foto ini dan memastikan orang, kegiatan, lokasi, serta waktunya sesuai dengan judul dan isi artikel.</span>
                    </label>
                  </div>
                )}
                {errors.image_url && <p className="text-sm text-red-600 mt-1">{errors.image_url}</p>}
                {errors.image_caption && <p className="text-sm text-red-600 mt-1">{errors.image_caption}</p>}
                {errors.image_credit && <p className="text-sm text-red-600 mt-1">{errors.image_credit}</p>}
                {errors.image_context && <p className="text-sm text-red-600 mt-1">{errors.image_context}</p>}
              </div>
            </details>

            <details className="border border-surface-200 rounded group">
              <summary className="px-4 py-3 border-b bg-surface-50 flex items-center justify-between cursor-pointer hover:bg-surface-100 list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-sm font-bold">Sumber & Catatan</h3>
              </summary>
              <div className="p-4 space-y-3">
                <input value={formData.source_name} onChange={(e) => setFormData({ ...formData, source_name: e.target.value })} className={`w-full px-3 py-2 border rounded text-sm ${errors.source_name ? "border-red-300 bg-red-50" : "border-surface-300"}`} placeholder="Sumber berita, mis. Redaksi" />
                <input value={formData.source_url} onChange={(e) => setFormData({ ...formData, source_url: e.target.value })} className="w-full px-3 py-2 border border-surface-300 rounded text-sm" placeholder="URL sumber opsional" />
                <textarea value={formData.editor_note} onChange={(e) => setFormData({ ...formData, editor_note: e.target.value })} rows={3} className="w-full px-3 py-2 border border-surface-300 rounded text-sm" placeholder="Catatan editor internal..." />
                {errors.source_name && <p className="text-sm text-red-600">{errors.source_name}</p>}
              </div>
            </details>

            <details className="border border-surface-200 rounded group">
              <summary className="px-4 py-3 border-b bg-surface-50 flex items-center justify-between cursor-pointer hover:bg-surface-100 list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-sm font-bold">Video & Kutipan</h3>
                <Video size={16} className="group-open:text-primary-600" />
              </summary>
              <div className="p-4 space-y-3">
                <input value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} className="w-full px-3 py-2 border border-surface-300 rounded text-sm" placeholder="URL video opsional" />
                <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={3} className="w-full px-3 py-2 border border-surface-300 rounded text-sm" placeholder="Ringkasan artikel..." />
                <p className="text-[11px] text-surface-500">Kutipan tampil di beranda dan daftar berita.</p>
              </div>
            </details>
          </div>}

          {activeTab === "seo" && <div className="p-4 space-y-6"><div className="border border-surface-200 rounded"><div className="px-4 py-3 border-b bg-surface-50 flex items-center justify-between"><h3 className="text-sm font-bold">SEO Settings</h3><Search size={16} /></div><div className="p-4 space-y-3"><div><div className="flex justify-between mb-1"><label className="text-xs font-semibold">Meta Title</label><span className={`text-xs ${formData.meta_title.length > 60 ? "text-red-600 font-bold" : "text-surface-400"}`}>{formData.meta_title.length}/60</span></div><input value={formData.meta_title} maxLength="60" onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} className={`w-full px-3 py-2 border rounded text-xs ${errors.meta_title ? "border-red-300" : "border-surface-300"}`} /></div><div><div className="flex justify-between mb-1"><label className="text-xs font-semibold">Meta Description</label><span className={`text-xs ${formData.meta_description.length > 160 ? "text-red-600 font-bold" : "text-surface-400"}`}>{formData.meta_description.length}/160</span></div><textarea value={formData.meta_description} maxLength="160" onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} rows={3} className={`w-full px-3 py-2 border rounded text-xs ${errors.meta_description ? "border-red-300" : "border-surface-300"}`} /></div></div></div></div>}
        </div>
      </div>
    </div>
  );
}
