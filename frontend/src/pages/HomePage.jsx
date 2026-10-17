import { useEffect, useState } from "react";
import ArticleCard from "../components/ArticleCard";
import { Link } from "react-router-dom";
import { apiGetArticles, apiGetTrending } from "../services/api";
import { EXCLUDE_TENTANG_PARAMS } from "../utils/tentangCategories";
import { Helmet } from "react-helmet-async";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronRight, TrendingUp } from "lucide-react";
import TrendingTopicsBar from "../components/TrendingTopicsBar";
import OptimizedImage from "../components/OptimizedImage";
import { useCategories } from "../context/CategoriesContext";

export default function HomePage() {
  const [data, setData] = useState({
    articles: [],
    trending: [],
  });
  const [loading, setLoading] = useState(true);
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const { categories = [] } = useCategories();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, trendingRes] = await Promise.all([
          apiGetArticles(`?per_page=30&${EXCLUDE_TENTANG_PARAMS}`),
          apiGetTrending(),
        ]);
        
        setData({
          articles: articlesRes.data || [],
          trending: trendingRes.data || [],
        });
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-surface-50">
        <div className="w-12 h-12 border-[5px] border-surface-200 border-t-primary-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { articles, trending } = data;
  const breaking = articles.find((a) => a.breaking);
  const featured = articles.filter((a) => a.featured);
  const latest = articles.slice(0, 30);
  const hasArticles = articles.length > 0;
  
  // Editorial layout logic
  const sliderArticles = featured.length > 0 ? featured.slice(0, 5) : latest.slice(0, 3);
  const sideHeadlines = latest.filter(a => !sliderArticles.find(s => s.id === a.id)).slice(0, 3);
  const gridNews = latest.filter(a => !sliderArticles.find(s => s.id === a.id) && !sideHeadlines.find(s => s.id === a.id)).slice(0, 6);
  const moreLatestCandidates = latest.filter(a => !sliderArticles.find(s => s.id === a.id) && !sideHeadlines.find(s => s.id === a.id) && !gridNews.find(s => s.id === a.id)).slice(0, 6);
  const moreLatest = moreLatestCandidates.length > 0 ? moreLatestCandidates : latest.slice(0, 6);
  const editorPicks = featured.length > 0 ? featured.slice(0, 4) : latest.slice(0, 4);

  return (
    <div className="min-h-screen bg-white pb-12 transition-colors duration-200">
      <Helmet>
        <meta name="description" content="Portal berita terlengkap dan terpercaya." />
      </Helmet>
      <h1 className="sr-only">KBB Sadunia - Portal Berita Bubuhan Banjar Sadunia</h1>
      
      {/* Breaking News Ticker */}
      {breaking && (
        <div className="bg-primary-800 text-white border-b border-primary-900 shadow-sm relative z-10 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-stretch">
            <div className="bg-breaking text-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 relative z-20 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_#fff]"></span>
              BREAKING
            </div>
            <div className="overflow-hidden flex-1 py-2.5 px-6 relative ticker-wrap">
              <div className="ticker-content">
                <Link to={`/article/${breaking.slug}`} className="inline-block text-[14px] font-bold hover:text-primary-300 transition-colors mr-10">
                  {breaking.title} <span className="font-normal mx-4 text-primary-500">|</span> <span className="font-medium text-primary-200">{breaking.excerpt}</span>
                </Link>
                {/* Duplicate for infinite loop */}
                <Link to={`/article/${breaking.slug}`} className="inline-block text-[14px] font-bold hover:text-primary-300 transition-colors">
                  {breaking.title} <span className="font-normal mx-4 text-primary-500">|</span> <span className="font-medium text-primary-200">{breaking.excerpt}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <TrendingTopicsBar />

      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Top Headline Section - Editorial Split */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6 border-b-2 border-surface-200 pb-3">
            <div className="w-2 h-6 bg-primary-800"></div>
            <h2 className="text-2xl font-sans font-black text-surface-900 uppercase tracking-tight">Sorotan Utama</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Headline (Slider) */}
            <div className="lg:col-span-8 overflow-hidden bg-white border border-surface-200 shadow-sm relative group" ref={emblaRef}>
              {hasArticles ? (
                <div className="flex h-full">
                  {sliderArticles.map(article => (
                    <div key={article.id} className="flex-[0_0_100%] min-w-0 h-[450px] relative">
                      <OptimizedImage
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        loading={article === sliderArticles[0] ? "eager" : "lazy"}
                        fetchPriority={article === sliderArticles[0] ? "high" : undefined}
                        sizes="(min-width: 1024px) 66vw, 100vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-900/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        {article.category_name && (
                          <span className="inline-block px-3 py-1 bg-primary-700 text-white text-[10px] font-black uppercase tracking-widest mb-3 shadow-md">
                            {article.category_name}
                          </span>
                        )}
                        <Link to={`/article/${article.slug}`}>
                          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight hover:text-primary-300 transition-colors mb-4 drop-shadow-md">
                            {article.title}
                          </h2>
                        </Link>
                        <p className="text-surface-200 text-sm md:text-base line-clamp-2 w-4/5 font-medium drop-shadow-sm">{article.excerpt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[450px] flex flex-col justify-center p-8 bg-surface-50">
                  <span className="text-[11px] font-black uppercase tracking-widest text-primary-700 mb-3">Belum ada artikel terbit</span>
                  <h3 className="text-3xl font-serif font-black text-surface-900 mb-3">Konten redaksi akan tampil di sini.</h3>
                  <p className="text-surface-600 max-w-lg">Masuk ke dashboard untuk membuat artikel pertama, mengunggah gambar andalan, lalu terbitkan agar muncul di beranda.</p>
                </div>
              )}
            </div>
            
            {/* Side Headlines (List) */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-white border-t-4 border-t-primary-800 border-x border-b border-surface-200 p-6 h-full flex flex-col shadow-sm">
                <h3 className="text-[11px] font-black text-surface-900 uppercase tracking-[0.15em] mb-5 pb-3 border-b border-surface-200 flex items-center gap-2">
                  <TrendingUp size={14} className="text-primary-700"/> Fokus Hari Ini
                </h3>
                <div className="flex flex-col flex-1">
                  {sideHeadlines.length > 0 ? sideHeadlines.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="side" />
                  )) : (
                    <p className="text-sm text-surface-500 leading-relaxed">Sorotan akan otomatis terisi setelah ada beberapa artikel terbit.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Middle Grid Section (News Gallery) */}
        <section className="mb-12">
          <div className="news-divider-brand mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridNews.map((a) => (
              <ArticleCard key={a.id} article={a} variant="default" />
            ))}
          </div>
        </section>

        {/* Main Content + Sidebar (Terkini & Terpopuler) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content - Latest News List */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6 border-b-2 border-surface-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-breaking"></div>
                <h2 className="text-2xl font-sans font-black text-surface-900 uppercase tracking-tight">Berita Terkini</h2>
              </div>
              <Link to="/terkini" className="text-xs font-bold text-primary-700 hover:text-primary-900 transition-colors uppercase tracking-widest flex items-center gap-1 group">
                Indeks Berita <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="flex flex-col">
              {moreLatest.length > 0 ? moreLatest.map((a) => (
                <ArticleCard key={a.id} article={a} variant="list" />
              )) : (
                <div className="py-10 text-sm font-semibold text-surface-500">Belum ada berita terkini.</div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Terpopuler Widget */}
            <div className="bg-white border border-surface-200 shadow-sm relative">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-800 to-primary-500"></div>
              <div className="px-6 py-5 border-b border-surface-200 bg-surface-50 ">
                <h3 className="text-[12px] font-black text-surface-900 uppercase tracking-[0.15em]">
                  Berita Terpopuler
                </h3>
              </div>
              <div className="divide-y divide-surface-100 ">
                {trending.length > 0 ? trending.map((a, i) => (
                  <Link key={a.id} to={`/article/${a.slug}`} className="flex items-start gap-4 px-6 py-4 group hover:bg-surface-50 transition-colors">
                    <span className={`text-4xl font-serif font-black italic shrink-0 w-8 text-center leading-none mt-1 ${i === 0 ? "text-primary-700 drop-shadow-sm" : "text-surface-300 "}`}>
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-[14px] font-bold text-surface-900 group-hover:text-primary-700 transition-colors line-clamp-2 leading-snug">
                        {a.title}
                      </h4>
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-2 block">
                        {a.views} dibaca
                      </span>
                    </div>
                  </Link>
                )) : (
                  <div className="px-6 py-8 text-sm text-surface-500 font-semibold">Data populer akan muncul setelah artikel mulai dibaca.</div>
                )}
              </div>
            </div>

            {editorPicks.length > 0 && (
              <div className="bg-white border-t-4 border-t-primary-800 border-x border-b border-surface-200 shadow-sm">
                <div className="px-6 py-5 border-b border-surface-200 bg-surface-50">
                  <h3 className="text-[12px] font-black text-surface-900 uppercase tracking-[0.15em]">Pilihan Redaksi</h3>
                </div>
                <div className="divide-y divide-surface-100">
                  {editorPicks.map((article) => (
                    <Link key={article.id} to={`/article/${article.slug}`} className="block px-6 py-4 hover:bg-surface-50 transition-colors group">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary-700">{article.category_name || "Berita"}</span>
                      <h4 className="mt-1 text-[15px] font-bold text-surface-900 group-hover:text-primary-700 transition-colors line-clamp-2 leading-snug">{article.title}</h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Widget */}
            <div className="bg-white border border-surface-200 shadow-sm">
              <div className="px-6 py-5 border-b border-surface-200 bg-surface-50 ">
                <h3 className="text-[12px] font-black text-surface-900 uppercase tracking-[0.15em]">Eksplorasi Topik</h3>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((cat) => (
                    <Link key={cat.slug} to={`/kategori/${cat.slug}`}
                      className="px-3 py-1.5 border border-surface-200 bg-white text-xs font-bold text-surface-700 hover:border-primary-500 hover:text-primary-700 transition-colors shadow-sm"
                      style={{ borderLeftWidth: '4px', borderLeftColor: cat.color || 'var(--color-primary-600)' }}>
                      {cat.name} <span className="text-surface-400 font-medium ml-1">({cat.article_count || 0})</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Contact Widget */}
            <div className="bg-primary-800 text-white p-6 shadow-md relative overflow-hidden">
              <h3 className="font-black uppercase tracking-[0.15em] mb-3 text-[13px] relative z-10">
                Info Redaksi
              </h3>
              <p className="text-primary-100 text-[13px] mb-6 leading-relaxed font-medium relative z-10">Punya informasi, opini, atau ingin mengirimkan liputan? Hubungi tim redaksi kami sekarang.</p>
              <a href="mailto:redaksi@kbb-sadunia.com" className="block text-center py-3.5 bg-white text-primary-900 hover:bg-primary-50 transition-colors font-black tracking-widest uppercase text-[11px] shadow-sm relative z-10">
                redaksi@kbb-sadunia.com
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
