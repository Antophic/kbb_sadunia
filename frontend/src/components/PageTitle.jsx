import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { setSingleDocumentTitle } from "../utils/pageTitle";
import { HOME_TITLE, HOME_DESCRIPTION, PUBLIC_ROBOTS, SITE_ORIGIN, setPageSummary, siteSchema } from "../utils/siteIdentity";

const titles = {
  "/": HOME_TITLE,
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
  const { pathname, search } = useLocation();

  useEffect(() => {
    const path = pathname.replace(/\/+$/, "") || "/";
    const isArticle = /^\/(?:article|artikel|berita)\//.test(path);
    const link = document.querySelector('link[rel="canonical"]');
    const canonical = new URL(new URL(link?.href || SITE_ORIGIN).origin);
    canonical.pathname = path.replace(/^\/(?:berita|artikel)\//, "/article/");
    const page = new URLSearchParams(search).get("page");
    if (/^\/(?:terkini$|(?:kategori|tag)\/[^/]+$)/.test(path) && /^[1-9]\d*$/.test(page) && Number(page) > 1) {
      canonical.searchParams.set("page", page);
    }
    if (link) link.href = canonical.href;
    document.querySelector('meta[property="og:url"]').content = canonical.href;
    if (!isArticle) {
      const title = titles[path] || HOME_TITLE;
      if (titles[path] || !dynamicPrefixes.some((prefix) => path.startsWith(prefix))) setSingleDocumentTitle(title);
      setPageSummary(title, HOME_DESCRIPTION, canonical.origin + "/logo-kbb.png");
      document.querySelector('meta[name="robots"]').content =
        /^\/(?:admin|auth|search|tersimpan)(?:\/|$)/.test(path) ? "noindex, follow" : PUBLIC_ROBOTS;
    }
    let schema = document.getElementById("kbb-site-schema");
    if (path !== "/") {
      schema?.remove();
    } else if (!schema) {
      schema = document.createElement("script");
      schema.id = "kbb-site-schema";
      schema.type = "application/ld+json";
      schema.textContent = JSON.stringify(siteSchema(canonical.origin));
      document.head.appendChild(schema);
    }
  }, [pathname, search]);

  return null;
}
