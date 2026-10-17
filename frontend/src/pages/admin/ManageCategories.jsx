import { useEffect, useState } from "react";
import { apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory } from "../../services/api";
import { Helmet } from "react-helmet-async";
import { FolderTree, FolderPlus, Pencil, Trash2, Hash, Palette, AlertCircle } from "lucide-react";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", color: "#3391ff", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const refreshCategories = async () => {
    try {
      const res = await apiGetCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadCategories = async () => {
      try {
        const res = await apiGetCategories();
        if (!ignore) setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadCategories();
    return () => { ignore = true; };
  }, []);

  const resetForm = () => {
    setForm({ name: "", slug: "", color: "#3391ff", description: "" });
    setEditingId(null);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await apiUpdateCategory(editingId, form);
        alert("Kategori berhasil diperbarui!");
      } else {
        await apiCreateCategory(form);
        alert("Kategori berhasil ditambahkan!");
      }
      resetForm();
      await refreshCategories();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, color: cat.color || "#3391ff", description: cat.description || "" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Yakin ingin menghapus kategori "${name}"? Artikel dalam kategori ini akan kehilangan kategorinya.`)) {
      try {
        await apiDeleteCategory(id);
        await refreshCategories();
      } catch (err) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <Helmet><title>Kelola Kategori - Admin</title></Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-orange-100 /30 p-2 rounded-lg">
            <FolderTree size={28} className="text-orange-600 " />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 ">Manajemen Kategori</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden sticky top-8">
              <div className="bg-surface-50 /50 px-6 py-4 border-b border-surface-200 flex items-center gap-2">
                <FolderPlus size={20} className="text-primary-600 " />
                <h2 className="text-lg font-bold text-surface-900 ">
                  {editingId ? "Edit Kategori" : "Tambah Kategori"}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-5 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-2">Nama Kategori</label>
                    <div className="relative">
                      <input type="text" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : generateSlug(e.target.value) })}
                        className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl bg-white text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        placeholder="Misal: Politik" required />
                      <FolderTree size={18} className="absolute left-3.5 top-3 text-surface-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-2">Slug (URL)</label>
                    <div className="relative">
                      <input type="text" value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl bg-surface-50 /50 text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        placeholder="politik" required />
                      <Hash size={18} className="absolute left-3.5 top-3 text-surface-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-2">Warna Kategori</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        className="w-11 h-11 rounded-xl cursor-pointer border-2 border-surface-200 p-0.5" />
                      <div className="relative flex-1">
                        <input type="text" value={form.color}
                          onChange={(e) => setForm({ ...form, color: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl bg-white text-surface-900 font-mono text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" />
                        <Palette size={18} className="absolute left-3.5 top-3 text-surface-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-2">Deskripsi (Opsional)</label>
                    <textarea value={form.description} rows={2}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-surface-300 rounded-xl bg-white text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none resize-none"
                      placeholder="Penjelasan singkat tentang kategori ini..." />
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-4 border-t border-surface-100 ">
                  <button type="submit" disabled={submitting}
                    className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/30 transition-all disabled:opacity-70 flex justify-center shadow-sm shadow-primary-600/20">
                    {submitting ? "Menyimpan..." : editingId ? "Perbarui Kategori" : "Tambah Kategori"}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm}
                      className="w-full py-2.5 bg-surface-100 text-surface-700 rounded-xl font-semibold hover:bg-surface-200 transition-all">
                      Batal Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Table Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-surface-200 bg-surface-50/30 /20">
                <h2 className="text-lg font-bold text-surface-900 ">Daftar Kategori ({categories.length})</h2>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-48 text-surface-500">Memuat kategori...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface-50/50 /50 text-surface-500 font-semibold border-b border-surface-200 ">
                      <tr>
                        <th className="px-6 py-4">Kategori</th>
                        <th className="px-6 py-4">Slug</th>
                        <th className="px-6 py-4">Deskripsi</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100 ">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-surface-50 /50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="w-4 h-4 rounded-full shrink-0 ring-2 ring-white shadow-sm" style={{ backgroundColor: cat.color || '#3391ff' }} />
                              <span className="font-semibold text-surface-900 ">{cat.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-surface-500 ">{cat.slug}</td>
                          <td className="px-6 py-4 text-xs text-surface-500 max-w-[200px] truncate">{cat.description || "—"}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(cat)} title="Edit" className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 /20 rounded-lg transition-colors">
                                <Pencil size={18} />
                              </button>
                              <button onClick={() => handleDelete(cat.id, cat.name)} title="Hapus" className="p-2 text-surface-500 hover:text-red-600 hover:bg-red-50 /20 rounded-lg transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {categories.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center justify-center text-surface-400">
                              <AlertCircle size={48} className="mb-4 text-surface-300 " />
                              <p className="text-lg font-medium text-surface-900 ">Belum ada kategori</p>
                              <p className="text-sm">Buat kategori pertama melalui form di samping.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
