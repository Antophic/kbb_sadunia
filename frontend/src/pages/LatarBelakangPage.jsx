export default function LatarBelakangPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="news-divider-bold mb-4" />
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Latar Belakang</h1>
      <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-4">
        <p className="text-surface-600 leading-relaxed">
          Kerukunan Bubuhan Banjar (KBB) Sadunia hadir sebagai wadah silaturahmi,
          dokumentasi, dan komunikasi warga Banjar di berbagai daerah serta perantauan.
          Perkumpulan ini menjadi ruang bersama untuk menjaga hubungan kekeluargaan,
          adat, budaya, dan kontribusi Bubuhan Banjar dalam kehidupan masyarakat.
        </p>
        <p className="text-surface-600 leading-relaxed">
          Portal KBB Sadunia disiapkan untuk memperkuat akses informasi publik. Pembaca
          dapat menelusuri berita, opini, kegiatan pelantikan, dasar hukum, arsip organisasi,
          dan perpustakaan digital melalui satu tempat yang lebih rapi.
        </p>

        <h2 className="text-lg font-bold text-surface-900 pt-4">Mengapa Portal Ini Dibuat?</h2>
        <ul className="space-y-2 text-surface-600">
          <li className="flex gap-2"><span className="text-primary-600 font-bold shrink-0">1.</span>Menyediakan arsip berita dan kegiatan KBB Sadunia yang mudah ditemukan.</li>
          <li className="flex gap-2"><span className="text-primary-600 font-bold shrink-0">2.</span>Membedakan berita redaksi, artikel, opini, dokumen hukum, dan galeri kegiatan.</li>
          <li className="flex gap-2"><span className="text-primary-600 font-bold shrink-0">3.</span>Membantu pengelola artikel menerbitkan konten dengan sumber, gambar, dan kategori yang jelas.</li>
          <li className="flex gap-2"><span className="text-primary-600 font-bold shrink-0">4.</span>Menyimpan bahan bacaan digital agar dapat dikelola melalui perpustakaan online.</li>
          <li className="flex gap-2"><span className="text-primary-600 font-bold shrink-0">5.</span>Mendukung keterbukaan informasi organisasi dengan tampilan yang ramah mobile.</li>
        </ul>

        <h2 className="text-lg font-bold text-surface-900 pt-4">Arah Pengembangan</h2>
        <p className="text-surface-600 leading-relaxed">
          Pengembangan portal diarahkan pada arsitektur yang lebih modular, performa yang
          lebih ringan melalui gambar modern, dan pengelolaan konten yang lebih aman. Setiap
          konten publik diarahkan memiliki kategori, ringkasan, sumber, gambar yang sesuai
          konteks, dan metadata yang baik untuk mesin pencari.
        </p>
      </div>
    </div>
  );
}
