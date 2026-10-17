import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import ArticleCard from "../components/ArticleCard";
import { apiGetArticleBySlug, apiCreateComment, apiGetArticleComments, apiGetRelatedArticles, apiReactToArticle, apiSubmitCorrection } from "../services/api";
import { Helmet } from "react-helmet-async";
import { ChevronRight, PenLine, Sparkles, Tag, Clock3 } from "lucide-react";
import { getImageUrl } from "../utils/image";
import { isOpinionArticle } from "../utils/articleType";
import { setSingleDocumentTitle } from "../utils/pageTitle";
import {
  buildArticleBrief,
  buildTopicChips,
  formatArticleDate,
  getYouTubeId,
  readSavedArticles,
  stripArticleText,
  writeSavedArticles,
} from "../utils/articleDisplay";
import TrendingTopicsBar from "../components/TrendingTopicsBar";
import OptimizedImage from "../components/OptimizedImage";
import ArticleActionToolbar from "../components/article/ArticleActionToolbar";
import ArticleReactionBar from "../components/article/ArticleReactionBar";
import ArticleCommentsSection from "../components/article/ArticleCommentsSection";
import ArticleCorrectionForm from "../components/article/ArticleCorrectionForm";
import ArticleSidebar from "../components/article/ArticleSidebar";

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [bookmarked, setBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Default to a comfortable reading size
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ name: "", text: "" });
  const [correction, setCorrection] = useState({ name: "", email: "", message: "" });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingCorrection, setSubmittingCorrection] = useState(false);
  const [commentMsg, setCommentMsg] = useState({ type: "", text: "" });
  const [correctionMsg, setCorrectionMsg] = useState({ type: "", text: "" });

  const [relatedNews, setRelatedNews] = useState([]);
  const [reactions, setReactions] = useState({ like: false, love: false });
  const [reactionCounts, setReactionCounts] = useState({});
  const [readingProgress, setReadingProgress] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGetArticleBySlug(slug);
        setArticle(res.data);
        
        // Fetch related articles
        if (res.data?.id) {
          try {
            const relRes = await apiGetRelatedArticles(res.data.id);
            setRelatedNews(relRes.data || []);
          } catch { setRelatedNews([]); }
        }
        window.scrollTo(0, 0);
      } catch {
        setError("Artikel tidak ditemukan");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    const syncBookmark = window.setTimeout(() => {
      setBookmarked(readSavedArticles().some((item) => item.slug === slug));
    }, 0);
    return () => window.clearTimeout(syncBookmark);
  }, [slug]);

  useEffect(() => {
    if (!article?.id) return;
    let ignore = false;
    apiGetArticleComments(article.id)
      .then((res) => {
        if (!ignore) setComments(res.data || []);
      })
      .catch(() => {
        if (!ignore) setComments([]);
      });
    return () => {
      ignore = true;
    };
  }, [article?.id]);

  useEffect(() => {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setReadingProgress(Math.max(0, Math.min(100, progress)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [slug]);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [slug]);

  useEffect(() => {
    if (article?.title) {
      setSingleDocumentTitle(`${article.title} - KBB Sadunia`);
    }
  }, [article?.title]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 ">
        <div className="w-12 h-12 border-[5px] border-surface-200 border-t-primary-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
        <div className="text-center max-w-md w-full bg-white p-10 shadow-sm border border-surface-200 ">
          <h2 className="text-7xl font-serif font-black text-primary-800 mb-4">404</h2>
          <h3 className="text-xl font-bold text-surface-900 mb-2">Halaman Tidak Ditemukan</h3>
          <p className="text-surface-600 mb-8 font-medium">{error || "Artikel yang Anda cari tidak ada atau telah dihapus oleh redaksi."}</p>
          <Link to="/" className="inline-block px-6 py-3.5 bg-primary-800 text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary-900 transition-colors shadow-sm">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (newComment.name.trim() && newComment.text.trim()) {
      setSubmittingComment(true);
      setCommentMsg({ type: "", text: "" });
      try {
        // Simple client-side sanitize just in case, before sending. Backend should also sanitize.
        const cleanName = DOMPurify.sanitize(newComment.name);
        const cleanText = DOMPurify.sanitize(newComment.text);
        
        await apiCreateComment(article.id, cleanName, "", cleanText);
        setComments(prev => [{ id: Date.now(), author_name: cleanName, content: cleanText, created_at: new Date().toISOString(), pending: true }, ...prev]);
        setNewComment({ name: "", text: "" });
        setCommentMsg({ type: "success", text: "Komentar berhasil dikirim dan menunggu moderasi redaksi." });
      } catch (err) {
        setCommentMsg({ type: "error", text: "Gagal mengirim komentar: " + err.message });
      } finally {
        setSubmittingComment(false);
      }
    }
  };

  const handleCommentFieldChange = (field, value) => {
    setNewComment((prev) => ({ ...prev, [field]: value }));
    setCommentMsg({ type: "", text: "" });
  };

  const handleBookmark = () => {
    const saved = readSavedArticles();

    if (bookmarked) {
      writeSavedArticles(saved.filter((item) => item.slug !== article.slug));
      setBookmarked(false);
      return;
    }

    const nextSaved = [
      {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        image_url: article.image_url,
        category_name: article.category_name,
        published_at: article.published_at,
        saved_at: new Date().toISOString()
      },
      ...saved.filter((item) => item.slug !== article.slug)
    ].slice(0, 40);

    writeSavedArticles(nextSaved);
    setBookmarked(true);
  };

  const handleListenArticle = () => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      window.alert("Fitur dengarkan artikel belum didukung di browser ini.");
      return;
    }

    window.speechSynthesis.cancel();

    if (speaking) {
      setSpeaking(false);
      return;
    }

    const text = [
      article.title,
      stripArticleText(article.excerpt || article.content || "")
    ].filter(Boolean).join(". ").slice(0, 3500);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const handleSubmitCorrection = async (event) => {
    event.preventDefault();
    if (!correction.message.trim()) return;
    setSubmittingCorrection(true);
    setCorrectionMsg({ type: "", text: "" });
    try {
      await apiSubmitCorrection({
        article_title: article.title,
        article_url: window.location.href,
        name: correction.name,
        email: correction.email,
        message: correction.message,
      });
      setCorrection({ name: "", email: "", message: "" });
      setCorrectionMsg({ type: "success", text: "Laporan koreksi sudah dikirim ke redaksi." });
    } catch (err) {
      setCorrectionMsg({ type: "error", text: err.message || "Gagal mengirim laporan koreksi." });
    } finally {
      setSubmittingCorrection(false);
    }
  };

  const handleCorrectionFieldChange = (field, value) => {
    setCorrection((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleReaction = async (type) => {
    try {
      await apiReactToArticle(article.id, type);
      setReactions((prev) => ({ ...prev, [type]: !prev[type] }));
      setReactionCounts((prev) => ({
        ...prev,
        [type]: (prev[type] || 0) + (reactions[type] ? -1 : 1),
      }));
    } catch {
      // Reaction failures should not interrupt reading.
    }
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(article.title);

  // Safely sanitize content
  const sanitizedContent = DOMPurify.sanitize(article.content, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'section', 'div', 'figure', 'figcaption', 'img', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class', 'rel', 'loading', 'decoding', 'width', 'height']
  });

  const videoId = getYouTubeId(article.video_url);
  const opinion = isOpinionArticle(article);
  const brief = buildArticleBrief(article, opinion);
  const topicChips = buildTopicChips(article, opinion);
  const normalizedImageUrl = article.image_url ? getImageUrl(article.image_url) : "";
  const structuredImageUrl = normalizedImageUrl
    ? (normalizedImageUrl.startsWith("http") ? normalizedImageUrl : `${window.location.origin}${normalizedImageUrl}`)
    : `${window.location.origin}/logo-kbb.png`;
  const articleTags = (article.tags || []).map((tag) => ({
    name: typeof tag === "string" ? tag : tag.name,
    slug: typeof tag === "string" ? tag.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") : tag.slug,
  })).filter((tag) => tag.name && tag.slug);

  return (
    <div className="min-h-screen bg-white transition-colors duration-200">
      <div className="fixed top-0 left-0 h-1 bg-primary-600 z-[60] transition-[width] duration-150" style={{ width: `${readingProgress}%` }} aria-hidden="true" />
      <Helmet>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        {article.image_url && <meta property="og:image" content={window.location.origin + getImageUrl(article.image_url)} />}
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": opinion ? "OpinionNewsArticle" : "NewsArticle",
            "headline": article.title,
            "image": [structuredImageUrl],
            "datePublished": article.published_at,
            "author": [{
              "@type": "Person",
              "name": article.author_name || "Redaksi"
            }]
          })}
        </script>
      </Helmet>
      <TrendingTopicsBar compact />
      
      {/* Top Banner Ad space placeholder */}
      <div className="w-full bg-surface-50 py-6 hidden md:block border-b border-surface-200 ">
        <div className="max-w-[728px] mx-auto h-[90px] bg-surface-200 flex items-center justify-center text-surface-400 text-xs font-black uppercase tracking-widest border border-surface-300 ">
          - Ruang Iklan -
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <article className="lg:col-span-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-surface-400 mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-primary-700 transition-colors">Beranda</Link>
              <ChevronRight size={12} />
              <Link to={opinion ? "/tentang/opini" : `/kategori/${article.category_slug}`} className="text-primary-700 hover:text-primary-900 transition-colors">{opinion ? "Opini" : article.category_name}</Link>
            </nav>

            {opinion && (
              <div className="mb-5 border-l-4 border-amber-900 bg-amber-50 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-2 bg-amber-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                    <PenLine size={12} /> OPINI
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-900">
                    Pandangan Penulis
                  </span>
                </div>
                <p className="text-sm text-amber-950 font-semibold leading-relaxed">
                  Tulisan ini adalah opini atau kajian penulis. Isinya memuat analisis dan pandangan pribadi penulis, sehingga dibedakan dari berita redaksi.
                </p>
              </div>
            )}

            <h1 className="text-3xl md:text-[2.5rem] lg:text-[2.75rem] font-serif font-black text-surface-900 leading-[1.2] mb-6 tracking-tight drop-shadow-sm">
              {article.title}
            </h1>

            {/* Author info & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-y-4 text-sm mb-6 pb-6 border-b-[3px] border-surface-900 ">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-800 text-white flex items-center justify-center font-sans font-black text-xl shadow-sm" aria-hidden="true">
                  {(article.author_name || "R").charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-surface-900 uppercase tracking-widest text-[11px] mb-1">{article.author_name || "Tim Redaksi"}</span>
                  <time dateTime={article.published_at} className="text-[13px] text-surface-500 font-semibold">{formatArticleDate(article.published_at)}</time>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-surface-400 bg-surface-50 px-3 py-1.5 rounded-sm border border-surface-200 ">
                <Clock3 size={13} />
                <span>{article.views || 0} Pembaca</span>
              </div>
            </div>

            <section className="mb-8 grid sm:grid-cols-3 gap-3">
              <div className="border border-surface-200 bg-surface-50 px-4 py-3">
                <span className="block text-[10px] font-black uppercase tracking-widest text-surface-500 mb-1">Sumber</span>
                {article.source_url ? (
                  <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary-800 hover:text-primary-950">
                    {article.source_name || "Tautan sumber"}
                  </a>
                ) : (
                  <span className="text-sm font-bold text-surface-800">{article.source_name || "Redaksi KBB Sadunia"}</span>
                )}
              </div>
              <div className="border border-surface-200 bg-surface-50 px-4 py-3">
                <span className="block text-[10px] font-black uppercase tracking-widest text-surface-500 mb-1">Diperbarui</span>
                <span className="text-sm font-bold text-surface-800">{formatArticleDate(article.updated_at || article.published_at)}</span>
              </div>
              <div className="border border-surface-200 bg-surface-50 px-4 py-3">
                <span className="block text-[10px] font-black uppercase tracking-widest text-surface-500 mb-1">Jenis</span>
                <span className="text-sm font-bold text-surface-800">{opinion ? "Opini penulis" : "Berita redaksi"}</span>
              </div>
            </section>

            <section className="mb-8 border border-primary-100 bg-primary-50/40 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-primary-700" />
                <h2 className="text-[12px] font-black uppercase tracking-[0.18em] text-primary-900">Ringkasan Cepat</h2>
              </div>
              <p className="text-surface-800 text-base leading-relaxed font-semibold mb-4">{brief.summary}</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {brief.points.map((point) => (
                  <div key={point} className="bg-white border border-primary-100 px-3 py-2 text-[12px] font-bold text-surface-700 leading-snug">
                    {point}
                  </div>
                ))}
              </div>
            </section>

            {/* Main Image */}
            {article.image_url && (
              <figure className="mb-8">
                <div className="relative border border-surface-200 p-1 bg-surface-50 shadow-sm animate-fade-in overflow-hidden">
                  <OptimizedImage src={article.image_url} alt={article.title} className="w-full h-auto object-cover max-h-[500px] transition-opacity duration-500 hover:scale-[1.02] transform" sizes="(min-width: 1024px) 760px, 100vw" />
                </div>
                <figcaption className="mt-3 text-[11px] font-semibold text-surface-500 border-l-[3px] border-primary-600 pl-3 py-0.5 leading-snug">
                  {article.image_caption || (opinion ? "Ilustrasi foto untuk artikel opini. Keterangan rinci belum dicantumkan redaksi." : "Foto artikel. Keterangan rinci belum dicantumkan redaksi.")}
                  {article.image_credit ? <span className="block mt-1 text-surface-400">Foto: {article.image_credit}</span> : null}
                </figcaption>
              </figure>
            )}

            <ArticleActionToolbar
              bookmarked={bookmarked}
              onBookmark={handleBookmark}
              onDecreaseFont={() => setFontSize((value) => Math.max(15, value - 2))}
              onIncreaseFont={() => setFontSize((value) => Math.min(24, value + 2))}
              onListen={handleListenArticle}
              shareText={shareText}
              shareUrl={shareUrl}
              speaking={speaking}
            />

            {/* Video YouTube Embed */}
            {videoId && (
              <div className="mb-8 border-[4px] border-surface-100 p-1 bg-surface-50 ">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="Video Embed"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Content Body */}
            {opinion && (
              <div className="mb-6 bg-white border border-amber-200 p-4 text-sm text-surface-700 leading-relaxed">
                <strong className="text-amber-900 uppercase tracking-widest text-[11px] block mb-1">Catatan redaksi</strong>
                Artikel ini berada di kolom opini. Pendapat, analisis, dan penekanan dalam tulisan merupakan pandangan penulis.
              </div>
            )}
            <div className="prose-article animate-fade-in" style={{ fontSize: `${fontSize}px` }} dangerouslySetInnerHTML={{ __html: sanitizedContent }} />

            {relatedNews.length > 0 && (
              <section className="mt-10 border-y-4 border-surface-900 py-6">
                <h2 className="text-[12px] font-black uppercase tracking-[0.18em] text-surface-900 mb-4">Baca Juga</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedNews.slice(0, 4).map((item) => (
                    <ArticleCard key={item.id} article={item} variant="side" />
                  ))}
                </div>
              </section>
            )}

            {articleTags.length > 0 && (
              <section className="mt-10 pt-6 border-t border-surface-200">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={17} className="text-primary-700" />
                  <h3 className="text-[12px] font-black uppercase tracking-[0.18em] text-surface-900">Tag Artikel</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {articleTags.map((tag) => (
                    <Link key={tag.slug} to={`/tag/${tag.slug}`} className="px-3 py-1.5 border border-surface-200 bg-surface-50 text-xs font-bold text-surface-700 hover:border-primary-500 hover:text-primary-700 transition-colors">
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {topicChips.length > 0 && (
              <section className="mt-10 pt-6 border-t border-surface-200">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={17} className="text-primary-700" />
                  <h3 className="text-[12px] font-black uppercase tracking-[0.18em] text-surface-900">Topik Terkait</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topicChips.map((topic) => (
                    <Link key={topic} to={`/search?q=${encodeURIComponent(topic)}`} className="px-3 py-1.5 border border-surface-200 bg-white text-xs font-bold text-surface-700 hover:border-primary-500 hover:text-primary-700 transition-colors">
                      {topic}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <ArticleReactionBar
              opinion={opinion}
              reactionCounts={reactionCounts}
              reactions={reactions}
              onToggle={handleToggleReaction}
            />

            <ArticleCommentsSection
              comments={comments}
              commentMsg={commentMsg}
              formatDate={formatArticleDate}
              newComment={newComment}
              onChangeComment={handleCommentFieldChange}
              onSubmitComment={handleSubmitComment}
              submittingComment={submittingComment}
            />

            <ArticleCorrectionForm
              correction={correction}
              correctionMsg={correctionMsg}
              onChange={handleCorrectionFieldChange}
              onSubmit={handleSubmitCorrection}
              submitting={submittingCorrection}
            />
          </article>

          <ArticleSidebar opinion={opinion} relatedNews={relatedNews} />
          
        </div>
      </div>
    </div>
  );
}
