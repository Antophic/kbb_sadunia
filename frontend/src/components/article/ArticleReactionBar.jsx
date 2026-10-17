import { Heart, Info, SmilePlus, ThumbsUp } from "lucide-react";

const REACTIONS = [
  { type: "like", label: "Informatif", Icon: ThumbsUp },
  { type: "love", label: "Suka", Icon: Heart },
  { type: "wow", label: "Mengejutkan", Icon: SmilePlus },
  { type: "sad", label: "Memprihatinkan", Icon: Info },
];

export default function ArticleReactionBar({ opinion, reactionCounts, reactions, onToggle }) {
  return (
    <div className="mt-12 pt-8 border-t-2 border-surface-200">
      <p className="text-[11px] font-black text-surface-500 uppercase tracking-widest mb-4">
        Bagaimana reaksi Anda tentang {opinion ? "opini" : "berita"} ini?
      </p>
      <div className="flex flex-wrap gap-3">
        {REACTIONS.map(({ type, label, Icon }) => {
          const active = Boolean(reactions[type]);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggle(type)}
              className={`flex items-center gap-2 px-5 py-2.5 border text-sm font-bold transition-all shadow-sm ${
                active
                  ? "bg-primary-50 border-primary-400 text-primary-800"
                  : "bg-white border-surface-300 text-surface-700 hover:border-primary-400 hover:bg-surface-50"
              }`}
              aria-pressed={active}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
              {reactionCounts[type] > 0 && (
                <span className="text-[10px] text-surface-400 ml-1 bg-surface-100 px-1.5 py-0.5 rounded-sm">
                  {reactionCounts[type]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
