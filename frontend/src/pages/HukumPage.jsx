import { Download, FileText, ShieldCheck, Users } from "lucide-react";
import { useLang } from "../context/LangContext";
import OptimizedImage from "../components/OptimizedImage";

const legalDocuments = [
  {
    title: "Akta dan SK Pendirian 2016",
    summary: "Pengesahan pendirian badan hukum Perkumpulan Kerukunan Bubuhan Banjar.",
    images: [
      {
        src: "/dokumen/akta-kbb-2016-sk.jpg",
        alt: "SK Kemenkumham pendirian badan hukum KBB tahun 2016",
      },
      {
        src: "/dokumen/akta-kbb-2016-lampiran.jpg",
        alt: "Lampiran susunan organ perkumpulan KBB tahun 2016",
      },
    ],
  },
  {
    title: "Akta dan SK Perubahan 2024",
    summary: "Persetujuan perubahan perkumpulan Kerukunan Bubuhan Banjar Sadunia.",
    pdf: "/dokumen/akta-kbb-2024.pdf",
    images: [
      {
        src: "/dokumen/akta-kbb-2024-sk.jpg",
        alt: "SK Kemenkumham perubahan perkumpulan KBB Sadunia tahun 2024",
      },
      {
        src: "/dokumen/akta-kbb-2024-lampiran.jpg",
        alt: "Lampiran susunan pengurus dan pengawas KBB Sadunia tahun 2024",
      },
    ],
  },
];

const pengurus = [
  ["Ketua Umum", "H. Sahbirin Noor, S.Sos., M.H."],
  ["Ketua I", "Akhmad Fydayeen"],
  ["Ketua II", "Drs. H. Apriansyah, M.Si."],
  ["Ketua III", "Muhammadun, A.Ks., M.Ikom."],
  ["Ketua IV", "Drs. H. M. Ary Achdyani, M.AP."],
  ["Sekretaris Umum", "Dr. Taufik Arbain, S.Sos., M.Si."],
  ["Sekretaris I", "Achmad Maulana"],
  ["Sekretaris II", "Indrawansyah Syarkawi, S.E., M.Si."],
  ["Bendahara Umum", "Yuni Abdi Nur Sulaiman"],
  ["Bendahara I", "Raudati Hildayati, S.T."],
];

const pengawas = [
  ["Ketua", "Drs. H. Rudy Ariffin, M.M."],
  ["Anggota", "Dr. Drs. Yakob K.M Ismail, M.Si."],
  ["Anggota", "Drs. H. Gerilyansyah Basrindu, M.M., P.hd."],
];

const managementTeam = [
  {
    label: "Penanggung Jawab",
    value: "Sekretaris Umum / Sekjen PP KBB Sadunia Dr. Taufik Arbain, M.Si.",
  },
  {
    label: "Pengarah",
    value: "Koordinator Bidang Informasi dan Komunikasi Dr. Yakop KM. Ismail, M.Si.",
  },
  {
    label: "Tim Pengelola",
    value: "Ahmad Marjuni dan Arizal Naufal Kholis",
  },
];

function InfoItem({ label, value }) {
  return (
    <div className="border-b border-surface-200 py-3 last:border-b-0">
      <dt className="text-[11px] font-black uppercase tracking-[0.16em] text-surface-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-surface-900">{value}</dd>
    </div>
  );
}

function RoleList({ title, rows }) {
  return (
    <section className="border border-surface-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 border-b border-surface-200 pb-3 text-base font-black uppercase tracking-[0.12em] text-primary-800">
        {title}
      </h3>
      <dl className="space-y-3">
        {rows.map(([role, name]) => (
          <div key={`${title}-${role}-${name}`}>
            <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-surface-500">{role}</dt>
            <dd className="mt-1 text-sm font-semibold text-surface-900">{name}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function HukumPage() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary-700">
              Arsip Organisasi
            </p>
            <h1 className="text-2xl font-black text-surface-950 md:text-3xl">{t("nav.hukum")}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-surface-600">
              Halaman ini memuat dasar hukum pendirian, perubahan badan hukum, susunan pengurus, dan arsip dokumen KBB Sadunia.
            </p>
          </div>
          <a
            href="/dokumen/akta-kbb-2024.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-primary-700 bg-primary-800 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white hover:bg-primary-900"
          >
            <Download size={16} />
            Buka PDF 2024
          </a>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="border border-surface-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center bg-primary-50 text-primary-800">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h2 className="text-lg font-black text-surface-950">Pendirian Awal 2016</h2>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-500">KBB</p>
              </div>
            </div>
            <dl>
              <InfoItem label="Akta Pendirian" value="Nomor 94 Tanggal 25 April 2016" />
              <InfoItem label="Notaris" value="Gianto, S.H." />
              <InfoItem label="Pengesahan Kemenkumham" value="AHU-0062110.AH.01.07.TAHUN 2016" />
              <InfoItem label="Ditetapkan" value="Jakarta, 8 Juni 2016" />
            </dl>
          </div>

          <div className="border border-surface-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center bg-primary-50 text-primary-800">
                <FileText size={20} />
              </span>
              <div>
                <h2 className="text-lg font-black text-surface-950">Perubahan Terakhir 2024</h2>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-500">KBB Sadunia</p>
              </div>
            </div>
            <dl>
              <InfoItem label="Akta Perubahan" value="Nomor 2 Tanggal 15 Agustus 2024" />
              <InfoItem label="Notaris" value="Muhammad Adam, S.H., M.Kn." />
              <InfoItem label="Pengesahan Kemenkumham" value="AHU-0001263.AH.01.08.TAHUN 2024" />
              <InfoItem label="Ditetapkan" value="Jakarta, 22 Agustus 2024" />
            </dl>
          </div>
        </section>

        <section className="mb-8 border border-surface-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-surface-200 pb-4">
            <div>
              <h2 className="text-xl font-black text-surface-950">Lampiran Dokumen Dasar Hukum</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-surface-600">
                Foto dokumen ditempel langsung agar arsip lama dan akta 2024 mudah dibuka. Nomor identitas pribadi pada lampiran publik disamarkan.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {legalDocuments.map((doc) => (
              <article key={doc.title} className="border-b border-surface-200 pb-8 last:border-b-0 last:pb-0">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-[0.12em] text-primary-800">{doc.title}</h3>
                    <p className="mt-1 text-sm text-surface-600">{doc.summary}</p>
                  </div>
                  {doc.pdf && (
                    <a
                      href={doc.pdf}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 border border-surface-300 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-surface-700 hover:border-primary-700 hover:text-primary-800"
                    >
                      <Download size={14} />
                      PDF
                    </a>
                  )}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {doc.images.map((image) => (
                    <a
                      key={image.src}
                      href={image.src}
                      target="_blank"
                      rel="noreferrer"
                      className="block bg-surface-100 p-2 hover:bg-surface-200"
                      aria-label={image.alt}
                    >
                      <OptimizedImage
                        src={image.src}
                        alt={image.alt}
                        className="h-auto w-full border border-surface-200 bg-white object-contain"
                        sizes="(min-width: 1024px) 50vw, 100vw"
                      />
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-black text-surface-950">Susunan Pengurus KBB Sadunia</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-surface-600">
              Susunan berikut merujuk pada lampiran Keputusan Menteri Hukum dan Hak Asasi Manusia Nomor AHU-0001263.AH.01.08.TAHUN 2024.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <RoleList title="Pengurus" rows={pengurus} />
            <RoleList title="Pengawas" rows={pengawas} />
          </div>
        </section>

        <section className="border border-surface-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-primary-50 text-primary-800">
              <Users size={20} />
            </span>
            <div>
              <h2 className="text-lg font-black text-surface-950">Tim Pengelola</h2>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-500">Dokumentasi dan informasi halaman</p>
            </div>
          </div>
          <div className="grid gap-3">
            {managementTeam.map((item) => (
              <div key={item.label} className="border border-surface-200 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary-800">{item.label}</p>
                <p className="mt-2 text-base font-semibold leading-7 text-surface-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
