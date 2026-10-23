import { useEffect, useState } from "react";
import { apiGetUsers, apiCreateUser, apiUpdateUser, apiDeleteUser } from "../../services/api";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import { Users, UserPlus, Pencil, Trash2, KeyRound, Mail, Shield, AlertCircle } from "lucide-react";

export default function ManageUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ email: "", password: "", display_name: "", role: "author" });
  const [submitting, setSubmitting] = useState(false);

  const refreshUsers = async () => {
    try {
      const res = await apiGetUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadUsers = async () => {
      try {
        const res = await apiGetUsers();
        if (!ignore) setUsers(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadUsers();
    return () => { ignore = true; };
  }, []);

  const resetForm = () => {
    setForm({ email: "", password: "", display_name: "", role: "author" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
        alert("Hanya Admin yang dapat menambah/mengedit pengguna.");
        return;
    }
    if (form.password && form.password.length < 12) {
        alert("Password minimal 12 karakter.");
        return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await apiUpdateUser(editingId, form);
        alert("Pengguna berhasil diperbarui!");
      } else {
        if (!form.password) throw new Error("Password wajib diisi untuk pengguna baru");
        await apiCreateUser(form);
        alert("Pengguna berhasil ditambahkan!");
      }
      resetForm();
      await refreshUsers();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setForm({ email: u.email, password: "", display_name: u.display_name, role: u.role });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (user?.role !== 'admin') {
        alert("Hanya Admin yang dapat menghapus pengguna.");
        return;
    }
    if (window.confirm(`Yakin ingin menghapus pengguna "${name}"?`)) {
      try {
        await apiDeleteUser(id);
        await refreshUsers();
      } catch (err) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-surface-500 font-medium">Memuat data pengguna...</div>;

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <Helmet><title>Kelola Pengguna - Admin</title></Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-100 /30 p-2 rounded-lg">
            <Users size={28} className="text-indigo-600 " />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 ">Manajemen Pengguna</h1>
        </div>

        {/* Form Section (Only for Admins) */}
        {user?.role === 'admin' && (
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm mb-10 overflow-hidden">
            <div className="bg-surface-50 /50 px-6 py-4 border-b border-surface-200 flex items-center gap-2">
              <UserPlus size={20} className="text-primary-600 " />
              <h2 className="text-lg font-bold text-surface-900 ">
                {editingId ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <input type="text" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl bg-white text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                      placeholder="Contoh: Budi Santoso" required />
                    <UserPlus size={18} className="absolute left-3.5 top-3 text-surface-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-2">Alamat Email</label>
                  <div className="relative">
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl bg-white text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                      placeholder="budi@example.com" required />
                    <Mail size={18} className="absolute left-3.5 top-3 text-surface-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-2">Peran (Role)</label>
                  <div className="relative">
                    <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}
                      className="w-full pl-10 pr-10 py-2.5 border border-surface-300 rounded-xl bg-white text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer">
                      <option value="subscriber">Subscriber (Pembaca)</option>
                      <option value="author">Author (Penulis)</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <Shield size={18} className="absolute left-3.5 top-3 text-surface-400" />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-2">
                    Password {editingId && <span className="text-surface-400 font-normal ml-1">(Kosongkan jika tak diubah)</span>}
                  </label>
                  <div className="relative">
                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl bg-white text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                      placeholder="Minimal 12 karakter" minLength={form.password ? 12 : undefined} maxLength={128} autoComplete="new-password" {...(!editingId ? {required: true} : {})} />
                    <KeyRound size={18} className="absolute left-3.5 top-3 text-surface-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 pt-4 border-t border-surface-100 ">
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shadow-primary-600/20">
                  {submitting ? "Menyimpan..." : editingId ? "Perbarui Pengguna" : "Tambah Pengguna"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm}
                    className="px-6 py-2.5 bg-surface-100 text-surface-700 rounded-xl font-semibold hover:bg-surface-200 transition-all">
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Users Data Table */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-surface-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-surface-900 ">Daftar Pengguna ({users.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-50/50 /50 text-surface-500 font-semibold border-b border-surface-200 ">
                <tr>
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Role</th>
                  {user?.role === 'admin' && <th className="px-6 py-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 ">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-50 /50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 /30 flex items-center justify-center text-primary-700 font-bold uppercase shrink-0">
                          {u.display_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-surface-900 ">{u.display_name}</p>
                          <p className="text-xs text-surface-500 ">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-surface-600 ">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700 /10 border border-red-200 /20' :
                        u.role === 'editor' ? 'bg-blue-100 text-blue-700 /10 border border-blue-200 /20' :
                        u.role === 'author' ? 'bg-green-100 text-green-700 /10 border border-green-200 /20' :
                        'bg-surface-100 text-surface-700 border border-surface-200 '
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(u)} title="Edit" className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 /20 rounded-lg transition-colors">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDelete(u.id, u.display_name)} title="Hapus" className="p-2 text-surface-500 hover:text-red-600 hover:bg-red-50 /20 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={user?.role === 'admin' ? "4" : "3"} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-surface-400">
                        <AlertCircle size={48} className="mb-4 text-surface-300 " />
                        <p className="text-lg font-medium text-surface-900 ">Belum ada pengguna</p>
                        <p className="text-sm">Data pengguna akan muncul di sini.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
