import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTitle from "./components/PageTitle";
import { CategoriesProvider } from "./context/CategoriesContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { lazy, Suspense } from "react";
const HomePage = lazy(() => import("./pages/HomePage"));
const TerkiniPage = lazy(() => import("./pages/TerkiniPage"));
const ArticleDetailPage = lazy(() => import("./pages/ArticleDetailPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const TagPage = lazy(() => import("./pages/TagPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const SavedArticlesPage = lazy(() => import("./pages/SavedArticlesPage"));
const ProfilPage = lazy(() => import("./pages/ProfilPage"));
const ProgramPage = lazy(() => import("./pages/ProgramPage"));
const StrukturPage = lazy(() => import("./pages/StrukturPage"));
const GaleriPage = lazy(() => import("./pages/GaleriPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DonasiPage = lazy(() => import("./pages/DonasiPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const LatarBelakangPage = lazy(() => import("./pages/LatarBelakangPage"));
const KebijakanPage = lazy(() => import("./pages/KebijakanPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));
const SejarahPage = lazy(() => import("./pages/SejarahPage"));
const HukumPage = lazy(() => import("./pages/HukumPage"));
const PelantikanPage = lazy(() => import("./pages/PelantikanPage"));
const OpiniPage = lazy(() => import("./pages/OpiniPage"));
const KegiatanKBBPage = lazy(() => import("./pages/KegiatanKBBPage"));
const AdministrasiPage = lazy(() => import("./pages/AdministrasiPage"));
const PerpustakaanPage = lazy(() => import("./pages/PerpustakaanPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageArticles = lazy(() => import("./pages/admin/ManageArticles"));
const ArticleEditor = lazy(() => import("./pages/admin/ArticleEditor"));
const ManageComments = lazy(() => import("./pages/admin/ManageComments"));
const ManageCategories = lazy(() => import("./pages/admin/ManageCategories"));
const ManageTags = lazy(() => import("./pages/admin/ManageTags"));
const ManageSettings = lazy(() => import("./pages/admin/ManageSettings"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const ManageMedia = lazy(() => import("./pages/admin/ManageMedia"));
const ManageBooks = lazy(() => import("./pages/admin/ManageBooks"));

import ProtectedRoute from "./components/ProtectedRoute";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
      <AuthProvider>
      <CategoriesProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <PageTitle />
        {/* Skip to content - WCAG accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg text-sm font-semibold">
          Langsung ke konten utama
        </a>
        <Navbar />
        <main id="main-content" className="min-h-screen" role="main">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-surface-50"><div className="w-12 h-12 border-4 border-surface-200 border-t-primary-800 rounded-full animate-spin"></div></div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/terkini" element={<TerkiniPage />} />
              <Route path="/article/:slug" element={<ArticleDetailPage />} />
              <Route path="/artikel/:slug" element={<ArticleDetailPage />} />
              <Route path="/berita/:slug" element={<ArticleDetailPage />} />
              <Route path="/kategori/:slug" element={<CategoryPage />} />
              <Route path="/tag/:slug" element={<TagPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/tersimpan" element={<SavedArticlesPage />} />
              <Route path="/profil" element={<ProfilPage />} />
              <Route path="/program" element={<ProgramPage />} />
              <Route path="/struktur" element={<StrukturPage />} />
              <Route path="/galeri" element={<GaleriPage />} />
              <Route path="/kalender" element={<CalendarPage />} />
              <Route path="/kontak" element={<ContactPage />} />
              <Route path="/donasi" element={<DonasiPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/latar-belakang" element={<LatarBelakangPage />} />
              <Route path="/kebijakan-privasi" element={<KebijakanPage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/tentang/sejarah" element={<SejarahPage />} />
              <Route path="/tentang/susunan-pengurus" element={<HukumPage />} />
              <Route path="/tentang/pelantikan" element={<PelantikanPage />} />
              <Route path="/tentang/opini" element={<OpiniPage />} />
              <Route path="/tentang/kegiatan" element={<KegiatanKBBPage />} />
              <Route path="/tentang/administrasi" element={<AdministrasiPage />} />
              <Route path="/perpustakaan" element={<PerpustakaanPage />} />
              
              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'editor', 'author']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/articles" element={<ManageArticles />} />
                <Route path="/admin/articles/create" element={<ArticleEditor />} />
                <Route path="/admin/articles/edit/:id" element={<ArticleEditor />} />
                <Route path="/admin/media" element={<ManageMedia />} />
                <Route path="/admin/books" element={<ManageBooks />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin', 'editor']} />}>
                <Route path="/admin/comments" element={<ManageComments />} />
                <Route path="/admin/categories" element={<ManageCategories />} />
                <Route path="/admin/tags" element={<ManageTags />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/settings" element={<ManageSettings />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </BrowserRouter>
      </CategoriesProvider>
      </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
