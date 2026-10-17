import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { apiGetArticles } from "../services/api";
import ArticleCard from "../components/ArticleCard";
import { Helmet } from "react-helmet-async";
import { getAllCategoryList, getCategoryLabel, getVisibleCategoryList } from "../utils/categoryNavigation";
import { setSingleDocumentTitle } from "../utils/pageTitle";
import { NewsExploreLinks, NewsIndexPagination } from "../components/NewsIndexNavigation";
import TrendingTopicsBar from "../components/TrendingTopicsBar";
import { useCategories } from "../context/CategoriesContext";

const PER_PAGE = 10;

export default function CategoryPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const currentPage = Math.max(1, Number(params.get("page") || 1));
  const [articles, setArticles] = useState([]);
  const [meta, setMeta] = useState({ total_pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const { categories = [], loading: categoriesLoading } = useCategories();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
      try {
        const articlesRes = await apiGetArticles(`?category=${encodeURIComponent(slug)}&page=${currentPage}&per_page=${PER_PAGE}`);
        setArticles(articlesRes.data || []);
        setMeta(articlesRes.meta || { total_pages: 1, total: 0 });
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, currentPage]);

  const category = categories.find((c) => c.slug === slug);
  const visibleCategories = getVisibleCategoryList(categories);
  const allCategories = getAllCategoryList(categories);
  const totalArticles = Math.max(Number(meta.total || 0), Number(category?.article_count || 0), articles.length);
  const shownArticles = articles.length;

  useEffect(() => {
    if (category?.name) {
      setSingleDocumentTitle(`${category.name} - KBB Sadunia`);
    }
  }, [category?.name]);

  if (loading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-100">
        <div className="w-12 h-12 border-4 border-surface-200 border-t-breaking rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-100">
        <div className="text-center bg-white p-12 rounded border border-surface-200 shadow-sm">
          <h2 className="text-6xl font-serif font-black text-surface-200 mb-4">404</h2>
          <p className="text-surface-600 mb-8 font-medium">Kategori tidak ditemukan atau telah dihapus.</p>
          <Link to="/" className="px-6 py-3 bg-breaking text-white text-sm font-bold uppercase tracking-wider hover:bg-red-800 transition-colors">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pb-12">
      <Helmet>
        <meta name="description" content={`Berita terbaru dan terpopuler seputar ${category.name}`} />
      </Helmet>
      <TrendingTopicsBar compact />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-serif font-black text-surface-900 uppercase tracking-tight whitespace-nowrap" style={{ color: category.color || '#0f172a' }}>{category.name}</h1>
            <div className="flex-1 h-1" style={{ backgroundColor: category.color || '#dc2626' }} />
          </div>
          <p className="text-surface-500 text-sm font-medium">
            {totalArticles} artikel dalam kategori ini
            {totalArticles > shownArticles && (
              <span className="ml-2 text-surface-400">Halaman {currentPage} menampilkan {shownArticles} artikel.</span>
            )}
          </p>
        </div>

        {/* Category tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {visibleCategories.map((cat) => (
            <Link key={cat.slug} to={`/kategori/${cat.slug}`}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${cat.slug === slug ? "text-white" : "bg-white text-surface-600 border-surface-200 hover:border-surface-400"}`}
              style={cat.slug === slug ? { backgroundColor: cat.color || '#dc2626', borderColor: cat.color || '#dc2626' } : {}}>
              {cat.slug !== slug && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color || '#dc2626' }} />}
              {getCategoryLabel(cat)}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {articles.length > 0 ? (
              <>
                {/* First article as headline */}
                <div className="mb-6">
                  <ArticleCard article={articles[0]} variant="headline" />
                </div>
                
                {/* Rest as list */}
                {articles.length > 1 && (
                  <div className="bg-white border border-surface-200 p-2 sm:p-4 rounded-sm">
                    {articles.slice(1).map((a) => (
                      <ArticleCard key={a.id} article={a} variant="list" />
                    ))}
                  </div>
                )}
                
                <NewsIndexPagination
                  currentPage={currentPage}
                  totalPages={Number(meta.total_pages || 1)}
                  makeHref={(page) => `/kategori/${slug}?page=${page}`}
                />

                <NewsExploreLinks
                  categories={allCategories.filter((cat) => cat.slug !== slug)}
                  topics={["KBB Sadunia", category.name, "Banjar", "Pelantikan KBB", "Budaya Banjar", "Kegiatan Sosial"]}
                />
              </>
            ) : (
              <div className="bg-white border border-surface-200 p-12 text-center text-surface-500 font-medium">
                Belum ada artikel dalam kategori ini.
              </div>
            )}
          </div>
          
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              {/* Ad Placeholder */}
              <div className="w-full h-[250px] bg-white border border-surface-200 flex flex-col items-center justify-center text-surface-400 text-xs font-bold uppercase tracking-widest p-4 text-center">
                <span className="mb-2 text-xl border border-surface-300 px-3 py-1">Ad</span>
                Space Iklan
              </div>

              {/* Categories Widget */}
              <div className="bg-white border-t-4 border-t-surface-900 border-x border-b border-surface-200">
                <div className="px-5 py-4 border-b border-surface-200 bg-surface-50">
                  <h3 className="text-sm font-black text-surface-900 uppercase tracking-widest">Jelajahi Kategori</h3>
                </div>
                <div className="divide-y divide-surface-100">
                  {allCategories.filter((c) => c.slug !== slug).map((cat) => (
                    <Link key={cat.slug} to={`/kategori/${cat.slug}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || '#3391ff' }} />
                        <span className="text-sm text-surface-700 group-hover:text-surface-900 font-bold uppercase tracking-wide">{getCategoryLabel(cat)}</span>
                      </div>
                      <span className="text-xs font-semibold text-surface-400 bg-surface-100 px-2.5 py-0.5 rounded-full">{cat.article_count || 0}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
