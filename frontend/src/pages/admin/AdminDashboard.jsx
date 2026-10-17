import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Helmet } from "react-helmet-async";
import { FileText, Image as ImageIcon, FolderTree, Tags, MessageSquare, Users, Settings, LayoutDashboard, PlusCircle, BookOpen } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-50 ">
      <Helmet>
        <title>Dashboard Admin - KBB Sadunia</title>
      </Helmet>
      
      {/* Modern Header Section */}
      <div className="bg-white border-b border-surface-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 text-primary-600 mb-2">
            <LayoutDashboard size={28} className="text-primary-600 " />
            <h1 className="text-3xl font-bold text-surface-900 ">Dashboard</h1>
          </div>
          <p className="text-surface-600 text-lg">
            Selamat datang kembali, <span className="font-semibold text-surface-900 ">{user?.name}</span>. Anda login sebagai <span className="uppercase text-xs bg-primary-100 text-primary-800 /40 font-bold px-2 py-1 rounded-md">{user?.role}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white border border-surface-200 rounded-lg p-5 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-primary-700 mb-1">Aksi Cepat</p>
              <h2 className="text-xl font-bold text-surface-900">Mulai kerja redaksi dari sini</h2>
              <p className="text-sm text-surface-500 mt-1">Tulis artikel, cek daftar draft, atau siapkan gambar pendukung.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/articles/create" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-bold hover:bg-primary-700">
                <PlusCircle size={18} /> Tulis Artikel
              </Link>
              <Link to="/admin/articles" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-surface-300 text-surface-700 text-sm font-bold hover:bg-surface-50">
                <FileText size={18} /> Semua Artikel
              </Link>
              <Link to="/admin/media" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-surface-300 text-surface-700 text-sm font-bold hover:bg-surface-50">
                <ImageIcon size={18} /> Media
              </Link>
              <Link to="/admin/books" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-surface-300 text-surface-700 text-sm font-bold hover:bg-surface-50">
                <BookOpen size={18} /> Perpustakaan
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Link to="/admin/articles" className="group bg-white p-6 rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden">
            <div className="bg-blue-50 /20 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <FileText size={32} className="text-blue-600 " />
            </div>
            <h2 className="text-xl font-bold text-surface-900 mb-1 group-hover:text-primary-600 ">Artikel</h2>
            <p className="text-sm text-surface-500 ">Kelola postingan, draft, dan artikel terbit.</p>
          </Link>

          <Link to="/admin/media" className="group bg-white p-6 rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden">
            <div className="bg-purple-50 /20 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <ImageIcon size={32} className="text-purple-600 " />
            </div>
            <h2 className="text-xl font-bold text-surface-900 mb-1 group-hover:text-primary-600 ">Pustaka Media</h2>
            <p className="text-sm text-surface-500 ">Unggah dan kelola gambar atau file statis.</p>
          </Link>

          <Link to="/admin/books" className="group bg-white p-6 rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden">
            <div className="bg-emerald-50 /20 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <BookOpen size={32} className="text-emerald-700" />
            </div>
            <h2 className="text-xl font-bold text-surface-900 mb-1 group-hover:text-primary-600 ">Perpustakaan</h2>
            <p className="text-sm text-surface-500 ">Kelola buku digital PDF, cover, penulis, dan kategori bacaan.</p>
          </Link>
          
          <Link to="/admin/categories" className="group bg-white p-6 rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden">
            <div className="bg-orange-50 /20 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <FolderTree size={32} className="text-orange-600 " />
            </div>
            <h2 className="text-xl font-bold text-surface-900 mb-1 group-hover:text-primary-600 ">Kategori</h2>
            <p className="text-sm text-surface-500 ">Kelola kategori topik berita utama.</p>
          </Link>

          <Link to="/admin/tags" className="group bg-white p-6 rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden">
            <div className="bg-green-50 /20 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <Tags size={32} className="text-green-600 " />
            </div>
            <h2 className="text-xl font-bold text-surface-900 mb-1 group-hover:text-primary-600 ">Tag (Label)</h2>
            <p className="text-sm text-surface-500 ">Kelola spesifik label tag pada artikel.</p>
          </Link>
          
          <Link to="/admin/comments" className="group bg-white p-6 rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden">
            <div className="bg-pink-50 /20 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <MessageSquare size={32} className="text-pink-600 " />
            </div>
            <h2 className="text-xl font-bold text-surface-900 mb-1 group-hover:text-primary-600 ">Komentar</h2>
            <p className="text-sm text-surface-500 ">Moderasi tanggapan dari pembaca.</p>
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin/users" className="group bg-white p-6 rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden">
              <div className="bg-indigo-50 /20 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users size={32} className="text-indigo-600 " />
              </div>
              <h2 className="text-xl font-bold text-surface-900 mb-1 group-hover:text-primary-600 ">Pengguna</h2>
              <p className="text-sm text-surface-500 ">Kelola Penulis, Editor & Admin.</p>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin/settings" className="group bg-white p-6 rounded-2xl border border-surface-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden">
              <div className="bg-slate-100 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <Settings size={32} className="text-slate-700 " />
              </div>
              <h2 className="text-xl font-bold text-surface-900 mb-1 group-hover:text-primary-600 ">Pengaturan</h2>
              <p className="text-sm text-surface-500 ">Konfigurasi situs utama (Judul, Meta).</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
