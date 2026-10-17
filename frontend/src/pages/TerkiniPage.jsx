import { useEffect, useState } from "react";
import { apiGetArticles, apiGetTrending } from "../services/api";
import { EXCLUDE_TENTANG_PARAMS } from "../utils/tentangCategories";
import ArticleCard from "../components/ArticleCard";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getAllCategoryList } from "../utils/categoryNavigation";
import { NewsExploreLinks, NewsIndexPagination } from "../components/NewsIndexNavigation";
import TrendingTopicsBar from "../components/TrendingTopicsBar";
import { useCategories } from "../context/CategoriesContext";

const PER_PAGE = 10;

export default function TerkiniPage() {
  const [params] = useSearchParams();
  const currentPage = Math.max(1, Number(params.get("page") || 1));
  const [articles, setArticles] = useState([]);
  const [trending, setTrending] = useState([]);
  const [meta, setMeta] = useState({ total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const { categories = [] } = useCategories();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [articlesRes, trendingRes] = await Promise.all([
          apiGetArticles(`?page=${currentPage}&per_page=${PER_PAGE}&${EXCLUDE_TENTANG_PARAMS}`),
          apiGetTrending(),
        ]);
        setArticles(articlesRes.data || []);
        setMeta(articlesRes.meta || { total_pages: 1 });
        setTrending(trendingRes.data || []);
      } catch (error) {
        console.error("Failed to fetch terkini data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-100">
        <div className="w-12 h-12 border-4 border-surface-200 border-t-breaking rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pb-12">
      <Helmet>
        <meta name="description" content="Indeks berita terkini dan terbaru hari ini." />
      </Helmet>
      <TrendingTopicsBar compact />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-serif font-black text-surface-900 uppercase tracking-tight whitespace-nowrap">Berita Terkini</h1>
          <div className="news-divider-red flex-1" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white border border-surface-200 p-2 sm:p-4 rounded-sm">
              {articles.length > 0 ? (
                articles.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="list" />
                ))
              ) : (
                <div className="text-center py-12 text-surface-500 font-medium">Belum ada berita terkini.</div>
              )}
            </div>
            
            <NewsIndexPagination
              currentPage={currentPage}
              totalPages={Number(meta.total_pages || 1)}
              makeHref={(page) => `/terkini?page=${page}`}
            />

            <NewsExploreLinks
              categories={getAllCategoryList(categories)}
              topics={["KBB Sadunia", "Banjar", "Halal Bihalal", "Pelantikan KBB", "Budaya Banjar", "Kegiatan Sosial"]}
            />
          </div>
          
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              {/* Terpopuler Widget */}
              <div className="bg-white border-t-4 border-t-breaking border-x border-b border-surface-200 shadow-sm">
                <div className="px-5 py-4 border-b border-surface-200">
                  <h3 className="text-base font-black text-surface-900 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-5 h-5 text-breaking" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                    Terpopuler
                  </h3>
                </div>
                <div className="divide-y divide-surface-100">
                  {trending.map((a, i) => (
                    <Link key={a.id} to={`/article/${a.slug}`} className="flex items-center gap-4 px-5 py-4 group hover:bg-surface-50 transition-colors">
                      <span className={`text-4xl font-serif font-black italic shrink-0 w-8 text-center ${i === 0 ? "text-breaking" : "text-surface-300"}`}>{i + 1}</span>
                      <div>
                        <h4 className="text-[15px] font-bold text-surface-900 group-hover:text-breaking transition-colors line-clamp-2 leading-snug">{a.title}</h4>
                        <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest mt-1 block">{a.views} dibaca</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Ad Placeholder */}
              <div className="w-full h-[250px] bg-white border border-surface-200 flex flex-col items-center justify-center text-surface-400 text-xs font-bold uppercase tracking-widest p-4 text-center">
                <span className="mb-2 text-xl border border-surface-300 px-3 py-1">Ad</span>
                Space Iklan
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
