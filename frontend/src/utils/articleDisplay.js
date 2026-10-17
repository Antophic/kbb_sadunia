import DOMPurify from "dompurify";

const SAVED_ARTICLES_KEY = "kbb_saved_articles";
const TOPIC_STOP_WORDS = new Set([
  "yang", "dan", "atau", "dari", "dalam", "untuk", "dengan", "pada", "oleh", "ini", "itu",
  "ke", "di", "se", "sa", "para", "akan", "jadi", "gelar", "warga",
]);

export function formatArticleDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
  return match ? match[1] : null;
}

export function stripArticleText(value = "") {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, " ")
    .trim();
}

export function clipSentence(text, maxLength = 260) {
  if (!text || text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 120 ? lastSpace : maxLength).trim()}...`;
}

export function buildArticleBrief(article, opinion) {
  const plainText = stripArticleText(article.excerpt || article.content || "");
  const sentences = plainText.split(/(?<=[.!?])\s+/).filter(Boolean);
  const summary = clipSentence(sentences.slice(0, 2).join(" ") || plainText || article.title);
  const category = opinion ? "Opini" : (article.category_name || "Berita");

  return {
    summary,
    points: [
      `Jenis tulisan: ${category}`,
      `Fokus utama: ${clipSentence(article.title, 120)}`,
      `Cocok dibaca untuk memahami konteks ${opinion ? "pandangan penulis" : "kabar KBB Sadunia"} secara cepat.`,
    ],
  };
}

export function buildTopicChips(article, opinion) {
  const baseTopics = [
    article.category_name,
    opinion ? "Opini" : "Berita Banjar",
    "KBB Sadunia",
  ];

  const tagTopics = (article.tags || [])
    .map((tag) => (typeof tag === "string" ? tag : tag.name))
    .filter(Boolean);

  const titleTopics = stripArticleText(article.title)
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word.length > 4 && !TOPIC_STOP_WORDS.has(word.toLowerCase()))
    .slice(0, 5);

  return [...new Set([...baseTopics, ...tagTopics, ...titleTopics].filter(Boolean))].slice(0, 10);
}

export function readSavedArticles() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_ARTICLES_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function writeSavedArticles(items) {
  try {
    localStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(items));
  } catch {
    // Browser storage can be unavailable in private mode.
  }
}
