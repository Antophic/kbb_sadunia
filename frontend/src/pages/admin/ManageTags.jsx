import { useEffect, useState } from "react";
import { apiGetTags, apiCreateTag, apiUpdateTag, apiDeleteTag } from "../../services/api";
import { Helmet } from "react-helmet-async";
import { Tags, Tag, Pencil, Trash2, Hash, AlertCircle } from "lucide-react";

export default function ManageTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [submitting, setSubmitting] = useState(false);

  const refreshTags = async () => {
    try {
      const res = await apiGetTags();
      setTags(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadTags = async () => {
      try {
        const res = await apiGetTags();
        if (!ignore) setTags(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadTags();
    return () => { ignore = true; };
  }, []);

  const resetForm = () => {
    setForm({ name: "", slug: "" });
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
        await apiUpdateTag(editingId, form);
        alert("Tag berhasil diperbarui!");
      } else {
        await apiCreateTag(form);
        alert("Tag berhasil ditambahkan!");
      }
      resetForm();
      await refreshTags();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tag) => {
    setEditingId(tag.id);
    setForm({ name: tag.name, slug: tag.slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Yakin ingin menghapus tag "${name}"?`)) {
      try {
        await apiDeleteTag(id);
        await refreshTags();
      } catch (err) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <Helmet><title>Kelola Tag - Admin</title></Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-green-100 /30 p-2 rounded-lg">
            <Tags size={28} className="text-green-600 " />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 ">Manajemen Tag</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden sticky top-8">
              <div className="bg-surface-50 /50 px-6 py-4 border-b border-surface-200 flex items-center gap-2">
                <Tag size={20} className="text-primary-600 " />
                <h2 className="text-lg font-bold text-surface-900 ">
                  {editingId ? "Edit Tag" : "Tambah Tag Baru"}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-5 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-2">Nama Tag</label>
                    <div className="relative">
                      <input type="text" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : generateSlug(e.target.value) })}
                        className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl bg-white text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        placeholder="Misal: Teknologi" required />
                      <Tag size={18} className="absolute left-3.5 top-3 text-surface-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-2">Slug (URL)</label>
                    <div className="relative">
                      <input type="text" value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl bg-surface-50 /50 text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        placeholder="teknologi" required />
                      <Hash size={18} className="absolute left-3.5 top-3 text-surface-400" />
                    </div>
                    <p className="text-xs text-surface-500 mt-2">Sebaiknya gunakan huruf kecil dan tanda strip (-).</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-4 border-t border-surface-100 ">
                  <button type="submit" disabled={submitting}
                    className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/30 transition-all disabled:opacity-70 flex justify-center shadow-sm shadow-primary-600/20">
                    {submitting ? "Menyimpan..." : editingId ? "Perbarui Tag" : "Tambah Tag"}
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
              <div className="px-6 py-5 border-b border-surface-200 flex justify-between items-center bg-surface-50/30 /20">
                <h2 className="text-lg font-bold text-surface-900 ">Daftar Tag ({tags.length})</h2>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-48 text-surface-500">Memuat tag...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface-50/50 /50 text-surface-500 font-semibold border-b border-surface-200 ">
                      <tr>
                        <th className="px-6 py-4">Nama Tag</th>
                        <th className="px-6 py-4">Slug</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100 ">
                      {tags.map((tag) => (
                        <tr key={tag.id} className="hover:bg-surface-50 /50 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-100 text-surface-800 font-medium border border-surface-200 ">
                              <Hash size={14} className="text-surface-400" />
                              {tag.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-surface-500 ">{tag.slug}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(tag)} title="Edit" className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 /20 rounded-lg transition-colors">
                                <Pencil size={18} />
                              </button>
                              <button onClick={() => handleDelete(tag.id, tag.name)} title="Hapus" className="p-2 text-surface-500 hover:text-red-600 hover:bg-red-50 /20 rounded-lg transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {tags.length === 0 && (
                        <tr>
                          <td colSpan="3" className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center justify-center text-surface-400">
                              <AlertCircle size={48} className="mb-4 text-surface-300 " />
                              <p className="text-lg font-medium text-surface-900 ">Belum ada tag</p>
                              <p className="text-sm">Buat tag pertama Anda melalui form di samping.</p>
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
