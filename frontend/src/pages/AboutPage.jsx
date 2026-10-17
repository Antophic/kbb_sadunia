export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Tentang KBB Sadunia</h1>

        <div className="bg-white rounded-lg border border-surface-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-surface-900 mb-3">Redaksi</h2>
          <p className="text-surface-600 leading-relaxed mb-3">
            KBB Sadunia adalah portal berita dan informasi Kerukunan Bubuhan Banjar Sadunia yang menyajikan kabar kegiatan, budaya, opini, dan informasi organisasi secara jelas serta bertanggung jawab.
          </p>
          <p className="text-surface-600 leading-relaxed">
            Redaksi mengutamakan akurasi, sumber yang dapat ditelusuri, serta pemisahan yang jelas antara berita dan opini.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-surface-900 mb-3">Pedoman Pemberitaan</h2>
          <ul className="space-y-2 text-surface-600 text-sm">
            <li className="flex gap-2"><span className="text-primary-600 font-bold">-</span> Menjunjung akurasi dan keberimbangan dalam setiap pemberitaan</li>
            <li className="flex gap-2"><span className="text-primary-600 font-bold">-</span> Menghormati privasi dan asas praduga tak bersalah</li>
            <li className="flex gap-2"><span className="text-primary-600 font-bold">-</span> Memberikan hak jawab kepada pihak yang diberitakan</li>
            <li className="flex gap-2"><span className="text-primary-600 font-bold">-</span> Membedakan berita redaksi, siaran kegiatan, dan opini penulis</li>
            <li className="flex gap-2"><span className="text-primary-600 font-bold">-</span> Mencantumkan sumber jika artikel disusun dari rujukan eksternal</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-surface-900 mb-3">Teknologi</h2>
          <p className="text-surface-600 text-sm mb-4">Website ini dibangun dengan arsitektur Headless CMS modern:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: "React", desc: "Frontend UI" },
              { name: "TailwindCSS", desc: "Styling" },
              { name: "PHP", desc: "Backend API" },
              { name: "MySQL", desc: "Database" },
              { name: "REST API", desc: "Integrasi data" },
              { name: "InfinityFree", desc: "Hosting" },
            ].map((t) => (
              <div key={t.name} className="p-3 rounded-lg bg-surface-50 border border-surface-200">
                <p className="font-bold text-surface-900 text-sm">{t.name}</p>
                <p className="text-xs text-surface-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-6">
          <h2 className="text-lg font-bold text-surface-900 mb-3">Kontak Redaksi</h2>
          <div className="space-y-2 text-sm text-surface-600">
            <p><strong className="text-surface-800">Email:</strong> redaksi@kbb-sadunia.com</p>
            <p><strong className="text-surface-800">Telepon:</strong> Sekretariat KBB Sadunia</p>
            <p><strong className="text-surface-800">Alamat:</strong> Banjarmasin, Kalimantan Selatan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
