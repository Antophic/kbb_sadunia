import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ArticleCard from "../components/ArticleCard";
import TrendingTopicsBar from "../components/TrendingTopicsBar";
import { NewsExploreLinks, NewsIndexPagination } from "../components/NewsIndexNavigation";
import { apiGetArticles, apiGetTags } from "../services/api";
import { getAllCategoryList } from "../utils/categoryNavigation";
import { setSingleDocumentTitle } from "../utils/pageTitle";
import { useCategories } from "../context/CategoriesContext";

const PER_PAGE = 10;

export default function TagPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const currentPage = Math.max(1, Number(params.get("page") || 1));
  const [articles, setArticles] = useState([]);
  const [tags, setTags] = useState([]);
  const [meta, setMeta] = useState({ total_pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const { categories = [] } = useCategories();

  useEffect(() => {
    let ignore = false;

    const loadTagData = async () => {
      setLoading(true);
      try {
        const [articlesRes, tagsRes] = await Promise.all([
          apiGetArticles(`?tag=${encodeURIComponent(slug)}&page=${currentPage}&per_page=${PER_PAGE}`),
          apiGetTags(),
        ]);
        if (ignore) return;
        setArticles(articlesRes.data || []);
        setMeta(articlesRes.meta || { total_pages: 1, total: 0 });
        setTags(tagsRes.data || []);
      } catch {
        if (!ignore) {
          setArticles([]);
          setMeta({ total_pages: 1, total: 0 });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadTagData();

    return () => {
      ignore = true;
    };
  }, [slug, currentPage]);

  const tag = useMemo(() => tags.find((item) => item.slug === slug), [slug, tags]);
  const title = tag?.name || slug.replace(/-/g, " ");

  useEffect(() => {
    setSingleDocumentTitle(`Topik ${title} - KBB Sadunia`);
  }, [title]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-100">
        <div className="w-12 h-12 border-4 border-surface-200 border-t-primary-700 rounded-full animate-spin" />
      </div>
    );
  }

  const allCategories = getAllCategoryList(categories);
  const totalArticles = Number(meta.total || articles.length || 0);

  return (
    <div className="min-h-screen bg-surface-100 pb-12">
      <Helmet>
        <meta name="description" content={`Kumpulan berita dan opini KBB Sadunia dengan topik ${title}.`} />
      </Helmet>

      <TrendingTopicsBar compact />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-serif font-black text-surface-900 uppercase tracking-tight whitespace-nowrap">
            Topik: {title}
          </h1>
          <div className="news-divider-brand flex-1" />
        </div>
        <p className="text-sm text-surface-500 font-semibold mb-8">{totalArticles} artikel dalam topik ini</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {articles.length > 0 ? (
              <>
                <div className="bg-white border border-surface-200 p-2 sm:p-4 shadow-sm">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} variant="list" />
                  ))}
                </div>
                <NewsIndexPagination
                  currentPage={currentPage}
                  totalPages={Number(meta.total_pages || 1)}
                  makeHref={(page) => `/tag/${slug}?page=${page}`}
                />
              </>
            ) : (
              <div className="bg-white border border-surface-200 p-10 text-center text-surface-500 font-semibold">
                Belum ada artikel untuk topik ini.
              </div>
            )}

            <NewsExploreLinks
              categories={allCategories}
              topics={["KBB Sadunia", "Paman Birin", "Pelantikan KBB", "Banjar Malaysia", "Budaya Banjar"]}
            />
          </div>

          <aside className="lg:col-span-4">
            <div className="bg-white border-t-4 border-t-primary-800 border-x border-b border-surface-200">
              <div className="px-5 py-4 border-b border-surface-200 bg-surface-50">
                <h2 className="text-sm font-black text-surface-900 uppercase tracking-widest">Topik Lain</h2>
              </div>
              <div className="p-5 flex flex-wrap gap-2">
                {tags.filter((item) => item.slug !== slug).slice(0, 18).map((item) => (
                  <Link key={item.slug} to={`/tag/${item.slug}`} className="px-3 py-1.5 border border-surface-200 bg-white text-xs font-bold text-surface-700 hover:border-primary-500 hover:text-primary-700 transition-colors">
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
