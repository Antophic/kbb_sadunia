let titleObserver = null;

export function setSingleDocumentTitle(title) {
  if (typeof document === "undefined" || !title) return;
  let normalizing = false;

  const applyTitle = () => {
    if (normalizing) return;
    normalizing = true;
    const titleNodes = Array.from(document.head.querySelectorAll("title"));
    const firstTitle = titleNodes[0] || document.head.appendChild(document.createElement("title"));

    if (firstTitle.textContent !== title) {
      firstTitle.textContent = title;
    }

    if (titleNodes.length > 1) {
      titleNodes.slice(1).forEach((node) => node.remove());
    }

    if (document.title !== title) {
      document.title = title;
    }
    normalizing = false;
  };

  applyTitle();

  if (typeof window !== "undefined") {
    if (titleObserver) {
      titleObserver.disconnect();
    }

    titleObserver = new MutationObserver(applyTitle);
    titleObserver.observe(document.head, {
      childList: true,
      subtree: false,
    });

    window.setTimeout(applyTitle, 0);
    window.setTimeout(applyTitle, 150);
    window.setTimeout(applyTitle, 600);
    window.setTimeout(() => {
      if (titleObserver) {
        titleObserver.disconnect();
        titleObserver = null;
      }
      applyTitle();
    }, 3000);
  }
}
