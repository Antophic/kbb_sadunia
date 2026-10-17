import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCategories } from "../context/CategoriesContext";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { Search, Menu, X, User, Globe, ChevronDown, LogOut, LayoutDashboard, BookmarkCheck, BookOpen, HeartHandshake } from "lucide-react";
import { getAllCategoryList, getCategoryLabel, getPrimaryNavCategories } from "../utils/categoryNavigation";
import OptimizedImage from "./OptimizedImage";

const orgLinks = [
  { key: "sejarah", path: "/tentang/sejarah" },
  { key: "hukum", path: "/tentang/susunan-pengurus" },
  { key: "pelantikan", path: "/tentang/pelantikan" },
  { key: "opini", path: "/tentang/opini" },
  { key: "kegiatan", path: "/tentang/kegiatan" },
  { key: "administrasi", path: "/tentang/administrasi" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLang();
  const { categories = [] } = useCategories();
  const { user, logout } = useAuth();
  const navCategories = getPrimaryNavCategories(categories);
  const moreCategories = getAllCategoryList(categories);
  const canManageContent = Boolean(user && ["admin", "editor", "author"].includes(user.role));
  const currentSearch = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => { 
    const closeMenus = window.setTimeout(() => {
      setMobileOpen(false);
      setOrgMenuOpen(false);
      setCategoryMenuOpen(false);
      setSearchOpen(false);
    }, 0);
    return () => window.clearTimeout(closeMenus);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/search") {
      const syncSearch = window.setTimeout(() => setSearchQuery(currentSearch), 0);
      return () => window.clearTimeout(syncSearch);
    }
  }, [location.pathname, currentSearch]);

  const handleSearch = (e) => { 
    e.preventDefault(); 
    if (searchQuery.trim()) { 
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    } 
  };

  const dateStr = new Date().toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { 
    weekday: "long", day: "numeric", month: "long", year: "numeric" 
  });

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm transition-all duration-200">
      
      {/* Top Utility Bar - Clean Light Gray */}
      <div className="bg-surface-100 text-surface-600 text-[11px] py-1.5 hidden lg:block uppercase tracking-wide font-semibold border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>{dateStr}</span>
            <span className="text-surface-700">|</span>
            <span className="text-primary-400 font-bold">Portal Resmi KBB Sadunia</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a href="https://facebook.com/kbbsadunia" target="_blank" rel="noreferrer" className="hover:text-primary-700 transition-colors" aria-label="Facebook">FB</a>
              <a href="https://twitter.com/kbbsadunia" target="_blank" rel="noreferrer" className="hover:text-primary-700 transition-colors" aria-label="Twitter">X</a>
              <a href="https://instagram.com/kbbsadunia" target="_blank" rel="noreferrer" className="hover:text-primary-700 transition-colors" aria-label="Instagram">IG</a>
              <a href="https://youtube.com/@kbbsadunia" target="_blank" rel="noreferrer" className="hover:text-primary-700 transition-colors" aria-label="YouTube">YT</a>
            </div>
            
            <span className="text-surface-700">|</span>

            <Link to="/tersimpan" className={`hover:text-primary-700 transition-colors flex items-center gap-1 ${location.pathname === "/tersimpan" ? "text-primary-700" : ""}`}>
              <BookmarkCheck size={12} />
              Tersimpan
            </Link>

            <span className="text-surface-700">|</span>
            
            <button onClick={toggleLang} className="hover:text-primary-700 transition-colors flex items-center gap-1">
              <Globe size={12} />
              {lang === "id" ? "EN" : "ID"}
            </button>
            
            <span className="text-surface-700">|</span>
            
            {/* Auth Section */}
            {user ? (
              <div className="relative group">
                <button className="hover:text-primary-700 transition-colors flex items-center gap-1 text-primary-700">
                  <User size={12} />
                  {user.name}
                </button>
                <div className="absolute right-0 top-full bg-white shadow-lg border border-surface-200 rounded-md mt-1 hidden group-hover:block z-50 min-w-max">
                  <Link to="/admin" className="block px-4 py-2 text-sm text-surface-800 hover:bg-surface-50 hover:text-primary-700">
                    Dashboard Admin
                  </Link>
                  <button onClick={() => { logout(); navigate("/auth"); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="hover:text-primary-800 transition-colors flex items-center gap-1 text-primary-700">
                <User size={12} />
                {t("nav.login")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className={`transition-all duration-300 py-3 border-b border-surface-200 bg-white `}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="KBB Sadunia Beranda">
            <div className="transition-all duration-300 overflow-hidden w-12 h-12" data-logo-wrap>
              <OptimizedImage
                src="/logo-kbb.webp"
                alt="Logo KBB"
                className="w-full h-full object-contain"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                onError={(event) => {
                  const wrap = event.currentTarget.closest("[data-logo-wrap]");
                  event.currentTarget.style.display = "none";
                  wrap?.querySelector("[data-logo-fallback]")?.classList.remove("hidden");
                  wrap?.querySelector("[data-logo-fallback]")?.classList.add("flex");
                }}
              />
              <div className="hidden w-full h-full bg-primary-800 items-center justify-center shadow-md border-b-2 border-primary-900" data-logo-fallback>
                <span className="text-white font-sans font-black text-xl tracking-tighter">KBB</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`font-sans font-black text-primary-900 uppercase tracking-tight leading-none transition-all duration-300 text-3xl`}>
                KBB Sadunia
              </span>
              <span className={`text-surface-500 font-bold uppercase transition-all duration-300 text-[10px] tracking-[0.2em] mt-1`}>
                Portal Berita Kerukunan Bubuhan Banjar Sa dunia
              </span>
            </div>
          </Link>

          {/* Desktop Search & CTA */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center animate-fade-in w-72">
                  <input 
                    autoFocus
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Cari berita, tokoh, wilayah..."
                    className="w-full pl-4 pr-20 py-2 border-b-2 border-primary-800 bg-surface-50 text-sm focus:outline-none focus:bg-white transition-all shadow-inner" 
                  />
                  <button type="submit" className="absolute right-10 text-primary-700 hover:text-primary-900" aria-label="Cari berita">
                    <Search size={16} />
                  </button>
                  <button type="button" onClick={() => setSearchOpen(false)} className="absolute right-3 text-surface-400 hover:text-surface-800 " aria-label="Tutup pencarian">
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="p-2 text-surface-600 hover:text-primary-800 transition-colors" aria-label="Buka Pencarian">
                  <Search size={20} strokeWidth={2.5} />
                </button>
              )}
            </div>
            
            {canManageContent && (
              <Link to="/admin" className="px-4 py-2.5 bg-primary-600 text-white text-[11px] font-black hover:bg-primary-700 transition-colors uppercase tracking-widest shadow-sm border-b-2 border-primary-700 flex items-center gap-2">
                <LayoutDashboard size={14} /> Dashboard
              </Link>
            )}
            
            <Link to="/donasi" className="px-5 py-2.5 bg-primary-800 text-white text-[11px] font-black hover:bg-primary-900 transition-colors uppercase tracking-widest shadow-sm border-b-2 border-primary-950 flex items-center gap-2">
              <HeartHandshake size={14} /> {t("nav.donate") || "Donasi"}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-surface-900 " aria-label={mobileOpen ? "Tutup menu" : "Buka menu"} aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs - Kompas/Detik style */}
      <nav className={`bg-primary-800 text-white hidden md:block transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center flex-wrap">
          
          <Link to="/" className={`px-4 lg:px-5 py-3 text-[12px] font-black tracking-widest uppercase transition-colors border-l border-primary-800 ${location.pathname === "/" ? "bg-primary-700 text-white" : "hover:bg-primary-800 text-primary-50"}`}>
            {t("nav.home") || "Beranda"}
          </Link>
          
          <Link to="/terkini" className={`px-4 lg:px-5 py-3 text-[12px] font-black tracking-widest uppercase transition-colors border-l border-primary-800 ${location.pathname === "/terkini" ? "bg-primary-700 text-white" : "hover:bg-primary-800 text-primary-50"}`}>
            {t("nav.latest") || "Terkini"}
          </Link>

          {/* Mega Menu Dropdown */}
          <div className="relative group border-l border-primary-800" onMouseEnter={() => setOrgMenuOpen(true)} onMouseLeave={() => setOrgMenuOpen(false)}>
            <button 
              onClick={() => setOrgMenuOpen(!orgMenuOpen)}
              className={`px-4 lg:px-5 py-3 text-[12px] font-black tracking-widest uppercase flex items-center gap-1.5 transition-colors ${location.pathname.startsWith("/tentang") ? "bg-primary-700 text-white" : "hover:bg-primary-800 text-primary-50"}`}>
              {t("nav.about") || "Tentang"} <ChevronDown size={14} strokeWidth={3} className={`transition-transform duration-200 ${orgMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Content */}
            {orgMenuOpen && (
              <div className="absolute top-full left-0 bg-white shadow-2xl border-t-[3px] border-primary-600 w-64 animate-fade-in z-50">
                {orgLinks.map((l) => (
                  <Link key={l.path} to={l.path} className="block px-5 py-3 text-[13px] font-bold text-surface-800 hover:bg-surface-50 hover:text-primary-700 transition-colors border-b border-surface-100 last:border-0">
                    {t(`nav.${l.key}`) || l.key}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/perpustakaan" className={`inline-flex items-center gap-1.5 px-4 lg:px-5 py-3 text-[12px] font-black tracking-widest uppercase transition-colors border-l border-primary-800 ${location.pathname === "/perpustakaan" ? "bg-primary-700 text-white" : "hover:bg-primary-800 text-primary-50"}`}>
            <BookOpen size={14} aria-hidden="true" /> Perpustakaan
          </Link>

          {navCategories.map((cat) => (
            <Link key={cat.slug} to={`/kategori/${cat.slug}`}
              className={`px-4 lg:px-5 py-3 text-[12px] font-black tracking-widest uppercase transition-colors border-l border-primary-800 ${location.pathname === `/kategori/${cat.slug}` ? "bg-primary-700 text-white" : "hover:bg-primary-800 text-primary-50"}`}>
              {getCategoryLabel(cat)}
            </Link>
          ))}

          {moreCategories.length > 0 && (
            <div className="relative group border-l border-primary-800" onMouseEnter={() => setCategoryMenuOpen(true)} onMouseLeave={() => setCategoryMenuOpen(false)}>
              <button
                onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                className="px-4 lg:px-5 py-3 text-[12px] font-black tracking-widest uppercase flex items-center gap-1.5 transition-colors hover:bg-primary-800 text-primary-50">
                Lainnya <ChevronDown size={14} strokeWidth={3} className={`transition-transform duration-200 ${categoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoryMenuOpen && (
                <div className="absolute top-full left-0 bg-white shadow-2xl border-t-[3px] border-primary-600 w-80 max-h-[70vh] overflow-y-auto animate-fade-in z-50">
                  <div className="px-5 py-2.5 bg-surface-50 text-[10px] font-black uppercase tracking-[0.18em] text-surface-500 border-b border-surface-100">
                    Semua Kategori
                  </div>
                  {moreCategories.map((cat) => (
                    <Link key={cat.slug} to={`/kategori/${cat.slug}`} className="flex items-center justify-between gap-4 px-5 py-3 text-[13px] font-bold text-surface-800 hover:bg-surface-50 hover:text-primary-700 transition-colors border-b border-surface-100 last:border-0">
                      <span>{getCategoryLabel(cat)}</span>
                      <span className="text-[10px] text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full">{cat.article_count || 0}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1 border-l border-primary-800 h-[45px]"></div>
          
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t-2 border-primary-600 shadow-xl animate-slide-down max-h-[85vh] overflow-y-auto z-50 flex flex-col">
          
          <form onSubmit={handleSearch} className="p-4 border-b border-surface-200 bg-surface-50 sticky top-0 z-10">
            <div className="relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari berita..."
                className="w-full pl-4 pr-12 py-3 rounded-sm border border-surface-300 bg-white text-sm font-medium focus:outline-none focus:border-primary-600 " />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500" aria-label="Cari berita">
                <Search size={18} />
              </button>
            </div>
          </form>
          
          <div className="flex-1 overflow-y-auto">
            {/* Primary Mobile Links */}
            <Link to="/" className="block px-5 py-3.5 text-sm font-black text-surface-900 uppercase tracking-wider border-b border-surface-100 hover:bg-surface-50 ">{t("nav.home")}</Link>
            <Link to="/terkini" className="block px-5 py-3.5 text-sm font-black text-surface-900 uppercase tracking-wider border-b border-surface-100 hover:bg-surface-50 ">{t("nav.latest")}</Link>
            <Link to="/tersimpan" className="flex items-center gap-2 px-5 py-3.5 text-sm font-black text-surface-900 uppercase tracking-wider border-b border-surface-100 hover:bg-surface-50 ">
              <BookmarkCheck size={16} /> Tersimpan
            </Link>
            <Link to="/perpustakaan" className="flex items-center gap-2 px-5 py-3.5 text-sm font-black text-surface-900 uppercase tracking-wider border-b border-surface-100 hover:bg-surface-50 ">
              <BookOpen size={16} /> Perpustakaan
            </Link>
            
            {/* Tentang Section */}
            <div className="bg-surface-100 px-5 py-2 border-b border-surface-200 ">
              <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">{t("nav.about")}</p>
            </div>
            {orgLinks.map((l) => (
              <Link key={l.path} to={l.path} className="block px-8 py-3 text-sm font-bold text-surface-700 border-b border-surface-100 hover:text-primary-700 ">
                {t(`nav.${l.key}`)}
              </Link>
            ))}
            
            <div className="bg-surface-100 px-5 py-2 border-b border-surface-200 ">
              <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Kategori</p>
            </div>
            {navCategories.map((cat) => (
              <Link key={cat.slug} to={`/kategori/${cat.slug}`} className="flex items-center gap-3 px-8 py-3 text-sm font-bold text-surface-700 border-b border-surface-100 hover:text-primary-700 ">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || "#16a34a" }} />
                {getCategoryLabel(cat)}
              </Link>
            ))}
            {moreCategories.length > 0 && (
              <>
                <div className="bg-surface-50 px-8 py-2 border-b border-surface-200 ">
                  <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Semua Kategori</p>
                </div>
                {moreCategories.map((cat) => (
                  <Link key={cat.slug} to={`/kategori/${cat.slug}`} className="flex items-center justify-between gap-3 px-8 py-3 text-sm font-bold text-surface-700 border-b border-surface-100 hover:text-primary-700 ">
                    <span className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || "#16a34a" }} />
                      {getCategoryLabel(cat)}
                    </span>
                    <span className="text-xs text-surface-400">{cat.article_count || 0}</span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Mobile Bottom Actions */}
          <div className="p-4 bg-surface-50 border-t border-surface-200 mt-auto">
            <Link to="/donasi" className="block text-center py-3 mb-4 rounded-sm bg-primary-800 text-white font-black uppercase tracking-widest text-[11px] shadow-sm">
              Donasi Sekarang
            </Link>
            <div className="flex items-center justify-between text-xs font-bold text-surface-500 ">
              {user ? (
                <div className="w-full flex flex-col gap-2">
                  <p className="text-surface-700">{user.name} ({user.role})</p>
                  {canManageContent && <Link to="/admin" className="flex items-center gap-1.5 hover:text-primary-700 uppercase tracking-wider text-[11px]">
                    <LayoutDashboard size={14}/> Dashboard
                  </Link>}
                  <button onClick={() => { logout(); navigate("/auth"); setMobileOpen(false); }} className="flex items-center gap-1.5 hover:text-red-700 uppercase tracking-wider text-[11px]">
                    <LogOut size={14}/> Logout
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="flex items-center gap-1.5 hover:text-primary-700 uppercase tracking-wider"><User size={14}/> {t("nav.login")}</Link>
              )}
              {/* Dark mode toggle removed */}
              <button onClick={toggleLang} className="flex items-center gap-1.5 hover:text-primary-700 uppercase tracking-wider"><Globe size={14}/> {lang === "id" ? "EN" : "ID"}</button>
            </div>
          </div>
          
        </div>
      )}
    </header>
  );
}
