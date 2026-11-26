import { useEffect, useState } from "react";
import { fetchAPI } from "../services/api";

const EMPTY = { data: [], meta: {}, loading: true, error: false };
const IDLE = { ...EMPTY, loading: false };
const TIMEOUT_MS = 20_000;

// Each visitor checks the published feed while reading and when returning to the tab.
export function useNewsFeed(endpoint, refreshMs = 60_000, load = fetchAPI) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!endpoint) return;
    let active = true;
    let pending = null;
    let lastAttempt = -Infinity;

    async function refresh() {
      // focus, pageshow and visibilitychange often arrive together on mobile.
      const elapsed = Date.now() - lastAttempt;
      if (document.hidden || elapsed < 1500 || (pending && elapsed < TIMEOUT_MS)) return;
      // A sleeping phone can suspend the timeout as well as the original request.
      pending?.abort();
      lastAttempt = Date.now();
      const controller = new AbortController();
      pending = controller;
      const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const response = await load(endpoint, { signal: controller.signal, cache: "no-store" });
        if (!Array.isArray(response.data)) throw new Error("Invalid news feed");
        if (active && pending === controller) setResult({ endpoint, data: response.data, meta: response.meta || {}, loading: false, error: false });
      } catch {
        if (!active || pending !== controller) return;
        lastAttempt = -Infinity;
        // A network failure must not replace previously published stories with an empty list.
        setResult(previous => previous?.endpoint === endpoint && !previous.error
          ? previous
          : { ...EMPTY, endpoint, loading: false, error: true });
      } finally {
        window.clearTimeout(timeout);
        if (pending === controller) pending = null;
      }
    }

    refresh();
    const timer = window.setInterval(refresh, refreshMs);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("online", refresh);
    return () => {
      active = false;
      pending?.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [endpoint, refreshMs, load]);

  if (!endpoint) return IDLE;
  return result?.endpoint === endpoint ? result : EMPTY;
}
