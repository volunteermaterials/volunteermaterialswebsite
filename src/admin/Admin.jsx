import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useContent } from "../content/ContentContext";
import { useForm, useFieldArray } from "react-hook-form";

/*
 * This component powers the admin panel for editing site content.
 *
 * The implementation retains all of the original functionality (uploading
 * images/videos, editing hero text, services, materials, locations and
 * calculator defaults) but wraps it in a modern, responsive layout.
 *
 * A sticky header sits at the top of the page while the main area is
 * split into a sidebar navigation and a scrollable form. On mobile
 * screens the navigation collapses into an off‑canvas drawer that slides
 * in from the left when activated. Each section of the form is rendered
 * inside a collapsible card that can be expanded to reveal the controls.
 *
 * The bottom of the page shows a subtle sticky bar whenever there are
 * unsaved changes, giving the user quick access to discard, refresh or
 * save. All styling is handled with Tailwind CSS utility classes.
 */

const INPUT_CLS =
  "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent";
const LABEL_CLS = "block text-sm font-medium text-gray-700";
const HELP_CLS = "text-xs text-gray-500 mt-1";

/** Collapsible section shell (closed by default).
 *  Provides a modern card design with a header bar and body area.
 */
function SectionCard({ id, title, open = false, onToggle, children }) {
  return (
    <section id={id} data-anchor className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Section header */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
          open ? "bg-gray-100" : "bg-gray-50 hover:bg-gray-100"
        }`}
        aria-expanded={open}
        aria-controls={`${id}-content`}
      >
        <h2 className="text-base font-semibold text-left">{title}</h2>
        <span
          className={`inline-block text-gray-500 transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
          title={open ? "Collapse" : "Expand"}
        >
          ▼
        </span>
      </button>
      {/* Section body */}
      <div id={`${id}-content`} className={`${open ? "block" : "hidden"} px-4 py-4`}>
        {children}
      </div>
    </section>
  );
}

export default function Admin() {
  const { logout, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { content, setContent, refetch } = useContent();

  // -------- Collapsible section state --------
  const ALL_KEYS = ["theme", "hero", "services", "materials", "locations", "calculators"];
  const closedState = Object.fromEntries(ALL_KEYS.map((k) => [k, false]));
  const [openMap, setOpenMap] = useState(() => {
    // Initialize with all sections closed
    const hash = (typeof window !== "undefined" && window.location.hash || "").slice(1);
    if (ALL_KEYS.includes(hash)) {
      return Object.fromEntries(ALL_KEYS.map((k) => [k, k === hash]));
    }
    return closedState;
  });

  // -------- Mobile nav state --------
  const [navOpen, setNavOpen] = useState(false);

  /** Open exactly one section; others closed */
  const openOnly = (key) => setOpenMap(Object.fromEntries(ALL_KEYS.map((k) => [k, k === key])));

  /** Toggle a section exclusively; if it's open -> close all, if closed -> open only it */
  const toggleExclusive = (key) =>
    setOpenMap((m) => {
      const isOpen = !!m[key];
      return Object.fromEntries(ALL_KEYS.map((k) => [k, isOpen ? false : k === key]));
    });

  const expandAll = () => setOpenMap(Object.fromEntries(ALL_KEYS.map((k) => [k, true])));
  const collapseAll = () => setOpenMap(closedState);

  // ---------- Form ----------
  const defaultValues = useMemo(
    () =>
      content || {
        theme: { primary: "#F69321" },
        hero: { headline: "", subhead: "", video: "" },
        products: [],
        materials: [],
        locations: [],
        calculators: {
          aggregates: { defaultWastePct: 10 },
          concrete: { defaultWastePct: 10 },
        },
      },
    [content]
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { isDirty, isSubmitting },
  } = useForm({ defaultValues, mode: "onChange" });

  // Field arrays
  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
    swap: swapService,
  } = useFieldArray({ control, name: "products" });

  const {
    fields: materialFields,
    append: appendMaterial,
    remove: removeMaterial,
    swap: swapMaterial,
  } = useFieldArray({ control, name: "materials" });

  const {
    fields: locationFields,
    append: appendLocation,
    remove: removeLocation,
    swap: swapLocation,
  } = useFieldArray({ control, name: "locations" });

  // Keep form in sync with content updates
  useEffect(() => {
    if (content) reset(content);
  }, [content, reset]);

  // Initial refetch once
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    refetch?.().catch((e) => console.warn("[Admin] initial refetch failed", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unsaved changes guard
  useEffect(() => {
    const handler = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Watchers
  const current = watch();
  const primaryColor = current?.theme?.primary || "#F69321";
  const heroVideo = current?.hero?.video || "";

  // Collapsed by default on first load; optional hash opens a section
  useEffect(() => {
    // Force all sections closed initially
    const hash = (typeof window !== "undefined" && window.location.hash || "").slice(1);
    if (ALL_KEYS.includes(hash)) {
      // If there's a valid hash, open only that section
      setOpenMap(Object.fromEntries(ALL_KEYS.map((k) => [k, k === hash])));
    } else {
      // Otherwise, ensure all sections are closed
      setOpenMap(closedState);
    }

    const onHashChange = () => {
      const id = (typeof window !== "undefined" && window.location.hash || "").slice(1);
      if (ALL_KEYS.includes(id)) openOnly(id);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close mobile nav when clicking outside or on nav links
  useEffect(() => {
    if (!navOpen) return;
    const handleClickOutside = (e) => {
      // If the click is outside of the nav container or the nav toggle, close it
      if (!e.target.closest("#mobile-nav") && !e.target.closest("#nav-toggle")) {
        setNavOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [navOpen]);

  // ---------- Actions ----------
  const onSubmit = async (data) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "read:content write:content",
        },
      });

      if (!token || token.split(".").length !== 3) {
        alert("Auth token is not a JWT. Check Auth0 audience/config.");
        return;
      }

      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        alert(`Save failed: ${res.status}\n${text}`);
        return;
      }

      setContent(data);
      localStorage.setItem("content:updatedAt", String(Date.now()));
      await refetch?.();
      reset(data);
    } catch (e) {
      console.error(e);
      alert(`Save error: ${(e && e.message) || e}`);
    }
  };

  const refreshFromServer = async () => {
    try {
      const res = await fetch("/api/content?ts=" + Date.now(), { cache: "no-store" });
      if (!res.ok) throw new Error(`GET /api/content ${res.status}`);
      const json = await res.json();
      reset(json);
      setContent(json);
    } catch (e) {
      console.error(e);
      alert("Failed to refresh from server.");
    }
  };

  const discardChanges = () => reset(content);

  const uploadWithToken = async (file, endpoint = "/api/upload") => {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "read:content write:content",
      },
    });
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed: ${res.status} ${text}`);
    }
    return res.json();
  };

  const onUploadVideo = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
        const { url } = await uploadWithToken(f);
        reset({ ...current, hero: { ...current.hero, video: url } }, { keepDirty: true });
    } catch (err) {
      console.error(err);
      alert("Video upload failed.");
    }
  };

  const onUploadServiceImage = (index) => async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const { url } = await uploadWithToken(f);
      const next = structuredClone(current);
      next.products[index] = { ...(next.products[index] || {}), image: url };
      reset(next, { keepDirty: true });
    } catch (err) {
      console.error(err);
      alert("Image upload failed.");
    }
  };

  const handleNavClick = (key) => {
    openOnly(key); // open selected, close others
    setNavOpen(false); // close mobile nav
    // Scroll to the section smoothly
    document.getElementById(key)?.scrollIntoView({ behavior: "smooth", block: "start" });
    // sync the URL hash
    if (typeof window !== "undefined" && window.location.hash !== `#${key}`) window.location.hash = key;
  };

  if (!isAuthenticated) {
    return <div className="p-6">You must sign in to view this page.</div>;
  }

  // Helper for directions preview link
  const directionsUrl = (loc) => {
    const addr = [loc?.address1, loc?.address2, loc?.city && `${loc.city},`, loc?.state, loc?.zip]
      .filter(Boolean)
      .join(" ");
    const dest = addr || (loc?.lat && loc?.lng ? `${loc.lat},${loc.lng}` : "");
    return dest ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}` : "#";
  };

  // Small helpers for density previews
  const tonPerYd3 = (lbft3) => (lbft3 ? (lbft3 * 27) / 2000 : 0);
  const yd3PerTon = (lbft3) => (lbft3 ? 2000 / (lbft3 * 27) : 0);
  const round3 = (n) => Math.round((Number(n) + Number.EPSILON) * 1000) / 1000;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          {/* Mobile nav toggle */}
          <button
            id="nav-toggle"
            onClick={() => setNavOpen(!navOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-md border hover:bg-gray-50"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-semibold truncate">Admin — Site Content</h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Update theme, hero, services (home tiles), materials (calculators), locations and calculator settings.
            </p>
          </div>
          <a
            href="/"
            className="hidden md:inline text-sm text-gray-600 hover:text-gray-900 underline mr-4"
            title="Open public site"
          >
            Back to site
          </a>
          <button
            className="text-sm text-gray-600 underline"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Log out
          </button>
        </div>
      </header>

      {/* Page Layout */}
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <nav
          id="mobile-nav"
          className={`
             ${navOpen ? "fixed inset-0 z-40 bg-black/40" : ""}
             md:block md:static
           `}
          onClick={(e) => e.target.id === "mobile-nav" && setNavOpen(false)}
        >
          <div
            className={`
               ${navOpen ? "fixed left-0 top-0 h-full w-72 bg-white shadow-xl transition-transform duration-200" : ""}
               md:static md:h-auto md:w-60 md:border-r md:bg-white md:shadow-none
               md:block
             `}
          >
            {/* Mobile nav header */}
            <div className={`${navOpen ? "flex justify-between items-center border-b px-4 py-3" : "hidden"} md:hidden`}>
              <h2 className="font-semibold">Navigation</h2>
              <button
                onClick={() => setNavOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
                aria-label="Close navigation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={`${navOpen ? "p-4" : "p-4 md:p-6"} space-y-4 md:space-y-6 overflow-y-auto`}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">Sections</div>
              <ul className="space-y-1">
                {[
                  ["theme", "Theme"],
                  ["hero", "Hero"],
                  ["services", "Services (Home)"],
                  ["materials", "Materials (Calculators)"],
                  ["locations", "Locations"],
                  ["calculators", "Calculators"],
                ].map(([key, label]) => (
                  <li key={key}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(key);
                      }}
                      className={`w-full text-left rounded-md px-3 py-2 text-sm ${
                        openMap[key] ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium" : "hover:bg-gray-100"
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="border-t pt-4 space-y-2">
                <button
                  type="button"
                  onClick={expandAll}
                  className="w-full rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="w-full rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Collapse all
                </button>
                <button
                  type="button"
                  onClick={refreshFromServer}
                  className="w-full rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Refresh from server
                </button>
                <button
                  type="button"
                  onClick={discardChanges}
                  className="w-full rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Discard changes
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Form */}
        <main className="flex-1 overflow-y-auto">
          <form id="admin-form" onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
            {/* THEME */}
            <SectionCard
              id="theme"
              title="Theme"
              open={openMap.theme}
              onToggle={() => toggleExclusive("theme")}
            >
              <div className="grid md:grid-cols-[180px,1fr] gap-4 items-center">
                <div>
                  <label className={LABEL_CLS}>Primary Color</label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) =>
                      setValue("theme.primary", e.target.value, { shouldDirty: true, shouldValidate: true })
                    }
                    className="h-10 w-16 p-0 border-0 bg-transparent"
                    aria-label="Primary color picker"
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Primary Color (hex)</label>
                  <input
                    {...register("theme.primary")}
                    className={INPUT_CLS}
                    placeholder="#F69321"
                    spellCheck={false}
                    inputMode="text"
                  />
                  <p className={HELP_CLS}>Used across buttons, accents and highlights.</p>
                </div>
              </div>
              <div className="mt-4">
                <div
                  className="h-10 w-full rounded-md border"
                  style={{ background: primaryColor }}
                  title={primaryColor}
                />
              </div>
            </SectionCard>

            {/* HERO */}
            <SectionCard
              id="hero"
              title="Hero"
              open={openMap.hero}
              onToggle={() => toggleExclusive("hero")}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={LABEL_CLS}>Headline</label>
                  <input {...register("hero.headline")} className={INPUT_CLS} />
                  <p className={HELP_CLS}>Main message shown large over the video.</p>
                  <div className="mt-4">
                    <label className={LABEL_CLS}>Subhead</label>
                    <textarea {...register("hero.subhead")} rows={3} className={INPUT_CLS} />
                    <p className={HELP_CLS}>Short paragraph under the headline.</p>
                  </div>
                  <div className="mt-4">
                    <label className={LABEL_CLS}>Hero Video (mp4 URL)</label>
                    <input {...register("hero.video")} className={INPUT_CLS} placeholder="/hero-video.mp4" />
                    <input type="file" accept="video/mp4" onChange={onUploadVideo} className="mt-2 block text-sm" />
                    <p className={HELP_CLS}>Upload or paste a URL. Large files may take time to process.</p>
                  </div>
                </div>
                <div>
                  <label className={LABEL_CLS}>Preview</label>
                  <div className="rounded-md border overflow-hidden bg-black/5">
                    {heroVideo ? (
                      <video src={heroVideo} className="w-full h-48 object-cover" controls />
                    ) : (
                      <div className="h-48 grid place-items-center text-gray-500 text-sm">
                        No video selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* SERVICES */}
            <SectionCard
              id="services"
              title="Services (Home Tiles)"
              open={openMap.services}
              onToggle={() => toggleExclusive("services")}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => appendService({ title: "", desc: "", image: "" })}
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    + Add service
                  </button>
                </div>
              </div>
              {serviceFields.length === 0 && (
                <div className="text-sm text-gray-500">No services yet. Click &ldquo;Add service&rdquo;.</div>
              )}
              <div className="grid gap-4">
                {serviceFields.map((field, i) => {
                  const img = current?.products?.[i]?.image || "";
                  return (
                    <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Service {i + 1}</h3>
                        <div className="flex items-center gap-2">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => swapService(i, i - 1)}
                              className="rounded border px-2 py-1 text-xs hover:bg-gray-100"
                            >
                              ↑
                            </button>
                          )}
                          {i < serviceFields.length - 1 && (
                            <button
                              type="button"
                              onClick={() => swapService(i, i + 1)}
                              className="rounded border px-2 py-1 text-xs hover:bg-gray-100"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeService(i)}
                            className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-[200px,1fr] gap-4">
                        <div>
                          <div className="rounded-md border overflow-hidden bg-gray-100">
                            {img ? (
                              <img src={img} alt={`Service ${i + 1}`} className="w-full h-28 object-cover" />
                            ) : (
                              <div className="h-28 grid place-items-center text-gray-400 text-xs">No image</div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onUploadServiceImage(i)}
                            className="mt-2 block text-sm"
                          />
                        </div>
                        <div className="grid gap-3">
                          <div>
                            <label className={LABEL_CLS}>Title</label>
                            <input {...register(`products.${i}.title`)} className={INPUT_CLS} />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Description</label>
                            <input {...register(`products.${i}.desc`)} className={INPUT_CLS} />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Image URL</label>
                            <input {...register(`products.${i}.image`)} className={INPUT_CLS} placeholder="/materials.jpg" />
                            <p className={HELP_CLS}>You can paste a URL or use the uploader.</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <strong>Note:</strong> This section is for homepage tiles only. Calculator data lives under{" "}
                        <em>Materials (Calculators)</em>.
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* MATERIALS */}
            <SectionCard
              id="materials"
              title="Materials (Used by Calculators)"
              open={openMap.materials}
              onToggle={() => toggleExclusive("materials")}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      appendMaterial({
                        id: crypto.randomUUID(),
                        name: "",
                        category: "aggregate",
                        code: "",
                        densityLbPerFt3: "",
                        notes: "",
                        active: true,
                      })
                    }
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    + Add material
                  </button>
                </div>
              </div>
              {materialFields.length === 0 && (
                <div className="text-sm text-gray-500">
                  No materials yet. Click &ldquo;Add material&rdquo; to populate the calculators.
                </div>
              )}
              <div className="grid gap-4">
                {materialFields.map((field, i) => {
                  const lbft3 = Number(current?.materials?.[i]?.densityLbPerFt3) || 0;
                  const tPerYd3 = tonPerYd3(lbft3);
                  const yd3PerT = yd3PerTon(lbft3);
                  return (
                    <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Material {i + 1}</h3>
                        <div className="flex items-center gap-2">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => swapMaterial(i, i - 1)}
                              className="rounded border px-2 py-1 text-xs hover:bg-gray-100"
                            >
                              ↑
                            </button>
                          )}
                          {i < materialFields.length - 1 && (
                            <button
                              type="button"
                              onClick={() => swapMaterial(i, i + 1)}
                              className="rounded border px-2 py-1 text-xs hover:bg-gray-100"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMaterial(i)}
                            className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className={LABEL_CLS}>Name</label>
                          <input
                            {...register(`materials.${i}.name`)}
                            className={INPUT_CLS}
                            placeholder="#57 Gravel"
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Code / SKU (optional)</label>
                          <input {...register(`materials.${i}.code`)} className={INPUT_CLS} placeholder="e.g., AGG-57" />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Category</label>
                          <select {...register(`materials.${i}.category`)} className={INPUT_CLS}>
                            <option value="aggregate">aggregate</option>
                            <option value="sand_gravel">sand_gravel</option>
                            <option value="asphalt">asphalt</option>
                            <option value="concrete">concrete</option>
                            <option value="other">other</option>
                          </select>
                          <p className={HELP_CLS}>Used for grouping in dropdowns if needed.</p>
                        </div>
                        {/* SINGLE SOURCE OF TRUTH: lb/ft³ */}
                        <div>
                          <label className={LABEL_CLS}>Density — Pounds per Cubic Foot (lb/ft³)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            {...register(`materials.${i}.densityLbPerFt3`, { valueAsNumber: true })}
                            className={INPUT_CLS}
                            placeholder="e.g., 120"
                          />
                          <p className={HELP_CLS}>
                            Enter the lab/reported bulk density (e.g., #57 stone ≈ 120 lb/ft³).
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className={LABEL_CLS}>Notes (optional)</label>
                          <input
                            {...register(`materials.${i}.notes`)}
                            className={INPUT_CLS}
                            placeholder="Any sourcing, moisture or usage notes."
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" {...register(`materials.${i}.active`)} id={`mat-active-${i}`} />
                          <label htmlFor={`mat-active-${i}`} className="text-sm text-gray-700">
                            Active (show in calculators)
                          </label>
                        </div>
                      </div>
                      {/* Read-only previews */}
                      <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs text-gray-700">
                        <div className="rounded-md border p-3 bg-gray-100">
                          <div className="font-medium mb-1">Implied t/yd³</div>
                          <div>{lbft3 ? `${round3(tPerYd3)} t/yd³` : "—"}</div>
                        </div>
                        <div className="rounded-md border p-3 bg-gray-100">
                          <div className="font-medium mb-1">Implied yd³/ton</div>
                          <div>{lbft3 ? `${round3(yd3PerT)} yd³/ton` : "—"}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 rounded-md bg-blue-50 text-blue-900 text-sm p-3 border border-blue-200">
                <div className="font-medium mb-1">How calculators use this</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <strong>Aggregates</strong> reads <code>densityLbPerFt3</code> and computes tons directly (no
                    admin input in yd³ or tons).
                  </li>
                  <li>
                    <strong>Concrete</strong> only uses dimensions; density is not needed.
                  </li>
                </ul>
              </div>
            </SectionCard>

            {/* LOCATIONS */}
            <SectionCard
              id="locations"
              title="Locations"
              open={openMap.locations}
              onToggle={() => toggleExclusive("locations")}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      appendLocation({
                        id: crypto.randomUUID(),
                        name: "",
                        kind: "quarry",
                        established: "",
                        address1: "",
                        address2: "",
                        city: "",
                        state: "TN",
                        zip: "",
                        phone: "",
                        fax: "",
                        lat: "",
                        lng: "",
                        active: true,
                      })
                    }
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    + Add location
                  </button>
                </div>
              </div>
              {locationFields.length === 0 && (
                <div className="text-sm text-gray-500">No locations yet. Click &ldquo;Add location&rdquo;.</div>
              )}
              <div className="grid gap-4">
                {locationFields.map((field, i) => {
                  const loc = current?.locations?.[i] || {};
                  const addressPreview = [loc?.address1, loc?.address2, [loc?.city, loc?.state, loc?.zip].filter(Boolean).join(", ")].filter(Boolean).join(", ");
                  return (
                    <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Location {i + 1}</h3>
                        <div className="flex items-center gap-2">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => swapLocation(i, i - 1)}
                              className="rounded border px-2 py-1 text-xs hover:bg-gray-100"
                            >
                              ↑
                            </button>
                          )}
                          {i < locationFields.length - 1 && (
                            <button
                              type="button"
                              onClick={() => swapLocation(i, i + 1)}
                              className="rounded border px-2 py-1 text-xs hover:bg-gray-100"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeLocation(i)}
                            className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className={LABEL_CLS}>Name</label>
                          <input
                            {...register(`locations.${i}.name`)}
                            className={INPUT_CLS}
                            placeholder="Pottsville Quarry"
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Kind</label>
                          <select {...register(`locations.${i}.kind`)} className={INPUT_CLS}>
                            <option value="quarry">quarry</option>
                            <option value="plant">plant</option>
                            <option value="concrete">concrete</option>
                            <option value="paving_hq">paving_hq</option>
                            <option value="sand_gravel">sand_gravel</option>
                            <option value="yard">yard</option>
                            <option value="hq">hq</option>
                          </select>
                          <p className={HELP_CLS}>Used for filtering and badges.</p>
                        </div>

                        <div>
                          <label className={LABEL_CLS}>Established (YYYY or YYYY-MM-DD)</label>
                          <input {...register(`locations.${i}.established`)} className={INPUT_CLS} placeholder="2007-07-02" />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Phone</label>
                          <input {...register(`locations.${i}.phone`)} className={INPUT_CLS} placeholder="931-364-2655" />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Fax</label>
                          <input {...register(`locations.${i}.fax`)} className={INPUT_CLS} placeholder="931-364-4115" />
                        </div>

                        <div className="md:col-span-3 grid md:grid-cols-3 gap-4">
                          <div className="md:col-span-3">
                            <label className={LABEL_CLS}>Address 1</label>
                            <input {...register(`locations.${i}.address1`)} className={INPUT_CLS} placeholder="750 Highway 99" />
                          </div>
                          <div className="md:col-span-3">
                            <label className={LABEL_CLS}>Address 2</label>
                            <input {...register(`locations.${i}.address2`)} className={INPUT_CLS} placeholder="" />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>City</label>
                            <input {...register(`locations.${i}.city`)} className={INPUT_CLS} placeholder="Lewisburg" />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>State</label>
                            <input {...register(`locations.${i}.state`)} className={INPUT_CLS} placeholder="TN" />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Zip</label>
                            <input {...register(`locations.${i}.zip`)} className={INPUT_CLS} placeholder="37091" />
                          </div>
                        </div>

                        <div>
                          <label className={LABEL_CLS}>Latitude</label>
                          <input {...register(`locations.${i}.lat`)} className={INPUT_CLS} placeholder="35.86" />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Longitude</label>
                          <input {...register(`locations.${i}.lng`)} className={INPUT_CLS} placeholder="-86.66" />
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" {...register(`locations.${i}.active`)} id={`loc-active-${i}`} />
                          <label htmlFor={`loc-active-${i}`} className="text-sm text-gray-700">
                            Active
                          </label>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Preview:</span>{" "}
                          {addressPreview || <span className="text-gray-400">No address yet</span>}
                        </div>
                        <div className="mt-1">
                          <a
                            href={directionsUrl(loc)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            Open in Google Maps →{/* arrow to emphasise external link */}
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* CALCULATORS */}
            <SectionCard
              id="calculators"
              title="Calculators"
              open={openMap.calculators}
              onToggle={() => toggleExclusive("calculators")}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Aggregates</h3>
                  <label className={LABEL_CLS}>Default Waste Allowance (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    {...register("calculators.aggregates.defaultWastePct", { valueAsNumber: true })}
                    className={INPUT_CLS}
                    placeholder="10"
                  />
                  <p className={HELP_CLS}>Starting waste % in the Aggregates calculator (results shown in Tons).</p>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Concrete</h3>
                  <label className={LABEL_CLS}>Default Waste Allowance (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    {...register("calculators.concrete.defaultWastePct", { valueAsNumber: true })}
                    className={INPUT_CLS}
                    placeholder="10"
                  />
                  <p className={HELP_CLS}>Concrete calculator outputs cubic yards.</p>
                </div>
              </div>
            </SectionCard>
            {/* Spacer for bottom bar */}
            <div className="h-24" />
          </form>
        </main>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none">
        <div className="mx-auto max-w-7xl px-4 pb-4">
          <div
            className={`transition-all duration-200 ${
              isDirty ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3"
            }`}
          >
            <div className="rounded-xl border bg-white shadow-lg px-4 py-3 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 text-sm">
                {isDirty ? (
                  <span className="text-gray-700">You have unsaved changes.</span>
                ) : (
                  <span className="text-gray-500">All changes saved.</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={discardChanges}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={refreshFromServer}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Refresh
                </button>
                <button
                  type="submit"
                  form="admin-form"
                  className="rounded-md bg-[var(--color-primary)] text-white px-5 py-2 text-sm hover:opacity-95 disabled:opacity-60"
                  disabled={!isDirty || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme preview: sets the CSS variable used by CSS for primary color */}
      <style>{`:root{--color-primary:${primaryColor};}`}</style>
    </div>
  );
}