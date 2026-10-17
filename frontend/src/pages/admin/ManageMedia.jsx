import { useEffect, useState } from "react";
import { apiGetMedia, apiDeleteMedia, apiUploadImage } from "../../services/api";
import { Helmet } from "react-helmet-async";
import { Copy, Trash2, Upload, Image as ImageIcon, Check } from "lucide-react";
import OptimizedImage from "../../components/OptimizedImage";

export default function ManageMedia() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const refreshMedia = async () => {
    try {
      const res = await apiGetMedia();
      setFiles(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadMedia = async () => {
      try {
        const res = await apiGetMedia();
        if (!ignore) setFiles(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadMedia();
    return () => { ignore = true; };
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await apiUploadImage(file);
      await refreshMedia();
    } catch (err) {
      alert("Gagal mengunggah media: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (filename) => {
    if (window.confirm("Yakin ingin menghapus file media ini?")) {
      try {
        await apiDeleteMedia(filename);
        await refreshMedia();
      } catch (err) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <Helmet><title>Pustaka Media - Admin</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 /30 p-2 rounded-lg">
              <ImageIcon size={28} className="text-purple-600 " />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 ">Pustaka Media</h1>
              <p className="text-sm text-surface-500 mt-0.5">{files.length} file tersimpan</p>
            </div>
          </div>
          <label className={`cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all ${uploading ? 'bg-surface-300 text-surface-500 cursor-wait' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/20'}`}>
            <Upload size={18} />
            {uploading ? "Mengunggah..." : "Unggah Gambar Baru"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64 text-surface-500 font-medium">Memuat pustaka media...</div>
        ) : files.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-surface-300 p-16 text-center">
            <ImageIcon size={64} className="mx-auto text-surface-300 mb-6" />
            <h2 className="text-xl font-bold text-surface-900 mb-2">Pustaka media kosong</h2>
            <p className="text-surface-500 max-w-sm mx-auto">Mulai unggah gambar pertama Anda dengan menekan tombol "Unggah Gambar Baru" di atas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {files.map((file) => (
              <div key={file.name} className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm group hover:shadow-md hover:border-primary-300 transition-all duration-300">
                <div className="aspect-square bg-surface-100 relative overflow-hidden">
                  <OptimizedImage src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" sizes="(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 50vw" />
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 gap-2">
                    <button onClick={() => copyToClipboard(file.url)} 
                      className="p-2.5 bg-white/90 backdrop-blur-sm text-surface-800 rounded-lg hover:bg-white transition-colors shadow-lg" title="Salin URL" aria-label={`Salin URL ${file.name}`}>
                      {copiedUrl === file.url ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                    <button onClick={() => handleDelete(file.name)} 
                      className="p-2.5 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-lg" title="Hapus" aria-label={`Hapus ${file.name}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-xs font-medium text-surface-800 truncate" title={file.name}>{file.name}</p>
                  <p className="text-[11px] text-surface-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
