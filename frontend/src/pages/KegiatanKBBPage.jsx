import { useEffect, useState } from "react";
import { apiGetArticles } from "../services/api";
import OptimizedImage from "../components/OptimizedImage";

const galleryCategorySlugs = new Set([
  "kegiatan-sosial",
  "pelantikan-kbb",
  "budaya-banjar",
]);

function shortCaption(title = "") {
  if (title.length <= 86) return title;
  return `${title.slice(0, 83).trim()}...`;
}

export default function KegiatanKBBPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetArticles("?per_page=80")
      .then((res) => {
        const items = (res.data || [])
          .filter((article) => galleryCategorySlugs.has(article.category_slug))
          .filter((article) => article.image_url)
          .slice(0, 18);
        setPhotos(items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />

        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-black text-primary-700 uppercase tracking-[0.18em] mb-2">Galeri KBB Sadunia</p>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-surface-900 leading-tight mb-3">
            Kegiatan dan Gelaran KBB Sadunia
          </h1>
          <p className="text-surface-600 leading-relaxed">
            Dokumentasi singkat kegiatan, silaturahmi, pelantikan, dan gelaran Bubuhan Banjar. Halaman ini dibuat sebagai galeri foto ringkas, sementara berita lengkap tetap berada di kategori sesuai konteksnya.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="aspect-[4/3] bg-surface-100 animate-pulse border border-surface-200" />
            ))}
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {photos.map((photo) => (
              <figure key={photo.id} className="group bg-white border border-surface-200 shadow-sm overflow-hidden">
                <a href={`/article/${photo.slug}`} className="block aspect-[4/3] overflow-hidden bg-surface-100">
                  <OptimizedImage
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </a>
                <figcaption className="p-3 border-t border-surface-200">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-primary-700 mb-1">
                    {photo.category_name}
                  </span>
                  <p className="text-sm font-bold text-surface-800 leading-snug">
                    {shortCaption(photo.title)}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="empty-state-premium animate-fade-in mt-8">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
            <h3>Belum ada publikasi kegiatan</h3>
            <p>Halaman ini akan diperbarui dengan foto-foto kegiatan KBB Sadunia setelah dokumentasi tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
