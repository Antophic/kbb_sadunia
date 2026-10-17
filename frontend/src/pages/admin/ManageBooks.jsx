import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetBooks, apiCreateBook, apiUpdateBook, apiDeleteBook, apiUploadImage, apiUploadBookFile } from "../../services/api";
import OptimizedImage from "../../components/OptimizedImage";
import { BookOpen, Plus, Pencil, Trash2, Upload, X, Save, ArrowLeft, FileText, Image, Search } from "lucide-react";

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const emptyForm = { title: "", author: "", category: "Umum", description: "", cover_url: "", file_url: "", file_size: 0 };
  const [form, setForm] = useState(emptyForm);

  const categoryOptions = ["Umum", "Sejarah", "Budaya", "Agama", "Pendidikan", "Sastra", "Hukum", "Ekonomi", "Sosial", "Lainnya"];
  const filteredBooks = books.filter((book) => {
    const haystack = `${book.title || ""} ${book.author || ""} ${book.category || ""}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  const loadBooks = async () => {
    try {
      const res = await apiGetBooks();
      setBooks(res.data || []);
    } catch { setBooks([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let active = true;
    apiGetBooks()
      .then((res) => {
        if (active) setBooks(res.data || []);
      })
      .catch(() => {
        if (active) setBooks([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEdit = (book) => {
    setForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "Umum",
      description: book.description || "",
      cover_url: book.cover_url || "",
      file_url: book.file_url || "",
      file_size: book.file_size || 0,
    });
    setEditId(book.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await apiUploadImage(file);
      setForm((f) => ({ ...f, cover_url: res.url }));
    } catch (err) {
      setError("Gagal mengunggah cover: " + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Hanya file PDF yang diperbolehkan.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Ukuran file maksimal 20MB.");
      return;
    }
    setUploadingFile(true);
    try {
      const res = await apiUploadBookFile(file);
      setForm((f) => ({ ...f, file_url: res.url, file_size: res.size }));
    } catch (err) {
      setError("Gagal mengunggah file: " + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Judul buku wajib diisi."); return; }
    if (!form.file_url) { setError("File PDF buku wajib diunggah."); return; }
    setSaving(true);
    setError("");
    try {
      if (editId) {
        await apiUpdateBook(editId, form);
        setSuccess("Buku berhasil diperbarui!");
      } else {
        await apiCreateBook(form);
        setSuccess("Buku berhasil ditambahkan!");
      }
      setShowForm(false);
      loadBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Hapus buku "${title}"?`)) return;
    try {
      await apiDeleteBook(id);
      setSuccess("Buku berhasil dihapus.");
      loadBooks();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "-";
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 rounded-lg hover:bg-surface-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-surface-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Kelola Perpustakaan</h1>
            <p className="text-sm text-surface-500">{books.length} buku dalam koleksi</p>
          </div>
        </div>
        {!showForm && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Tambah Buku
          </button>
        )}
      </div>

      <div className="mb-5 bg-white border border-surface-200 rounded-lg p-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-surface-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, penulis, atau kategori buku..."
            className="w-full rounded border border-surface-200 bg-surface-50 py-2.5 pl-9 pr-3 text-sm font-semibold outline-none focus:border-primary-600 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between"><span>{error}</span><button onClick={() => setError("")}><X className="w-4 h-4" /></button></div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center justify-between"><span>{success}</span><button onClick={() => setSuccess("")}><X className="w-4 h-4" /></button></div>}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-surface-900 mb-4">{editId ? "Edit Buku" : "Tambah Buku Baru"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Judul Buku *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Masukkan judul buku" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Penulis</label>
                <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Nama penulis" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Kategori</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Deskripsi</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Deskripsi singkat tentang buku ini..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cover Upload */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Cover Buku (Gambar)</label>
                <div className="border-2 border-dashed border-surface-200 rounded-xl p-4 text-center hover:border-primary-300 transition-colors">
                  {form.cover_url ? (
                    <div className="relative">
                      <OptimizedImage src={form.cover_url} alt="Cover buku" className="h-32 mx-auto rounded-lg object-cover" sizes="128px" />
                      <button type="button" onClick={() => setForm({ ...form, cover_url: "" })} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-surface-500">
                      <Image className="w-8 h-8" />
                      <span className="text-sm">{uploadingCover ? "Mengunggah..." : "Pilih gambar cover"}</span>
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploadingCover} />
                    </label>
                  )}
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">File Buku (PDF) *</label>
                <div className="border-2 border-dashed border-surface-200 rounded-xl p-4 text-center hover:border-primary-300 transition-colors">
                  {form.file_url ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-red-500" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-surface-800 break-all">{form.file_url.split("/").pop()}</p>
                        <p className="text-xs text-surface-500">{formatSize(form.file_size)}</p>
                      </div>
                      <button type="button" onClick={() => setForm({ ...form, file_url: "", file_size: 0 })} className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shrink-0"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-surface-500">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">{uploadingFile ? "Mengunggah..." : "Pilih file PDF (maks 20MB)"}</span>
                      <input type="file" accept=".pdf,application/pdf" onChange={handleFileUpload} className="hidden" disabled={uploadingFile} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving || uploadingCover || uploadingFile} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : editId ? "Perbarui" : "Simpan"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-surface-200 text-surface-600 rounded-xl text-sm font-medium hover:bg-surface-50 transition-colors">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Books Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-surface-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
          <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">Belum ada buku. Klik "Tambah Buku" untuk memulai.</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
          <Search className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">Tidak ada buku yang cocok dengan pencarian.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-surface-600">Cover</th>
                  <th className="text-left px-4 py-3 font-semibold text-surface-600">Judul</th>
                  <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden md:table-cell">Penulis</th>
                  <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden md:table-cell">Kategori</th>
                  <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden lg:table-cell">Ukuran</th>
                  <th className="text-right px-4 py-3 font-semibold text-surface-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3">
                      {book.cover_url ? (
                        <OptimizedImage src={book.cover_url} alt={`Cover ${book.title}`} className="w-12 h-16 object-cover rounded-lg border border-surface-200" sizes="48px" />
                      ) : (
                        <div className="w-12 h-16 bg-surface-100 rounded-lg flex items-center justify-center"><BookOpen className="w-5 h-5 text-surface-400" /></div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-surface-900 line-clamp-1">{book.title}</p>
                      {book.description && <p className="text-xs text-surface-500 line-clamp-1 mt-0.5">{book.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-surface-600 hidden md:table-cell">{book.author || "-"}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">{book.category}</span>
                    </td>
                    <td className="px-4 py-3 text-surface-600 hidden lg:table-cell">{formatSize(book.file_size)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(book)} className="p-2 rounded-lg hover:bg-primary-50 text-surface-500 hover:text-primary-600 transition-colors" title="Edit" aria-label={`Edit ${book.title}`}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(book.id, book.title)} className="p-2 rounded-lg hover:bg-red-50 text-surface-500 hover:text-red-600 transition-colors" title="Hapus" aria-label={`Hapus ${book.title}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
