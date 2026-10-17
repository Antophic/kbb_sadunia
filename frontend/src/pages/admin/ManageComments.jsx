import { useEffect, useState } from "react";
import { apiGetAdminComments, apiUpdateCommentStatus, apiDeleteComment } from "../../services/api";
import { Helmet } from "react-helmet-async";
import { MessageSquare, CheckCircle2, Clock, Trash2, AlertCircle } from "lucide-react";

export default function ManageComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await apiGetAdminComments();
        if (!ignore) setComments(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const fetchComments = async () => {
    try {
      const res = await apiGetAdminComments();
      setComments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiUpdateCommentStatus(id, status);
      fetchComments();
    } catch (err) {
      alert("Gagal mengupdate status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus komentar ini?")) {
      try {
        await apiDeleteComment(id);
        fetchComments();
      } catch (err) {
        alert("Gagal menghapus komentar: " + err.message);
      }
    }
  };

  const pending = comments.filter(c => c.status === 'pending').length;
  const approved = comments.filter(c => c.status === 'approved').length;

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <Helmet><title>Moderasi Komentar - Admin</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-pink-100 /30 p-2 rounded-lg">
            <MessageSquare size={28} className="text-pink-600 " />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 ">Moderasi Komentar</h1>
            <p className="text-sm text-surface-500 mt-0.5">
              {pending > 0 && <span className="text-amber-600 font-semibold">{pending} menunggu persetujuan</span>}
              {pending > 0 && approved > 0 && ' · '}
              {approved > 0 && `${approved} disetujui`}
              {pending === 0 && approved === 0 && 'Tidak ada komentar'}
            </p>
          </div>
        </div>

        {/* Comment Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-48 text-surface-500 font-medium">Memuat komentar...</div>
        ) : comments.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-surface-300 p-16 text-center">
            <AlertCircle size={48} className="mx-auto text-surface-300 mb-4" />
            <p className="text-lg font-medium text-surface-900 ">Belum ada komentar</p>
            <p className="text-sm text-surface-500 mt-1">Komentar dari pembaca akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                c.status === 'pending' 
                  ? 'border-amber-200 /20 border-l-4 border-l-amber-400' 
                  : 'border-surface-200 border-l-4 border-l-green-400'
              }`}>
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Author Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-surface-200 flex items-center justify-center text-surface-600 font-bold text-sm uppercase shrink-0">
                          {(c.author_name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-surface-900 text-sm">{c.author_name}</p>
                          <p className="text-xs text-surface-400">{c.author_email || 'No email'} · {new Date(c.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>

                      {/* Comment Content */}
                      <p className="text-surface-700 text-sm leading-relaxed mb-3">{c.content}</p>

                      {/* Article Reference */}
                      <p className="text-xs text-surface-400 ">
                        Pada artikel: <span className="font-medium text-surface-600 ">{c.article_title}</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        c.status === 'approved' 
                          ? 'bg-green-100 text-green-700 /10 ' 
                          : 'bg-amber-100 text-amber-700 /10 '
                      }`}>
                        {c.status === 'approved' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {c.status === 'approved' ? 'Disetujui' : 'Pending'}
                      </span>
                      
                      {c.status === 'pending' ? (
                        <button onClick={() => handleUpdateStatus(c.id, 'approved')} 
                          className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 /10 /20 rounded-lg transition-colors">
                          Setujui
                        </button>
                      ) : (
                        <button onClick={() => handleUpdateStatus(c.id, 'pending')} 
                          className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 /10 /20 rounded-lg transition-colors">
                          Tunda
                        </button>
                      )}
                      <button onClick={() => handleDelete(c.id)} 
                        className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 /20 rounded-lg transition-colors" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
