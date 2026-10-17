import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { getCategoryLabel } from "../utils/categoryNavigation";

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 1) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, 2, totalPages]);
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 2 && page < totalPages) pages.add(page);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      items.push(`ellipsis-${page}`);
    }
    items.push(page);
  });
  return items;
}

export function NewsIndexPagination({ currentPage, totalPages, makeHref }) {
  const pageItems = buildPageItems(currentPage, totalPages);
  if (pageItems.length === 0) return null;

  return (
    <nav className="mt-8 pt-6 border-t border-surface-200 flex items-center justify-center gap-2" aria-label="Navigasi halaman berita">
      {currentPage > 1 && (
        <Link to={makeHref(currentPage - 1)} className="w-9 h-9 flex items-center justify-center border border-surface-200 bg-white text-surface-700 hover:border-primary-600 hover:text-primary-700 transition-colors" aria-label="Halaman sebelumnya">
          <ChevronLeft size={18} />
        </Link>
      )}

      {pageItems.map((item) => {
        if (typeof item === "string") {
          return <span key={item} className="w-9 h-9 flex items-center justify-center text-surface-500 font-bold">...</span>;
        }

        const active = item === currentPage;
        return (
          <Link
            key={item}
            to={makeHref(item)}
            className={`w-9 h-9 flex items-center justify-center text-sm font-black transition-colors ${
              active
                ? "bg-primary-700 text-white"
                : "bg-white border border-surface-200 text-surface-700 hover:border-primary-600 hover:text-primary-700"
            }`}
          >
            {item}
          </Link>
        );
      })}

      {currentPage < totalPages && (
        <Link to={makeHref(currentPage + 1)} className="w-9 h-9 flex items-center justify-center border border-surface-200 bg-white text-surface-700 hover:border-primary-600 hover:text-primary-700 transition-colors" aria-label="Halaman berikutnya">
          <ChevronRight size={18} />
        </Link>
      )}
    </nav>
  );
}

export function NewsExploreLinks({ categories = [], topics = [] }) {
  const visibleCategories = categories.filter((category) => category?.slug);
  const searchTopics = topics.filter(Boolean).slice(0, 8);

  if (visibleCategories.length === 0 && searchTopics.length === 0) return null;

  return (
    <section className="mt-8 bg-white border border-surface-200 shadow-sm">
      <div className="px-5 py-4 border-b border-surface-200 bg-surface-50 flex items-center gap-2">
        <Search size={16} className="text-primary-700" />
        <h2 className="text-[12px] font-black uppercase tracking-[0.18em] text-surface-900">Temukan Berita Lain</h2>
      </div>

      <div className="p-5 space-y-5">
        {searchTopics.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-surface-500 mb-3">Topik Cepat</p>
            <div className="flex flex-wrap gap-2">
              {searchTopics.map((topic) => (
                <Link key={topic} to={`/search?q=${encodeURIComponent(topic)}`} className="px-3 py-1.5 border border-surface-200 bg-white text-xs font-bold text-surface-700 hover:border-primary-500 hover:text-primary-700 transition-colors">
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        )}

        {visibleCategories.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-surface-500 mb-3">Kategori</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {visibleCategories.map((category) => (
                <Link key={category.slug} to={`/kategori/${category.slug}`} className="flex items-center justify-between gap-3 px-3 py-2 border border-surface-200 hover:border-primary-500 hover:bg-surface-50 transition-colors">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: category.color || "#0f7f75" }} />
                    <span className="text-xs font-black uppercase tracking-wide text-surface-700 truncate">{getCategoryLabel(category)}</span>
                  </span>
                  <span className="text-[10px] font-bold text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full">{category.article_count || 0}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
