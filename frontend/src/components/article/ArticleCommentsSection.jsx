import { MessageSquare } from "lucide-react";

export default function ArticleCommentsSection({
  comments,
  commentMsg,
  formatDate,
  newComment,
  onChangeComment,
  onSubmitComment,
  submittingComment,
}) {
  return (
    <section className="mt-12 pt-8 border-t-[4px] border-surface-900" id="comments">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare size={24} className="text-primary-800" />
        <h3 className="text-2xl font-sans font-black text-surface-900 uppercase tracking-tight">
          Komentar Pembaca
        </h3>
      </div>

      {commentMsg.text && (
        <div className={`mb-6 p-4 border-l-[4px] text-sm font-semibold shadow-sm ${
          commentMsg.type === "success"
            ? "bg-primary-50 text-primary-800 border-primary-600"
            : "bg-red-50 text-red-800 border-red-600"
        }`}>
          {commentMsg.text}
        </div>
      )}

      <form onSubmit={onSubmitComment} className="bg-surface-50 border border-surface-200 p-6 mb-10 shadow-sm">
        <h4 className="text-[11px] font-black text-surface-900 uppercase tracking-widest mb-5 border-b border-surface-200 pb-2">
          Tinggalkan Komentar
        </h4>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={newComment.name}
            onChange={(event) => onChangeComment("name", event.target.value)}
            className="w-full px-4 py-3 bg-white border border-surface-300 text-sm font-medium focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            required
            disabled={submittingComment}
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Tulis pendapat Anda secara sopan dan bertanggung jawab..."
            value={newComment.text}
            onChange={(event) => onChangeComment("text", event.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-surface-300 text-sm font-medium focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 resize-y transition-all"
            required
            disabled={submittingComment}
          />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-surface-500 font-medium">
            Komentar akan dimoderasi sebelum ditayangkan.
          </p>
          <button
            type="submit"
            disabled={submittingComment}
            className="px-8 py-3 bg-primary-800 text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary-900 transition-colors disabled:opacity-50 shadow-sm"
          >
            {submittingComment ? "Mengirim..." : "Kirim Komentar"}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="empty-state-premium animate-fade-in">
            <div className="icon-container">
              <MessageSquare size={24} />
            </div>
            <h3>Belum ada komentar</h3>
            <p>Jadilah yang pertama memberikan pendapat!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 bg-white border border-surface-100 shadow-sm">
              <div className="w-10 h-10 shrink-0 bg-surface-200 flex items-center justify-center text-surface-600 font-sans font-black text-lg">
                {(comment.author_name || "P").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <span className="font-bold text-surface-900 text-[14px]">
                    {comment.author_name || "Pembaca"}
                  </span>
                  <span className="text-[10px] text-surface-400 font-bold uppercase tracking-widest">
                    {comment.pending ? "Menunggu moderasi" : formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-surface-700 leading-relaxed text-[14px] font-medium">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
