import { Link } from "react-router-dom";
import { timeAgo } from "../utils/date";
import { Clock } from "lucide-react";
import { isOpinionArticle } from "../utils/articleType";
import OptimizedImage from "./OptimizedImage";

export default function ArticleCard({ article, variant = "default" }) {
  const imgSrc = article.image_url;
  const opinion = isOpinionArticle(article);
  const categoryLabel = opinion ? "OPINI" : (article.category_name || "Umum");
  const categoryColor = opinion ? "#7c2d12" : (article.category_color || "var(--color-primary-700)");
  // Headline - big card like CNN top story
  if (variant === "headline") {
    return (
      <Link to={`/article/${article.slug}`} className="group block relative overflow-hidden h-[450px] bg-surface-900 shadow-sm" aria-label={`Baca: ${article.title}`}>
        <OptimizedImage src={imgSrc} alt={article.title} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" sizes="(min-width: 1024px) 66vw, 100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        
        {article.breaking && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-breaking text-white text-[10px] font-black uppercase tracking-widest z-10 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            BREAKING NEWS
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-widest shadow-sm" style={{ backgroundColor: categoryColor }}>
              {categoryLabel}
            </span>
            {opinion && (
              <span className="px-2.5 py-1 text-[10px] font-black text-amber-950 uppercase tracking-widest bg-amber-100 border border-amber-300 shadow-sm">
                Pandangan Penulis
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-3 leading-tight group-hover:text-primary-200 transition-colors drop-shadow-md">
            {article.title}
          </h2>
          <p className="text-gray-300 text-sm md:text-base line-clamp-2 mb-4 max-w-3xl font-medium leading-relaxed drop-shadow-sm">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span className="text-white">{article.author_name || 'Redaksi'}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={article.published_at} className="flex items-center gap-1">
              <Clock size={12} /> {timeAgo(article.published_at)}
            </time>
          </div>
        </div>
      </Link>
    );
  }

  // Side headline - smaller version for sidebars
  if (variant === "side") {
    return (
      <Link to={`/article/${article.slug}`} className="group flex gap-4 py-4 border-b border-surface-200 last:border-0" aria-label={`Baca: ${article.title}`}>
        <div className="w-[100px] h-[75px] shrink-0 overflow-hidden relative shadow-sm">
          <OptimizedImage src={imgSrc} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" sizes="(min-width: 640px) 220px, 100vw" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          {opinion && (
            <span className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-amber-900">
              Opini
            </span>
          )}
          <h3 className="text-[14px] font-sans font-bold text-surface-900 leading-snug line-clamp-2 mb-2 group-hover:text-primary-700 transition-colors">
            {article.title}
          </h3>
          <time className="text-[10px] font-black text-surface-400 uppercase tracking-widest flex items-center gap-1" dateTime={article.published_at}>
            <Clock size={10} /> {timeAgo(article.published_at)}
          </time>
        </div>
      </Link>
    );
  }

  // List item - like detik.com terkini (larger horizontal card)
  if (variant === "list") {
    return (
      <Link to={`/article/${article.slug}`} className={`group flex flex-col sm:flex-row gap-5 py-5 border-b border-surface-200 last:border-0 ${opinion ? "bg-amber-50/40 px-3 border-l-4 border-l-amber-800" : ""}`} aria-label={`Baca: ${article.title}`}>
        <div className="w-full sm:w-[220px] h-[140px] shrink-0 overflow-hidden relative shadow-sm">
          <OptimizedImage src={imgSrc} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" sizes="100px" />
          <span className="absolute bottom-0 left-0 text-[10px] font-black px-2 py-1 text-white uppercase tracking-widest" style={{ backgroundColor: categoryColor }}>
            {categoryLabel}
          </span>
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          {opinion && (
            <span className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-900">
              Kolom Opini - Pandangan Penulis
            </span>
          )}
          <h3 className="text-[18px] font-sans font-bold text-surface-900 leading-snug line-clamp-2 mb-2 group-hover:text-primary-700 transition-colors">
            {article.title}
          </h3>
          <p className="text-[14px] text-surface-600 line-clamp-2 mb-3 leading-relaxed">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 text-[10px] font-black text-surface-400 uppercase tracking-widest">
            <span className="text-surface-700 ">{article.author_name || 'Redaksi'}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={article.published_at} className="flex items-center gap-1">
              <Clock size={12} /> {timeAgo(article.published_at)}
            </time>
          </div>
        </div>
      </Link>
    );
  }

  // Default card - grid items
  return (
    <Link to={`/article/${article.slug}`} className="group block h-full flex flex-col bg-white border border-surface-200 shadow-sm hover:shadow-md transition-shadow" aria-label={`Baca: ${article.title}`}>
      <div className="relative h-48 overflow-hidden border-b border-surface-200 ">
        <OptimizedImage src={imgSrc} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        {article.breaking && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-breaking text-white text-[9px] font-black uppercase tracking-widest z-10 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            BREAKING
          </div>
        )}
        <span className="absolute bottom-0 left-0 text-[10px] font-black px-3 py-1.5 text-white uppercase tracking-widest z-10 shadow-sm" style={{ backgroundColor: categoryColor }}>
          {categoryLabel}
        </span>
      </div>
      <div className="flex flex-col flex-1 p-5">
        {opinion && (
          <span className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-900">
            Kolom Opini
          </span>
        )}
        <h3 className="text-[16px] font-sans font-bold text-surface-900 leading-snug line-clamp-3 mb-3 group-hover:text-primary-700 transition-colors">
          {article.title}
        </h3>
        <p className="text-[13px] text-surface-600 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-[10px] font-black text-surface-400 uppercase tracking-widest mt-auto border-t border-surface-100 pt-4">
          <span className="text-surface-700 truncate max-w-[100px]">{article.author_name || 'Redaksi'}</span>
          <time dateTime={article.published_at} className="flex items-center gap-1">
            <Clock size={12} /> {timeAgo(article.published_at)}
          </time>
        </div>
      </div>
    </Link>
  );
}
