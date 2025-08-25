import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ==============================
// Defaults (safe fallbacks)
// ==============================
export const defaultContent = {
  theme: { primary: "#F69321" },
  hero: {
    headline: "Building Tennessee’s Future",
    subhead:
      "Family-owned quarry & materials supplier trusted by builders, paving crews, and concrete projects across Tennessee since 2007.",
    video: "/hero-video.mp4",
  },
  products: [
    { title: "Construction Aggregates", desc: "Industrial and construction grade.", image: "/materials.jpg" },
    { title: "Road Construction and Paving", desc: "Premium aggregates for all jobs.", image: "/sand-gravel.jpg" },
    { title: "Asphalt", desc: "Durable asphalt for long-lasting roads.", image: "/paving.jpg" },
    { title: "Ready Mix Concrete", desc: "Ready-mix concrete that performs.", image: "/concrete.jpg" },
  ],
};

// Accept an optional API base for prod; blank = same-origin (dev proxy works)
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const url = (p) => `${API_BASE}${p}`;

// Merge API payload into defaults (defensive against missing keys)
function safeMerge(json) {
  return {
    ...defaultContent,
    ...json,
    theme: { ...defaultContent.theme, ...(json?.theme || {}) },
    hero: { ...defaultContent.hero, ...(json?.hero || {}) },
    products: Array.isArray(json?.products) ? json.products : defaultContent.products,
  };
}

export const ContentContext = createContext(null);
// optional alias if some files still import ContentCtx
export const ContentCtx = ContentContext;

export function ContentProvider({
  children,
  // set this to true on Admin if you want to silence background refresh from storage pings
  disableStorageRefresh = false,
  // small throttle to avoid bursty events (ms)
  storageThrottleMs = 400,
}) {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- loop guards ---
  const didInitRef = useRef(false);        // prevent StrictMode double-run
  const inFlightRef = useRef(null);        // de-dupe concurrent fetches
  const lastStorageTsRef = useRef(0);      // throttle storage events

  // Fetch latest content from API (no caching)
  const refetch = useCallback(async () => {
    // If a fetch is already running, return the existing promise
    if (inFlightRef.current) return inFlightRef.current;

    const promise = (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url(`/api/content?ts=${Date.now()}`), {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-store",
            Pragma: "no-cache",
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);
        const json = await res.json();
        setContent(safeMerge(json));
      } catch (e) {
        console.warn("[Content] Using defaults. Reason:", e);
        setContent(defaultContent);
        setError(e);
      } finally {
        setLoading(false);
        inFlightRef.current = null; // clear in-flight flag
      }
    })();

    inFlightRef.current = promise;
    return promise;
  }, []);

  // Initial load (guarded so it runs once even under StrictMode)
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    refetch().catch(() => {});
  }, [refetch]);

  // Cross-tab refresh: Admin sets localStorage key after save
  useEffect(() => {
    if (disableStorageRefresh) return;

    const onStorage = (e) => {
      if (e.key !== "content:updatedAt") return;
      const now = Date.now();
      if (now - lastStorageTsRef.current < storageThrottleMs) return; // throttle bursts
      lastStorageTsRef.current = now;
      refetch().catch(() => {});
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refetch, disableStorageRefresh, storageThrottleMs]);

  // Optional helper for optimistic updates within the app (does not persist to API)
  const setContentLocal = (next) => {
    setContent((prev) => safeMerge(typeof next === "function" ? next(prev) : next));
  };

  const value = useMemo(
    () => ({ content, setContent: setContentLocal, loading, error, refetch }),
    [content, loading, error, refetch]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
