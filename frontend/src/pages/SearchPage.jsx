import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import ArticleCard from "../components/ArticleCard";
import { apiGetArticles } from "../services/api";
import { EXCLUDE_TENTANG_PARAMS } from "../utils/tentangCategories";
import { Helmet } from "react-helmet-async";
import { Search } from "lucide-react";
import { setSingleDocumentTitle } from "../utils/pageTitle";
import { getAllCategoryList } from "../utils/categoryNavigation";
import { NewsExploreLinks, NewsIndexPagination } from "../components/NewsIndexNavigation";
import TrendingTopicsBar from "../components/TrendingTopicsBar";
import { useCategories } from "../context/CategoriesContext";
import {
  articleDateValue,
  normalizeSearchText,
  scoreArticle,
  tokenizeQuery,
  uniqueArticles,
} from "../utils/searchMatch";

const PER_PAGE = 10;
const INDEX_PER_PAGE = 100;
const MAX_INDEX_PAGES = 20;
const quickTopics = ["Silaturahmi", "KBB Sadunia", "Banjar", "Halal Bihalal", "Pelantikan KBB", "Budaya Banjar", "Kegiatan Sosial", "Pendidikan", "Ekonomi"];

async function fetchSearchArticles(searchTerm) {
  const encodedQuery = encodeURIComponent(searchTerm.trim());
  const makeParams = (page) => `?page=${page}&per_page=${INDEX_PER_PAGE}&search=${encodedQuery}&${EXCLUDE_TENTANG_PARAMS}`;
  const firstArticlesRes = await apiGetArticles(makeParams(1));
  const totalIndexPages = Math.min(Number(firstArticlesRes.meta?.total_pages || 1), MAX_INDEX_PAGES);
  const restPages = totalIndexPages > 1
    ? await Promise.all(
        Array.from({ length: totalIndexPages - 1 }, (_, index) => apiGetArticles(makeParams(index + 2)))
      )
    : [];

  return uniqueArticles([...(firstArticlesRes.data || []), ...restPages.flatMap((res) => res.data || [])]);
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get("q") || "";
  const pageParam = Math.max(1, Number(params.get("page") || 1));
  const [draftQuery, setDraftQuery] = useState(query);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { categories = [] } = useCategories();

  useEffect(() => {
    setSingleDocumentTitle(query ? `Pencarian "${query}" - KBB Sadunia` : "Pencarian - KBB Sadunia");
    const syncQuery = window.setTimeout(() => setDraftQuery(query), 0);
    return () => window.clearTimeout(syncQuery);
  }, [query]);

  useEffect(() => {
    let isCurrent = true;

    const fetchData = async () => {
      setLoading(true);
      setArticles([]);
      try {
        const searchTerm = query.trim();
        const searchArticles = searchTerm ? await fetchSearchArticles(searchTerm) : [];

        if (!isCurrent) return;
        setArticles(searchArticles);
      } catch (err) {
        console.error("Failed to load search data:", err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isCurrent = false;
    };
  }, [query]);

  const visibleCategories = useMemo(() => getAllCategoryList(categories), [categories]);
  const normalizedQuery = normalizeSearchText(query);
  const queryWords = useMemo(() => tokenizeQuery(query), [query]);

  const results = useMemo(() => {
    if (!normalizedQuery || queryWords.length === 0) return [];

    return articles
      .map((article) => ({
        article,
        score: scoreArticle(article, normalizedQuery, queryWords),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || articleDateValue(b.article) - articleDateValue(a.article))
      .map((item) => item.article);
  }, [articles, normalizedQuery, queryWords]);

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const currentPage = Math.min(pageParam, totalPages);
  const pageResults = results.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextQuery = draftQuery.trim();
    if (!nextQuery) {
      navigate("/search");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(nextQuery)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pb-12">
      <Helmet>
        <meta name="description" content={`Hasil pencarian artikel KBB Sadunia untuk ${query || "kata kunci berita"}.`} />
      </Helmet>
      <TrendingTopicsBar compact />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />

        <div className="mb-6">
          <h1 className="text-3xl font-serif font-black text-surface-900 uppercase tracking-tight mb-4">Pencarian Berita</h1>
          <form onSubmit={handleSubmit} className="bg-white border border-surface-200 p-3 flex flex-col sm:flex-row gap-3 shadow-sm">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="search"
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder="Cari berita, tokoh, wilayah, atau kegiatan..."
                className="w-full pl-11 pr-4 py-3 border border-surface-200 bg-surface-50 text-sm font-semibold focus:outline-none focus:border-primary-600 focus:bg-white"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-primary-800 text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary-900 transition-colors">
              Cari
            </button>
          </form>
        </div>

        {query ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="mb-4 text-sm font-semibold text-surface-600">
                {results.length > 0
                  ? `Ditemukan ${results.length} artikel untuk "${query}"`
                  : `Tidak ditemukan hasil untuk "${query}"`}
              </div>

              {pageResults.length > 0 ? (
                <>
                  <div className="bg-white border border-surface-200 p-2 sm:p-4 shadow-sm">
                    {pageResults.map((article) => (
                      <ArticleCard key={article.id} article={article} variant="list" />
                    ))}
                  </div>

                  <NewsIndexPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    makeHref={(page) => `/search?q=${encodeURIComponent(query)}&page=${page}`}
                  />
                </>
              ) : (
                <div className="bg-white border border-surface-200 p-10 text-center text-surface-500 font-semibold">
                  Coba kata kunci lain atau pilih kategori di bawah.
                </div>
              )}

              <NewsExploreLinks categories={visibleCategories} topics={quickTopics} />
            </div>

            <aside className="lg:col-span-4">
              <NewsExploreLinks categories={visibleCategories.slice(0, 8)} topics={quickTopics.slice(0, 5)} />
            </aside>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="bg-white border border-surface-200 p-10 text-center shadow-sm">
                <Search size={34} className="mx-auto text-primary-700 mb-4" />
                <h2 className="text-xl font-black text-surface-900 mb-2">Masukkan kata kunci pencarian</h2>
                <p className="text-sm text-surface-500 mb-6">Cari berdasarkan judul, kategori, tokoh, wilayah, atau isi ringkasan berita.</p>
                <Link to="/terkini" className="inline-block px-5 py-2.5 bg-primary-800 text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary-900 transition-colors">
                  Lihat Berita Terkini
                </Link>
              </div>
              <NewsExploreLinks categories={visibleCategories} topics={quickTopics} />
            </div>

            <aside className="lg:col-span-4">
              <NewsExploreLinks categories={visibleCategories.slice(0, 8)} topics={quickTopics.slice(0, 5)} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
