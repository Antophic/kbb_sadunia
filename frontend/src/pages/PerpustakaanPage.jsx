import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { BookOpen, Download, FileText, Filter, Search, Tag, User } from "lucide-react";
import OptimizedImage from "../components/OptimizedImage";
import { apiGetBooks } from "../services/api";

function fileHref(fileUrl) {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return fileUrl;
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function BookCard({ book }) {
  const href = fileHref(book.file_url);

  return (
    <article className="group grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-surface-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[3/4] bg-surface-100">
        {book.cover_url ? (
          <OptimizedImage
            src={book.cover_url}
            alt={`Cover ${book.title}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-primary-50 text-primary-800">
            <BookOpen className="h-14 w-14" aria-hidden="true" />
            <span className="px-4 text-center text-xs font-black uppercase tracking-widest">Tanpa Cover</span>
          </div>
        )}
        {book.category && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-primary-700 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            <Tag className="h-3 w-3" aria-hidden="true" />
            {book.category}
          </span>
        )}
      </div>

      <div className="flex flex-col p-4">
        <h2 className="line-clamp-2 text-base font-black leading-snug text-surface-950 group-hover:text-primary-800">
          {book.title}
        </h2>
        {book.author && (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-surface-500">
            <User className="h-4 w-4" aria-hidden="true" />
            {book.author}
          </p>
        )}
        {book.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-surface-600">
            {book.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-surface-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-500">
            <FileText className="h-4 w-4" aria-hidden="true" />
            {formatFileSize(book.file_size) || "PDF"}
          </span>
          {href && (
            <div className="flex gap-2">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-primary-700 px-3 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-primary-800"
              >
                Baca
              </a>
              <a
                href={href}
                download
                className="inline-flex items-center rounded border border-primary-200 px-3 py-2 text-primary-700 hover:bg-primary-50"
                aria-label={`Unduh ${book.title}`}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function PerpustakaanPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const params = useMemo(() => {
    const query = new URLSearchParams();
    if (filter !== "all") query.set("category", filter);
    if (search) query.set("search", search);
    const value = query.toString();
    return value ? `?${value}` : "";
  }, [filter, search]);

  useEffect(() => {
    let active = true;

    apiGetBooks(params)
      .then((res) => {
        if (!active) return;
        setBooks(res.data || []);
        setCategories(res.categories || []);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setBooks([]);
        setError(err.message || "Perpustakaan belum bisa dimuat.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params]);

  const handleSearch = (event) => {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    if (nextSearch !== search) {
      setLoading(true);
      setSearch(nextSearch);
    }
  };

  const handleFilter = (category) => {
    if (category !== filter) {
      setLoading(true);
      setFilter(category);
    }
  };

  return (
    <>
      <Helmet>
        <title>Perpustakaan Digital - KBB Sadunia</title>
        <meta
          name="description"
          content="Perpustakaan digital KBB Sadunia berisi buku PDF, dokumen budaya, sejarah, dan bahan bacaan tentang Bubuhan Banjar."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Perpustakaan Digital KBB Sadunia",
            description: "Koleksi buku digital dan dokumen bacaan KBB Sadunia.",
          })}
        </script>
      </Helmet>

      <main className="mx-auto max-w-7xl px-4 py-8 md:py-10">
        <header className="mb-7 border-b-4 border-surface-900 pb-5">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-primary-700">Koleksi Digital</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black leading-tight text-surface-950 md:text-4xl">Perpustakaan Digital</h1>
              <p className="mt-2 max-w-3xl text-base leading-relaxed text-surface-600">
                Tempat menyimpan dan membaca buku digital, dokumen budaya, sejarah, dan arsip pengetahuan Bubuhan Banjar.
              </p>
            </div>
            <div className="text-sm font-bold text-surface-500">
              {books.length} koleksi ditampilkan
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-3 lg:grid-cols-[1fr_auto]" aria-label="Pencarian dan filter buku">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" aria-hidden="true" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari judul, penulis, atau deskripsi buku..."
              className="w-full rounded border border-surface-300 bg-white py-3 pl-10 pr-24 text-sm font-semibold outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            />
            <button type="submit" className="absolute right-1.5 top-1.5 rounded bg-primary-700 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-primary-800">
              Cari
            </button>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => handleFilter("all")}
              className={`inline-flex items-center gap-1.5 rounded border px-4 py-2.5 text-sm font-black ${filter === "all" ? "border-primary-700 bg-primary-700 text-white" : "border-surface-300 bg-white text-surface-700 hover:border-primary-500"}`}
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              Semua
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleFilter(category)}
                className={`rounded border px-4 py-2.5 text-sm font-black whitespace-nowrap ${filter === category ? "border-primary-700 bg-primary-700 text-white" : "border-surface-300 bg-white text-surface-700 hover:border-primary-500"}`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="h-11 w-11 animate-spin rounded-full border-4 border-surface-200 border-t-primary-700" aria-label="Memuat perpustakaan" />
          </div>
        ) : error ? (
          <div className="rounded border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>
        ) : books.length === 0 ? (
          <div className="rounded-lg border border-dashed border-surface-300 bg-surface-50 px-6 py-14 text-center">
            <BookOpen className="mx-auto mb-4 h-14 w-14 text-surface-300" aria-hidden="true" />
            <h2 className="text-xl font-black text-surface-900">Belum ada buku yang cocok</h2>
            <p className="mt-2 text-sm text-surface-500">
              Coba kata kunci lain atau tambahkan buku baru melalui dashboard admin.
            </p>
          </div>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Daftar buku digital">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </section>
        )}
      </main>
    </>
  );
}
