import { useEffect, useState } from "react";
import { apiGetSettings, apiUpdateSettings } from "../../services/api";
import { Helmet } from "react-helmet-async";
import { Settings, Globe, Type, Image as ImageIcon, FileText, Save, Loader2 } from "lucide-react";

export default function ManageSettings() {
  const [settings, setSettings] = useState({
    site_title: "",
    site_tagline: "",
    site_logo: "",
    footer_text: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadSettings = async () => {
      try {
        const res = await apiGetSettings();
        if (!ignore) setSettings(res.data || {});
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadSettings();
    return () => { ignore = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    try {
      await apiUpdateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-surface-500 font-medium">Memuat pengaturan...</div>;

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <Helmet><title>Pengaturan Situs - Admin</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-slate-100 p-2 rounded-lg">
            <Settings size={28} className="text-slate-700 " />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 ">Pengaturan Situs</h1>
            <p className="text-sm text-surface-500 mt-0.5">Konfigurasi informasi dasar website Anda.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Identitas Situs */}
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
            <div className="bg-surface-50 /50 px-6 py-4 border-b border-surface-200 flex items-center gap-2">
              <Globe size={20} className="text-primary-600 " />
              <h2 className="text-base font-bold text-surface-900 ">Identitas Situs</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Judul Situs</label>
                <div className="relative">
                  <input type="text" value={settings.site_title || ""}
                    onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl bg-white text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    placeholder="Nama website Anda" required />
                  <Type size={18} className="absolute left-3.5 top-3 text-surface-400" />
                </div>
                <p className="text-xs text-surface-500 mt-1.5">Akan muncul di tab browser dan hasil pencarian Google.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Tagline / Deskripsi Singkat</label>
                <div className="relative">
                  <input type="text" value={settings.site_tagline || ""}
                    onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl bg-white text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    placeholder="Deskripsikan situs Anda dalam satu kalimat" />
                  <FileText size={18} className="absolute left-3.5 top-3 text-surface-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Media & Tampilan */}
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
            <div className="bg-surface-50 /50 px-6 py-4 border-b border-surface-200 flex items-center gap-2">
              <ImageIcon size={20} className="text-primary-600 " />
              <h2 className="text-base font-bold text-surface-900 ">Media & Tampilan</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">URL Logo Situs</label>
                <input type="url" value={settings.site_logo || ""}
                  onChange={(e) => setSettings({ ...settings, site_logo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl bg-white text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  placeholder="https://example.com/logo.png" />
                <p className="text-xs text-surface-500 mt-1.5">Masukkan URL lengkap ke gambar logo. Bisa diambil dari Pustaka Media.</p>
                {settings.site_logo && (
                  <div className="mt-3 p-3 bg-surface-50 rounded-lg border border-surface-200 inline-block">
                    <img src={settings.site_logo} alt="Preview Logo" className="h-12 max-w-[200px] object-contain" loading="lazy" decoding="async" onError={(e) => e.target.style.display='none'} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
            <div className="bg-surface-50 /50 px-6 py-4 border-b border-surface-200 flex items-center gap-2">
              <FileText size={20} className="text-primary-600 " />
              <h2 className="text-base font-bold text-surface-900 ">Teks Footer</h2>
            </div>
            <div className="p-6">
              <textarea value={settings.footer_text || ""} rows={3}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                className="w-full px-4 py-2.5 border border-surface-300 rounded-xl bg-white text-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none resize-none"
                placeholder="Contoh: © 2026 KBB Sadunia. All rights reserved." />
              <p className="text-xs text-surface-500 mt-1.5">Teks ini akan ditampilkan di bagian paling bawah halaman website.</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={submitting}
              className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shadow-primary-600/20">
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
              ) : (
                <><Save size={18} /> Simpan Pengaturan</>
              )}
            </button>
            {saved && (
              <span className="text-sm font-medium text-green-600 animate-pulse">
                Pengaturan tersimpan.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
