import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BookmarkCheck, Trash2, ChevronRight } from "lucide-react";
import { timeAgo } from "../utils/date";
import { setSingleDocumentTitle } from "../utils/pageTitle";
import OptimizedImage from "../components/OptimizedImage";

const SAVED_ARTICLES_KEY = "kbb_saved_articles";

function readSavedArticles() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_ARTICLES_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeSavedArticles(items) {
  try {
    localStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(items));
  } catch {
    // Browser storage can be unavailable in private mode.
  }
}

export default function SavedArticlesPage() {
  const [savedArticles, setSavedArticles] = useState([]);

  useEffect(() => {
    setSingleDocumentTitle("Baca Nanti - KBB Sadunia");
    const syncSavedArticles = window.setTimeout(() => setSavedArticles(readSavedArticles()), 0);
    return () => window.clearTimeout(syncSavedArticles);
  }, []);

  const removeArticle = (slug) => {
    const next = savedArticles.filter((article) => article.slug !== slug);
    writeSavedArticles(next);
    setSavedArticles(next);
  };

  return (
    <div className="min-h-screen bg-surface-100 pb-12">
      <Helmet>
        <meta name="description" content="Daftar artikel KBB Sadunia yang disimpan untuk dibaca nanti." />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-surface-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary-700 transition-colors">Beranda</Link>
          <ChevronRight size={12} />
          <span className="text-primary-700">Baca Nanti</span>
        </nav>

        <div className="mb-8 border-b-[3px] border-surface-900 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <BookmarkCheck size={28} className="text-primary-700" />
            <h1 className="text-3xl md:text-4xl font-serif font-black text-surface-900 uppercase tracking-tight">Baca Nanti</h1>
          </div>
          <p className="text-sm text-surface-600 font-medium">
            Artikel yang disimpan dari browser ini akan muncul di sini.
          </p>
        </div>

        {savedArticles.length === 0 ? (
          <div className="bg-white border border-surface-200 p-10 text-center shadow-sm">
            <BookmarkCheck size={36} className="mx-auto text-surface-300 mb-4" />
            <h2 className="text-xl font-black text-surface-900 mb-2">Belum ada artikel tersimpan</h2>
            <p className="text-sm text-surface-500 mb-6">Buka artikel, lalu tekan tombol Simpan untuk membuat daftar baca nanti.</p>
            <Link to="/terkini" className="inline-block px-6 py-3 bg-primary-800 text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary-900 transition-colors">
              Lihat Berita Terkini
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-surface-200 p-3 sm:p-5 shadow-sm">
            <div className="mb-4 text-[11px] font-black uppercase tracking-widest text-surface-500">
              {savedArticles.length} artikel tersimpan
            </div>

            <div className="divide-y divide-surface-200">
              {savedArticles.map((article) => (
                <article key={article.slug} className="flex flex-col sm:flex-row gap-5 py-5">
                  <Link to={`/article/${article.slug}`} className="w-full sm:w-[220px] h-[140px] shrink-0 overflow-hidden bg-surface-100 shadow-sm">
                    <OptimizedImage src={article.image_url} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" sizes="(min-width: 640px) 220px, 100vw" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {article.category_name && (
                        <span className="px-2 py-1 bg-primary-700 text-white text-[10px] font-black uppercase tracking-widest">
                          {article.category_name}
                        </span>
                      )}
                      <time className="text-[10px] font-black text-surface-400 uppercase tracking-widest" dateTime={article.published_at}>
                        {timeAgo(article.published_at)}
                      </time>
                    </div>

                    <Link to={`/article/${article.slug}`} className="group">
                      <h2 className="text-[18px] font-bold text-surface-900 leading-snug line-clamp-2 mb-2 group-hover:text-primary-700 transition-colors">
                        {article.title}
                      </h2>
                    </Link>
                    <p className="text-[14px] text-surface-600 line-clamp-2 leading-relaxed mb-4">{article.excerpt}</p>

                    <button onClick={() => removeArticle(article.slug)} className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-surface-500 hover:text-red-700 transition-colors" aria-label={`Hapus ${article.title} dari simpanan`}>
                      <Trash2 size={14} /> Hapus dari simpanan
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
