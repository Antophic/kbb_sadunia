import { Link } from "react-router-dom";
import { useState } from "react";
import { useCategories } from "../context/CategoriesContext";
import { useLang } from "../context/LangContext";
import { apiSubscribeNewsletter } from "../services/api";
import { getVisibleCategoryList } from "../utils/categoryNavigation";
import OptimizedImage from "./OptimizedImage";

export default function Footer() {
  const { t } = useLang();
  const { categories } = useCategories();
  const channelCategories = getVisibleCategoryList(categories).slice(0, 5);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await apiSubscribeNewsletter(email);
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus(""), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus(""), 3000);
    }
  };

  return (
    <footer className="bg-surface-950 text-surface-400 mt-12 border-t-[8px] border-primary-800" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-8 group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white p-1 rounded-sm shadow-md transition-transform group-hover:scale-105" data-logo-wrap>
                  <OptimizedImage
                    src="/logo-kbb.webp"
                    alt="KBB Logo"
                    className="w-full h-full object-contain"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      const wrap = event.currentTarget.closest("[data-logo-wrap]");
                      event.currentTarget.style.display = "none";
                      wrap?.querySelector("[data-logo-fallback]")?.classList.remove("hidden");
                      wrap?.querySelector("[data-logo-fallback]")?.classList.add("flex");
                    }}
                  />
                  <div className="hidden w-full h-full bg-primary-800 items-center justify-center font-sans font-black text-white text-xl" data-logo-fallback>
                    KBB
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-sans font-black text-2xl tracking-tight leading-none group-hover:text-primary-400 transition-colors uppercase">KBB SADUNIA</span>
                  <span className="text-primary-500 font-bold text-[10px] tracking-[0.2em] uppercase mt-1.5">Portal Berita Kerukunan Bubuhan Banjar Sa dunia</span>
                </div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-8 max-w-sm font-medium text-surface-400">
              Portal berita terdepan yang menyajikan informasi aktual, tajam, dan terpercaya seputar aktivitas dan liputan khusus dari Kerukunan Bubuhan Banjar (KBB) Sadunia.
            </p>
            
            <div className="bg-surface-900 p-6 border-l-4 border-primary-600 shadow-inner">
              <h4 className="text-white text-[11px] font-black uppercase tracking-widest mb-3">Newsletter Redaksi</h4>
              <p className="text-[13px] mb-4 text-surface-400 font-medium">Dapatkan ringkasan berita utama setiap paginya.</p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Alamat Email Anda" className="w-full px-4 py-3 bg-surface-950 border border-surface-800 text-sm text-white focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all font-medium" required />
                <button type="submit" disabled={status === "loading"} className="px-6 py-3 bg-primary-700 text-white text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-colors disabled:opacity-50 whitespace-nowrap">Daftar</button>
              </form>
              {status === "success" && <p className="text-primary-400 text-xs mt-3 font-bold">Berhasil berlangganan newsletter.</p>}
              {status === "error" && <p className="text-red-400 text-xs mt-3 font-bold">Gagal berlangganan. Coba lagi.</p>}
            </div>
          </div>
          
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6 border-b-2 border-surface-800 pb-3 inline-block">Menu Utama</h4>
            <ul className="space-y-4 text-sm font-semibold">
              <li><Link to="/" className="hover:text-primary-400 transition-colors flex items-center gap-2"><span className="text-primary-700">■</span> {t("nav.home")}</Link></li>
              <li><Link to="/terkini" className="hover:text-primary-400 transition-colors flex items-center gap-2"><span className="text-primary-700">■</span> {t("nav.latest")}</Link></li>
              <li><Link to="/perpustakaan" className="hover:text-primary-400 transition-colors flex items-center gap-2"><span className="text-primary-700">■</span> Perpustakaan</Link></li>
              <li><Link to="/donasi" className="hover:text-primary-400 transition-colors flex items-center gap-2"><span className="text-primary-700">■</span> {t("nav.donate")}</Link></li>
              <li><Link to="/kontak" className="hover:text-primary-400 transition-colors flex items-center gap-2"><span className="text-primary-700">■</span> {t("nav.contact")}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6 border-b-2 border-surface-800 pb-3 inline-block">{t("nav.about")}</h4>
            <ul className="space-y-4 text-sm font-semibold">
              <li><Link to="/tentang/sejarah" className="hover:text-primary-400 transition-colors flex items-center gap-2"><span className="text-primary-700">■</span> {t("nav.sejarah")}</Link></li>
              <li><Link to="/tentang/susunan-pengurus" className="hover:text-primary-400 transition-colors flex items-center gap-2"><span className="text-primary-700">■</span> {t("nav.hukum")}</Link></li>
              <li><Link to="/tentang/pelantikan" className="hover:text-primary-400 transition-colors flex items-center gap-2"><span className="text-primary-700">■</span> {t("nav.pelantikan")}</Link></li>
              <li><Link to="/tentang/opini" className="hover:text-primary-400 transition-colors flex items-center gap-2"><span className="text-primary-700">■</span> {t("nav.opini")}</Link></li>
              <li><Link to="/tentang/kegiatan" className="hover:text-primary-400 transition-colors flex items-center gap-2"><span className="text-primary-700">■</span> {t("nav.kegiatan")}</Link></li>
              <li><Link to="/tentang/administrasi" className="hover:text-primary-400 transition-colors flex items-center gap-2"><span className="text-primary-700">■</span> {t("nav.administrasi")}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6 border-b-2 border-surface-800 pb-3 inline-block">Kanal Berita</h4>
            <ul className="space-y-4 text-sm font-semibold mb-8">
              {channelCategories.map((c) => (
                <li key={c.slug}><Link to={`/kategori/${c.slug}`} className="hover:text-primary-400 transition-colors flex items-center gap-2"><span className="text-primary-700">■</span> {c.name}</Link></li>
              ))}
              <li><Link to="/terkini" className="text-white hover:text-primary-400 font-bold transition-colors mt-3 inline-block border-b border-white hover:border-primary-400 pb-0.5">Indeks Berita Secara Penuh →</Link></li>
            </ul>
            
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-4">Terhubung Dengan Kami</h4>
            <div className="flex gap-3">
              <a href="https://facebook.com/kbbsadunia" target="_blank" rel="noreferrer" className="w-10 h-10 bg-surface-900 border border-surface-800 flex items-center justify-center hover:bg-primary-700 hover:border-primary-600 text-white transition-all shadow-sm" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://twitter.com/kbbsadunia" target="_blank" rel="noreferrer" className="w-10 h-10 bg-surface-900 border border-surface-800 flex items-center justify-center hover:bg-primary-700 hover:border-primary-600 text-white transition-all shadow-sm" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://instagram.com/kbbsadunia" target="_blank" rel="noreferrer" className="w-10 h-10 bg-surface-900 border border-surface-800 flex items-center justify-center hover:bg-primary-700 hover:border-primary-600 text-white transition-all shadow-sm" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://youtube.com/@kbbsadunia" target="_blank" rel="noreferrer" className="w-10 h-10 bg-surface-900 border border-surface-800 flex items-center justify-center hover:bg-primary-700 hover:border-primary-600 text-white transition-all shadow-sm" aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
          
        </div>
        
        <div className="border-t border-surface-900 py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] font-semibold text-surface-500 bg-surface-950">
          <p>&copy; {new Date().getFullYear()} KBB SADUNIA. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/kebijakan-privasi" className="hover:text-primary-400 transition-colors">{t("footer.privacy")}</Link>
            <Link to="/about" className="hover:text-primary-400 transition-colors">{t("footer.guidelines")}</Link>
            <Link to="/about" className="hover:text-primary-400 transition-colors">{t("footer.disclaimer")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
