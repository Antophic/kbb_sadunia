import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { apiGetArticles } from "../services/api";
import { Clock, PenLine, Quote } from "lucide-react";
import { timeAgo } from "../utils/date";
import OptimizedImage from "../components/OptimizedImage";

export default function OpiniPage() {
  const { t } = useLang();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetArticles(`?category=artikel--opini&per_page=30&t=${Date.now()}`)
      .then(res => setArticles(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <div className="mb-7 bg-white border border-surface-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-2 bg-amber-900 text-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em]">
              <PenLine size={13} /> OPINI
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-surface-400">
              Kolom gagasan dan pandangan penulis
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-surface-900 mb-3">{t("nav.opini") || "Opini"}</h1>
          <p className="text-sm md:text-base text-surface-600 leading-relaxed max-w-3xl">
            Tulisan di halaman ini adalah opini, kajian, dan pandangan penulis. Isinya dibedakan dari berita redaksi karena memuat analisis, argumentasi, dan perspektif pribadi penulis.
          </p>
        </div>
        
        {loading ? (
          <p>Memuat opini...</p>
        ) : (
          <div className="space-y-5">
              {articles.length > 0 ? (
                articles.map((a) => (
                  <Link
                    key={a.id}
                    to={`/article/${a.slug}`}
                    className="group grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 bg-white border border-surface-200 border-l-4 border-l-amber-900 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-44 md:h-full min-h-[150px] overflow-hidden bg-surface-200">
                      <OptimizedImage src={a.image_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" sizes="(min-width: 768px) 220px, 100vw" />
                      <span className="absolute left-0 bottom-0 bg-amber-900 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em]">
                        OPINI
                      </span>
                    </div>
                    <div className="flex flex-col justify-center min-w-0 py-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-amber-900">
                          <Quote size={13} /> Pandangan Penulis
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-surface-400">Bukan berita redaksi</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-serif font-black text-surface-900 leading-snug mb-3 group-hover:text-amber-900 transition-colors">
                        {a.title}
                      </h2>
                      <p className="text-sm text-surface-600 leading-relaxed line-clamp-3 mb-4">
                        {a.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-surface-400">
                        <span className="text-surface-700">{a.author_name || "Penulis"}</span>
                        <span aria-hidden="true">-</span>
                        <time dateTime={a.published_at} className="flex items-center gap-1">
                          <Clock size={12} /> {timeAgo(a.published_at)}
                        </time>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white border border-surface-200 p-6 text-center text-surface-500">Belum ada opini yang dipublikasikan.</div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
