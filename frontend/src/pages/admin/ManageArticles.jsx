import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetArticles, apiDeleteArticle } from "../../services/api";
import { Helmet } from "react-helmet-async";
import { FileText, Plus, Pencil, Trash2, AlertCircle, Eye, Search, SlidersHorizontal } from "lucide-react";
import OptimizedImage from "../../components/OptimizedImage";

export default function ManageArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await apiGetArticles("?per_page=100&status=all");
        if (!ignore) setArticles(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Yakin ingin menghapus artikel "${title}"?`)) {
      try {
        await apiDeleteArticle(id);
        const res = await apiGetArticles("?per_page=100&status=all");
        setArticles(res.data || []);
      } catch (err) {
        alert("Gagal menghapus artikel: " + err.message);
      }
    }
  };

  const stats = useMemo(() => ({
    published: articles.filter((a) => a.status === "published").length,
    draft: articles.filter((a) => a.status === "draft").length,
    review: articles.filter((a) => a.status === "review").length,
    scheduled: articles.filter((a) => a.status === "scheduled").length,
    archived: articles.filter((a) => a.status === "archived").length,
  }), [articles]);

  const categories = useMemo(() => {
    const unique = new Map();
    articles.forEach((article) => {
      if (article.category_name) unique.set(article.category_name, article.category_name);
    });
    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesQuery = !q || [article.title, article.excerpt, article.slug, article.category_name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "all" || article.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || article.category_name === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [articles, categoryFilter, query, statusFilter]);

  const statusLabel = (status) => ({
    published: "Terbit",
    review: "Review",
    scheduled: "Terjadwal",
    archived: "Arsip",
    draft: "Draft",
  }[status] || "Draft");

  const statusClass = (status) => ({
    published: "bg-green-100 text-green-700 border border-green-200",
    review: "bg-purple-100 text-purple-700 border border-purple-200",
    scheduled: "bg-blue-100 text-blue-700 border border-blue-200",
    archived: "bg-surface-100 text-surface-700 border border-surface-200",
    draft: "bg-amber-100 text-amber-700 border border-amber-200",
  }[status] || "bg-amber-100 text-amber-700 border border-amber-200");

  const published = stats.published;
  const drafts = stats.draft + stats.review + stats.scheduled + stats.archived;

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <Helmet><title>Kelola Artikel - Admin</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 /30 p-2 rounded-lg">
              <FileText size={28} className="text-blue-600 " />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 ">Semua Artikel</h1>
              <p className="text-sm text-surface-500 mt-0.5">
                {published} terbit / {drafts} belum terbit
              </p>
            </div>
          </div>
          <Link to="/admin/articles/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-sm shadow-primary-600/20">
            <Plus size={18} /> Tulis Artikel Baru
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[
            ["Terbit", stats.published, "text-green-700"],
            ["Draft", stats.draft, "text-amber-700"],
            ["Review", stats.review, "text-purple-700"],
            ["Terjadwal", stats.scheduled, "text-blue-700"],
            ["Arsip", stats.archived, "text-surface-700"],
          ].map(([label, value, color]) => (
            <div key={label} className="bg-white border border-surface-200 rounded-lg px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-widest font-bold text-surface-500">{label}</p>
              <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48 text-surface-500 font-medium">Memuat artikel...</div>
        ) : (
          <div className="bg-white rounded-lg border border-surface-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-surface-200 bg-surface-50/60 grid grid-cols-1 lg:grid-cols-[1fr_180px_220px] gap-3">
              <label className="relative block">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Cari judul, slug, kategori..."
                />
              </label>
              <label className="relative block">
                <SlidersHorizontal size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="all">Semua status</option>
                  <option value="published">Terbit</option>
                  <option value="review">Review</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Terjadwal</option>
                  <option value="archived">Arsip</option>
                </select>
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="all">Semua kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-50/50 /50 text-surface-500 font-semibold border-b border-surface-200 ">
                  <tr>
                    <th className="px-6 py-4">Judul</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Dibaca</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 ">
                  {filteredArticles.map((a) => (
                    <tr key={a.id} className="hover:bg-surface-50 /50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 max-w-md">
                          {a.image_url && (
                            <OptimizedImage src={a.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-surface-200 " sizes="40px" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-surface-900 truncate">{a.title}</p>
                            <p className="text-xs text-surface-400 mt-0.5">ID: {a.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-surface-600 ">{a.category_name || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-surface-600">{Number(a.views || 0).toLocaleString("id-ID")}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusClass(a.status)}`}>
                          {statusLabel(a.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          {a.slug && (
                            <Link to={`/article/${a.slug}`} title="Lihat" aria-label={`Lihat ${a.title}`} className="p-2 text-surface-500 hover:text-blue-600 hover:bg-blue-50 /20 rounded-lg transition-colors">
                              <Eye size={18} />
                            </Link>
                          )}
                          <Link to={`/admin/articles/edit/${a.id}`} title="Edit" aria-label={`Edit ${a.title}`} className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 /20 rounded-lg transition-colors">
                            <Pencil size={18} />
                          </Link>
                          <button onClick={() => handleDelete(a.id, a.title)} title="Hapus" aria-label={`Hapus ${a.title}`} className="p-2 text-surface-500 hover:text-red-600 hover:bg-red-50 /20 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredArticles.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-surface-400">
                          <AlertCircle size={48} className="mb-4 text-surface-300 " />
                          <p className="text-lg font-medium text-surface-900 ">{articles.length === 0 ? "Belum ada artikel" : "Tidak ada artikel yang cocok"}</p>
                          <p className="text-sm mb-4">{articles.length === 0 ? "Mulai tulis artikel pertama Anda." : "Coba ubah kata kunci atau filter."}</p>
                          <Link to="/admin/articles/create" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                            + Buat Artikel Baru
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
