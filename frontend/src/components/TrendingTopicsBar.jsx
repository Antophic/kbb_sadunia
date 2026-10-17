import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import { apiGetTags } from "../services/api";

const fallbackTopics = [
  "KBB Sadunia",
  "Paman Birin",
  "Pelantikan KBB",
  "Banjar Malaysia",
  "Budaya Banjar",
  "Halal Bihalal",
  "Diaspora Banjar",
];

export default function TrendingTopicsBar({ compact = false }) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    let ignore = false;
    apiGetTags()
      .then((res) => {
        if (!ignore) setTags(res.data || []);
      })
      .catch(() => {
        if (!ignore) setTags([]);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const topics = useMemo(() => {
    const tagTopics = tags
      .filter((tag) => Number(tag.article_count || 0) > 0)
      .slice(0, 8)
      .map((tag) => ({
        label: tag.name,
        href: `/tag/${tag.slug}`,
        count: Number(tag.article_count || 0),
      }));

    const seen = new Set(tagTopics.map((topic) => topic.label.toLowerCase()));
    const fallbacks = fallbackTopics
      .filter((topic) => !seen.has(topic.toLowerCase()))
      .slice(0, Math.max(0, 8 - tagTopics.length))
      .map((topic) => ({ label: topic, href: `/search?q=${encodeURIComponent(topic)}` }));

    return [...tagTopics, ...fallbacks];
  }, [tags]);

  if (topics.length === 0) return null;

  return (
    <section className={`border-y border-surface-200 bg-white ${compact ? "py-2" : "py-3"}`} aria-label="Topik hangat">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-breaking shrink-0">
          <Flame size={16} />
          <span className="text-[11px] font-black uppercase tracking-[0.18em]">Trending</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {topics.map((topic) => (
            <Link
              key={`${topic.href}-${topic.label}`}
              to={topic.href}
              className="shrink-0 px-3 py-1.5 border border-surface-200 text-xs font-bold text-surface-700 hover:border-primary-600 hover:text-primary-700 transition-colors bg-surface-50"
            >
              {topic.label}
              {topic.count ? <span className="ml-1 text-surface-400">({topic.count})</span> : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
