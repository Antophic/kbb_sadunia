import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { setSingleDocumentTitle } from "../utils/pageTitle";

const titles = {
  "/": "KBB Sadunia - Portal Berita Kerukunan Bubuhan Banjar Sa dunia",
  "/terkini": "Berita Terkini - KBB Sadunia",
  "/tersimpan": "Baca Nanti - KBB Sadunia",
  "/profil": "Profil Organisasi - KBB Sadunia",
  "/program": "Program Kami - KBB Sadunia",
  "/struktur": "Struktur Organisasi - KBB Sadunia",
  "/galeri": "Galeri Foto & Video - KBB Sadunia",
  "/kalender": "Kalender Acara - KBB Sadunia",
  "/kontak": "Hubungi Kami - KBB Sadunia",
  "/donasi": "Donasi - KBB Sadunia",
  "/auth": "Masuk / Daftar - KBB Sadunia",
  "/about": "Tentang Redaksi - KBB Sadunia",
  "/latar-belakang": "Latar Belakang - KBB Sadunia",
  "/kebijakan-privasi": "Kebijakan Privasi - KBB Sadunia",
  "/sitemap": "Sitemap - KBB Sadunia",
  "/perpustakaan": "Perpustakaan Digital - KBB Sadunia",
  "/tentang/sejarah": "Sejarah Pembentukan KBB Sadunia",
  "/tentang/susunan-pengurus": "Dasar Hukum dan Susunan Pengurus - KBB Sadunia",
  "/tentang/pelantikan": "Kegiatan Pelantikan - KBB Sadunia",
  "/tentang/opini": "Artikel dan Opini - KBB Sadunia",
  "/tentang/kegiatan": "Kegiatan dan Gelaran - KBB Sadunia",
  "/tentang/administrasi": "Administrasi dan Sekretariat - KBB Sadunia",
};

const dynamicPrefixes = ["/article/", "/kategori/", "/search"];

export default function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const origin = window.location.origin;

    if (titles[pathname]) {
      setSingleDocumentTitle(titles[pathname]);
    } else if (!dynamicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
      setSingleDocumentTitle("KBB Sadunia - Portal Berita Kerukunan Bubuhan Banjar Sa dunia");
    }

    let schema = document.getElementById("schema-jsonld");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "schema-jsonld";
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }

    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "KBB Sadunia",
      url: origin,
      logo: `${origin}/logo-kbb.png`,
      description: "Portal resmi KBB Sadunia untuk berita, opini, budaya, dan kegiatan Bubuhan Banjar.",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Kalimantan Selatan",
        addressCountry: "ID",
      },
      sameAs: [
        "https://facebook.com/kbbsadunia",
        "https://twitter.com/kbbsadunia",
        "https://instagram.com/kbbsadunia",
      ],
    });
  }, [pathname]);

  return null;
}
