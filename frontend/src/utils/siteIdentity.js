export const SITE_ORIGIN = "https://kbbsadunia.com";
export const HOME_TITLE = "KBB Sadunia | Portal Resmi Kerukunan Bubuhan Banjar";
export const HOME_DESCRIPTION = "Berita Banua, budaya Banjar, kegiatan pengurus wilayah, dan perpustakaan digital dari KBB Sadunia, portal resmi Kerukunan Bubuhan Banjar.";
export const PUBLIC_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1";

// Reuse the tags sent in the initial HTML as readers navigate within the app.
export function setPageSummary(title, description, image, type = "website") {
  for (const [selector, value] of [
    ['name="description"', description], ['property="og:title"', title],
    ['property="og:description"', description], ['property="og:type"', type],
    ['property="og:image"', image], ['name="twitter:title"', title],
    ['name="twitter:description"', description], ['name="twitter:image"', image],
  ]) {
    const tag = document.head.querySelector(`meta[${selector}]`);
    if (tag) tag.content = value;
  }
}

export function siteSchema(origin = SITE_ORIGIN) {
  const publisher = { "@id": origin + "/#organisasi" };
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": origin + "/#website", url: origin + "/", name: "KBB Sadunia",
        alternateName: ["KBBSadunia", "Kerukunan Bubuhan Banjar Sadunia"], inLanguage: "id", publisher },
      { "@type": "Organization", ...publisher, name: "Kerukunan Bubuhan Banjar Sadunia",
        alternateName: "KBB Sadunia", url: origin + "/", logo: origin + "/logo-kbb.png" },
    ],
  };
}
