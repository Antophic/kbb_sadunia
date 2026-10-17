import { Bookmark, BookmarkCheck, Link2, Share2, Square, Volume2 } from "lucide-react";

export default function ArticleActionToolbar({
  bookmarked,
  onBookmark,
  onDecreaseFont,
  onIncreaseFont,
  onListen,
  shareText,
  shareUrl,
  speaking,
}) {
  const copyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between mb-8 py-2.5 px-4 bg-surface-50 border-y border-surface-200">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-surface-500 mr-2 flex items-center gap-1">
          <Share2 size={12} /> Bagikan
        </span>
        <a
          href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
          aria-label="Share WhatsApp"
        >
          <span className="text-[10px] font-black" aria-hidden="true">WA</span>
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 bg-[#1877f2] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
          aria-label="Share Facebook"
        >
          <span className="text-sm font-black" aria-hidden="true">f</span>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
          aria-label="Share X/Twitter"
        >
          <span className="text-xs font-black" aria-hidden="true">X</span>
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="w-8 h-8 bg-surface-300 text-surface-700 flex items-center justify-center hover:bg-surface-400 transition-colors shadow-sm"
          aria-label="Salin tautan"
        >
          <Link2 size={16} />
        </button>
      </div>

      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={onListen}
          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${speaking ? "text-red-700" : "text-surface-500 hover:text-primary-800"}`}
          aria-label={speaking ? "Berhenti dengarkan artikel" : "Dengarkan artikel"}
        >
          {speaking ? <Square size={15} /> : <Volume2 size={16} />}
          {speaking ? "Berhenti" : "Dengarkan"}
        </button>

        <div className="flex items-center gap-1 border-r border-surface-300 pr-5">
          <span className="text-[10px] font-black text-surface-400 mr-2 uppercase tracking-widest">Teks</span>
          <button type="button" onClick={onDecreaseFont} className="w-7 h-7 flex items-center justify-center border border-surface-300 hover:bg-surface-200 text-surface-700 text-xs font-black transition-colors" aria-label="Perkecil huruf">
            A-
          </button>
          <button type="button" onClick={onIncreaseFont} className="w-7 h-7 flex items-center justify-center border border-surface-300 hover:bg-surface-200 text-surface-700 text-sm font-black transition-colors" aria-label="Perbesar huruf">
            A+
          </button>
        </div>

        <button
          type="button"
          onClick={onBookmark}
          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${bookmarked ? "text-primary-700" : "text-surface-500 hover:text-surface-900"}`}
          aria-label={bookmarked ? "Hapus dari tersimpan" : "Simpan artikel"}
        >
          {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          {bookmarked ? "Tersimpan" : "Simpan"}
        </button>
      </div>
    </div>
  );
}
