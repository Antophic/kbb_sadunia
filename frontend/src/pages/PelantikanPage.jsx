import { CalendarDays, ExternalLink, MapPin, ShieldCheck } from "lucide-react";
import { Helmet } from "react-helmet-async";
import OptimizedImage from "../components/OptimizedImage";

const sources = [
  {
    name: "Pemko Banjarmasin",
    title: "Pengukuhan dan Pelantikan Pengurus Pusat KBB Sedunia",
    url: "https://www.banjarmasinkota.go.id/2023/01/pengukuhan-dan-pelantikan-pengurus.html",
  },
  {
    name: "Abdi Persada FM",
    title: "Moment Pelantikan KBB Provinsi Bali",
    url: "https://abdipersadafm.co.id/2024/07/22/moment-pelantikan-kbb-provinsi-bali-paman-birin-dan-acil-odah-disambut-antusias-warga-banjar/",
  },
  {
    name: "Kesbangpol Provinsi Bali",
    title: "Pelantikan dan Pengukuhan Pengurus Wilayah KBB Provinsi Bali 2024-2028",
    url: "https://kesbangpol.baliprov.go.id/kaban-kesbangpol-bali-wakili-pj-gubernur-bali-pada-pelantikan-dan-pengukuhan-pengurus-wilayah-kbb-provinsi-bali-2024-2028/",
  },
  {
    name: "RRI Batam",
    title: "Pengurus Kerukunan Bubuhan Banjar Kepri Resmi Dilantik",
    url: "https://rri.co.id/batam/regional/1993452/faq.html",
  },
  {
    name: "KaltengBerkah",
    title: "Pemprov Dorong Peran PW-KBB Kalteng Dukung Pembangunan Daerah",
    url: "https://kaltengberkah.id/2026/02/14/pemprov-dorong-peran-pw-kbb-kalteng-dukung-pembangunan-daerah/",
  },
  {
    name: "Pemprov Sumatera Selatan",
    title: "HD Apresiasi Pengurus KBB Jaga Persatuan dan Kerukunan Sesama",
    url: "https://sumselprov.go.id/detail/berita/hd-apresiasi-pengurus-kbb-jaga-persatuan-dan-kerukunan-sesama/baru",
  },
];

const featuredMoments = [
  {
    title: "Pengukuhan PP KBB Sedunia 2022-2026",
    date: "22 Januari 2023",
    location: "Gedung Mahligai Pancasila, Banjarmasin",
    image: "/pelantikan/pp-kbb-mahligai-2023.jpg",
    credit: "Pemko Banjarmasin",
    source: sources[0],
    description:
      "Pengukuhan dan pelantikan Pengurus Pusat KBB Sedunia masa bakti 2022-2026 mengangkat tema Banjar Menjemput Dunia dan menjadi pijakan konsolidasi organisasi tingkat pusat.",
  },
  {
    title: "Pelantikan PW KBB Sumatera Selatan",
    date: "5 Juli 2023",
    location: "Ballroom Hotel Swarna Dwipa, Palembang",
    image: "/pelantikan/kbb-sumsel-2023-1.jpg",
    credit: "Pemprov Sumatera Selatan",
    source: sources[5],
    description:
      "Halal bihalal dan pelantikan Pengurus Wilayah KBB Sumatera Selatan menjadi ruang silaturahmi warga Banjar di Sumsel sekaligus penguatan pesan kerukunan lintas masyarakat.",
  },
  {
    title: "Pelantikan PW KBB Provinsi Bali 2024-2028",
    date: "20 Juli 2024",
    location: "Inna Sindhu Beach, Sanur, Bali",
    image: "/pelantikan/bali-kesbangpol-2.jpg",
    credit: "Kesbangpol Provinsi Bali",
    source: sources[2],
    description:
      "Pelantikan dan pengukuhan Pengurus Wilayah KBB Provinsi Bali periode 2024-2028 berlangsung di Inna Sindhu Beach Sanur dan dihadiri jajaran Pemerintah Provinsi Bali serta tokoh KBB Sadunia.",
  },
  {
    title: "Pengukuhan PW KBB Kepri 2025-2029",
    date: "23 November 2025",
    location: "Golden Prawn, Bengkong, Batam",
    image: "/pelantikan/kbb-kepri-rri-2025.jpg",
    credit: "RRI Batam",
    source: sources[3],
    description:
      "PW KBB Kepulauan Riau periode 2025-2029 dikukuhkan dengan 48 pengurus. Agenda ini menekankan konsolidasi organisasi dan peran KBB dalam menjaga kerukunan di Kepri.",
  },
  {
    title: "Pelantikan PW KBB Kalimantan Tengah 2025-2029",
    date: "14 Februari 2026",
    location: "Aula Bapperida/Bappeda Pemprov Kalteng, Palangka Raya",
    image: "/pelantikan/kbb-kalteng-2026.jpg",
    credit: "KaltengBerkah",
    source: sources[4],
    description:
      "PW KBB Kalimantan Tengah masa bakti 2025-2029 dilantik sebagai bagian dari penguatan koordinasi dan kontribusi warga Banjar dalam pembangunan daerah.",
  },
];

const gallery = [
  {
    image: "/pelantikan/bali-kesbangpol-2.jpg",
    title: "Pengurus KBB Bali berfoto bersama",
    caption: "Foto bersama dalam rangkaian pelantikan PW KBB Provinsi Bali periode 2024-2028.",
    credit: "Kesbangpol Provinsi Bali",
  },
  {
    image: "/pelantikan/bali-kesbangpol-3.jpg",
    title: "Suasana ruangan pelantikan KBB Bali",
    caption: "Acara berlangsung di Sanur dengan kehadiran warga Banjar dan tamu undangan.",
    credit: "Kesbangpol Provinsi Bali",
  },
  {
    image: "/pelantikan/pp-kbb-mahligai-2023.jpg",
    title: "Pengukuhan PP KBB Sedunia",
    caption: "Rangkaian pengukuhan PP KBB Sedunia di Gedung Mahligai Pancasila.",
    credit: "Pemko Banjarmasin",
  },
  {
    image: "/pelantikan/kbb-sumsel-2023-1.jpg",
    title: "Pelantikan PW KBB Sumatera Selatan",
    caption: "Kegiatan pelantikan KBB Sumsel di Palembang, dirangkai dengan halal bihalal warga Banjar.",
    credit: "Pemprov Sumatera Selatan",
  },
  {
    image: "/pelantikan/kbb-kepri-rri-2025.jpg",
    title: "Foto bersama PW KBB Kepri",
    caption: "PW KBB Kepri dikukuhkan untuk periode 2025-2029 di Batam.",
    credit: "RRI Batam",
  },
  {
    image: "/pelantikan/kbb-kalteng-2026.jpg",
    title: "Pelantikan PW KBB Kalimantan Tengah",
    caption: "Pengurus PW KBB Kalteng berfoto bersama dalam agenda pelantikan 2025-2029.",
    credit: "KaltengBerkah",
  },
];

export default function PelantikanPage() {
  const hero = featuredMoments.find((moment) => moment.title.includes("Bali")) || featuredMoments[0];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Kegiatan Pelantikan KBB Sadunia - KBB Sadunia</title>
        <meta
          name="description"
          content="Arsip foto dan linimasa kegiatan pelantikan KBB Sadunia, mulai dari pengurus pusat hingga pengurus wilayah di Sumsel, Bali, Kepri, dan Kalteng."
        />
      </Helmet>

      <section className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 px-4 md:px-6 py-8 md:py-12">
          <div className="lg:col-span-5 flex flex-col justify-center">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary-700 mb-4">Arsip Kegiatan</p>
            <h1 className="text-3xl md:text-4xl font-serif font-black leading-tight text-surface-950 mb-5">
              Kegiatan Pelantikan KBB Sadunia
            </h1>
            <p className="text-surface-700 text-base md:text-lg leading-relaxed max-w-xl">
              Arsip ini merangkum momen pelantikan dan pengukuhan Kerukunan Bubuhan Banjar dari tingkat pusat hingga wilayah. Catatan ditulis ringkas dengan tanggal, lokasi, foto, dan sumber publik.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-7">
              <div className="border-l-4 border-primary-700 bg-surface-50 px-4 py-3">
                <span className="block text-2xl font-black text-surface-950">5</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-surface-500">Momen</span>
              </div>
              <div className="border-l-4 border-primary-700 bg-surface-50 px-4 py-3">
                <span className="block text-2xl font-black text-surface-950">2023-2026</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-surface-500">Rentang</span>
              </div>
              <div className="border-l-4 border-primary-700 bg-surface-50 px-4 py-3">
                <span className="block text-2xl font-black text-surface-950">6</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-surface-500">Sumber</span>
              </div>
            </div>
          </div>
          <figure className="lg:col-span-7 border border-surface-200 bg-surface-50">
            <div className="aspect-[4/3] bg-surface-100 overflow-hidden">
              <OptimizedImage src={hero.image} alt={hero.title} className="w-full h-full object-contain bg-white" loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 58vw, 100vw" />
            </div>
            <figcaption className="border-t border-surface-200 bg-white px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary-700 mb-1">Foto Utama</p>
              <p className="text-sm font-bold text-surface-900">{hero.title}</p>
              <p className="text-xs text-surface-500 mt-1">Sumber foto: {hero.credit}</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <section className="grid lg:grid-cols-12 gap-8 mb-14">
          <div className="lg:col-span-8">
            <div className="news-divider-bold mb-5" />
            <h2 className="text-2xl md:text-3xl font-serif font-black text-surface-900 mb-4">
              Pelantikan sebagai penanda kerja organisasi
            </h2>
            <p className="text-surface-700 leading-relaxed text-base md:text-lg">
              Pelantikan KBB Sadunia bukan sekadar seremoni. Di dalamnya ada pengesahan mandat, konsolidasi pengurus, penguatan jejaring diaspora Banjar, dan pesan agar warga Banjar tetap menjaga harmoni di tanah rantau. Karena itu halaman ini dibuat sebagai arsip visual yang mudah dibaca oleh masyarakat dan pengurus.
            </p>
          </div>
          <aside className="lg:col-span-4 border border-surface-200 bg-surface-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-primary-700" />
              <h3 className="text-[12px] font-black uppercase tracking-[0.18em] text-surface-900">Catatan Redaksi</h3>
            </div>
            <p className="text-sm text-surface-700 leading-relaxed">
              Foto dan tanggal disusun dari sumber publik. Jika ada koreksi nama, tanggal, atau kredit foto, redaksi dapat memperbarui arsip ini melalui dashboard atau laporan koreksi.
            </p>
          </aside>
        </section>

        <section className="mb-14">
          <div className="flex items-end justify-between gap-4 mb-6 border-b-2 border-surface-900 pb-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary-700 mb-2">Linimasa</p>
              <h2 className="text-2xl md:text-3xl font-serif font-black text-surface-900">Momen Pelantikan Tercatat</h2>
            </div>
          </div>
          <div className="space-y-5">
            {featuredMoments.map((moment, index) => (
              <article key={moment.title} className="grid md:grid-cols-12 gap-0 border border-surface-200 bg-white shadow-sm">
                <div className="md:col-span-4 bg-surface-100 min-h-[220px] relative">
                  <OptimizedImage src={moment.image} alt={moment.title} className="absolute inset-0 w-full h-full object-contain bg-white" sizes="(min-width: 768px) 33vw, 100vw" />
                </div>
                <div className="md:col-span-8 p-5 md:p-7">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-800 text-white text-sm font-black">{index + 1}</span>
                    <span className="px-3 py-1 bg-surface-100 text-[10px] font-black uppercase tracking-widest text-surface-700">
                      {moment.credit}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-black text-surface-900 leading-tight mb-3">{moment.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-surface-600 font-semibold mb-4">
                    <span className="inline-flex items-center gap-2"><CalendarDays size={16} /> {moment.date}</span>
                    <span className="inline-flex items-center gap-2"><MapPin size={16} /> {moment.location}</span>
                  </div>
                  <p className="text-surface-700 leading-relaxed mb-5">{moment.description}</p>
                  <a
                    href={moment.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary-700 hover:text-primary-900"
                  >
                    Buka sumber: {moment.source.name} <ExternalLink size={14} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6 border-b-2 border-surface-200 pb-3">
            <div className="w-2 h-6 bg-primary-800" />
            <h2 className="text-2xl md:text-3xl font-serif font-black text-surface-900">Galeri Foto Pelantikan</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gallery.map((item) => (
              <figure key={item.image} className="border border-surface-200 bg-white shadow-sm">
                <div className="aspect-[4/3] overflow-hidden bg-surface-100">
                  <OptimizedImage src={item.image} alt={item.title} className="w-full h-full object-contain bg-white hover:scale-[1.03] transition-transform duration-300" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                </div>
                <figcaption className="p-4">
                  <h3 className="font-black text-surface-900 leading-tight mb-2">{item.title}</h3>
                  <p className="text-sm text-surface-600 leading-relaxed">{item.caption}</p>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-surface-400">Foto: {item.credit}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="border-t-4 border-surface-900 pt-6">
          <h2 className="text-xl font-serif font-black text-surface-900 mb-4">Sumber Rujukan</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-4 border border-surface-200 bg-surface-50 px-4 py-3 hover:border-primary-600 hover:bg-white transition-colors"
              >
                <span>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-primary-700 mb-1">{source.name}</span>
                  <span className="block text-sm font-bold text-surface-800 group-hover:text-primary-800 leading-snug">{source.title}</span>
                </span>
                <ExternalLink size={15} className="shrink-0 text-surface-400 group-hover:text-primary-700 mt-1" />
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
