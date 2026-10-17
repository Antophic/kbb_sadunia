import { useLang } from "../context/LangContext";
import { Mail, MapPin, Phone } from "lucide-react";

export default function AdministrasiPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-6">{t("nav.administrasi")}</h1>
        <div className="bg-white border border-surface-200 p-6 prose-article">
          <h2>Administrasi & Sekretariat</h2>
          <p>
            Pusat administrasi Kerukunan Bubuhan Banjar (KBB) Sadunia berfungsi sebagai pusat kendali operasional, 
            koordinasi antar wilayah, serta pusat informasi keanggotaan.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-surface-50 p-4 border border-surface-200 rounded">
              <h3 className="text-lg font-bold text-surface-900 mt-0 mb-3 border-b border-surface-200 pb-2">Kontak Sekretariat</h3>
              <ul className="list-none pl-0 space-y-2">
                <li className="flex items-start gap-2">
                  <MapPin size={18} className="text-primary-600 mt-1 shrink-0" />
                  <span className="text-surface-700"><strong>Alamat:</strong><br/>Jalan Pramuka Komplek Semanda 1 Bumi Pramuka Asri Blok D Nomor 19 RT. 21 RW. 02 Kelurahan Sungai Lulut Kecamatan Banjarmasin Timur Kota Banjarmasin</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone size={18} className="text-primary-600 mt-1 shrink-0" />
                  <span className="text-surface-700"><strong>Telp/HP/WA:</strong><br/>081953821963 - 081348717072</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail size={18} className="text-primary-600 mt-1 shrink-0" />
                  <span className="text-surface-700"><strong>Email:</strong><br/>sekretariat@kbb-sadunia.com</span>
                </li>
              </ul>
            </div>

            <div className="bg-surface-50 p-4 border border-surface-200 rounded">
              <h3 className="text-lg font-bold text-surface-900 mt-0 mb-3 border-b border-surface-200 pb-2">Layanan Administrasi</h3>
              <ul className="text-surface-700">
                <li>Pendaftaran Keanggotaan Baru</li>
                <li>Pengesahan Surat Keputusan (SK) Wilayah</li>
                <li>Pusat Bantuan Hukum Anggota</li>
                <li>Informasi Program dan Kemitraan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
