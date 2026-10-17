import { Image } from "lucide-react";
import ArticleCard from "../ArticleCard";

export default function ArticleSidebar({ opinion, relatedNews }) {
  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-28 space-y-8">
        <div className="w-full h-[300px] bg-surface-50 border border-surface-200 flex flex-col items-center justify-center text-surface-400 text-xs font-black uppercase tracking-widest p-4 text-center">
          <span className="mb-3 text-[10px] border border-surface-300 px-3 py-1 bg-white">
            Advertisement
          </span>
          Space Iklan
        </div>

        <div className="bg-white border-t-4 border-t-primary-800 border-x border-b border-surface-200 shadow-sm">
          <div className="px-6 py-5 border-b border-surface-200 bg-surface-50 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-primary-700" />
            <h3 className="text-[11px] font-black text-surface-900 uppercase tracking-widest">
              {opinion ? "Tulisan Terkait" : "Berita Terkait"}
            </h3>
          </div>

          <div className="flex flex-col">
            {relatedNews.length > 0 ? (
              relatedNews.map((article) => (
                <div key={article.id} className="px-5">
                  <ArticleCard article={article} variant="side" />
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-surface-50">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-surface-200 text-surface-500 rounded-full mb-3">
                  <Image size={20} />
                </div>
                <p className="text-surface-600 font-semibold text-sm block">
                  Belum ada berita terkait.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
