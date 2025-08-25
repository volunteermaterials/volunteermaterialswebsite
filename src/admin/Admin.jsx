// src/admin/Admin.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useContent } from "../content/ContentContext";
import { useForm, useFieldArray } from "react-hook-form";

const INPUT_CLS =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent";
const LABEL_CLS = "block text-sm font-medium text-gray-700";
const HELP_CLS = "text-xs text-gray-500 mt-1";

export default function Admin() {
  const { logout, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { content, setContent, refetch } = useContent();

  // ---------- Form ----------
  const defaultValues = useMemo(
    () =>
      content || {
        theme: { primary: "#F69321" },
        hero: { headline: "", subhead: "", video: "" },
        products: [],
      },
    [content]
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue, // <-- used to sync color picker to the form field
    formState: { isDirty, isSubmitting },
  } = useForm({
    defaultValues,
    mode: "onChange",
  });

  // Products array helpers
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "products",
  });

  // Keep form in sync with context updates (e.g., after refetch)
  useEffect(() => {
    if (content) reset(content);
  }, [content, reset]);

  // Initial load once (StrictMode-safe) via context
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    refetch?.().catch((e) => console.warn("[Admin] initial refetch failed", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unsaved changes guard (fixed variable name in cleanup)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = ""; // Chrome requires returnValue to show prompt
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Watchers
  const current = watch();
  const primaryColor = current?.theme?.primary || "#F69321";
  const heroVideo = current?.hero?.video || "";

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        alert(`Save failed: ${res.status}\n${text}`);
        return;
      }

      // Update local context immediately
      setContent(data);

      // Ping other tabs/pages
      localStorage.setItem("content:updatedAt", String(Date.now()));

      // Confirm persisted write
      await refetch?.();

      reset(data); // clear dirty state
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

  const onUploadProductImage = (index) => async (e) => {
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

  if (!isAuthenticated) {
    return <div className="p-6">You must sign in to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Admin — Site Content</h1>
            <p className="text-xs text-gray-500">
              Update theme, hero, and product tiles. Changes are live after Save.
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

      {/* Content */}
      <main className="max-w-6xl mx-auto p-4 pb-28">
        {/* Anchor helper for scroll-offset */}
        <style>{`
          [data-anchor] { scroll-margin-top: 90px; }
        `}</style>

        <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6">
          {/* Left Nav */}
          <nav className="md:sticky md:top-[76px] md:self-start bg-white border rounded-xl p-3">
            <div className="text-xs font-semibold text-gray-500 px-2 mb-2">Sections</div>
            <ul className="space-y-1">
              <li>
                <a href="#theme" className="block rounded px-2 py-1 hover:bg-gray-100">
                  Theme
                </a>
              </li>
              <li>
                <a href="#hero" className="block rounded px-2 py-1 hover:bg-gray-100">
                  Hero
                </a>
              </li>
              <li>
                <a href="#products" className="block rounded px-2 py-1 hover:bg-gray-100">
                  Products
                </a>
              </li>
            </ul>

            <div className="mt-4 border-t pt-3">
              <button
                type="button"
                onClick={refreshFromServer}
                className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Refresh from server
              </button>
              <button
                type="button"
                onClick={discardChanges}
                className="mt-2 w-full rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Discard changes
              </button>
            </div>
          </nav>

          {/* Right Form */}
          <form id="admin-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* THEME */}
            <section id="theme" data-anchor className="bg-white border rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">Theme</h2>
              <div className="grid md:grid-cols-[160px,1fr] gap-4 items-center">
                <div>
                  <label className={LABEL_CLS}>Primary Color</label>
                  {/* Controlled color input: writes into the same RHF field */}
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) =>
                      setValue("theme.primary", e.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
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
                  <p className={HELP_CLS}>Used across buttons, accents, and highlights.</p>
                </div>
              </div>
              <div className="mt-4">
                <div
                  className="h-10 w-full rounded-lg border"
                  style={{ background: primaryColor }}
                  title={primaryColor}
                />
              </div>
            </section>

            {/* HERO */}
            <section id="hero" data-anchor className="bg-white border rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">Hero</h2>
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
                    <input
                      type="file"
                      accept="video/mp4"
                      onChange={onUploadVideo}
                      className="mt-2 block text-sm"
                    />
                    <p className={HELP_CLS}>Upload or paste a URL. Large files may take time to process.</p>
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLS}>Preview</label>
                  <div className="rounded-lg border overflow-hidden bg-black/5">
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
            </section>

            {/* PRODUCTS */}
            <section id="products" data-anchor className="bg-white border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Products</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => append({ title: "", desc: "", image: "" })}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    + Add product
                  </button>
                </div>
              </div>

              {fields.length === 0 && (
                <div className="text-sm text-gray-500">No products yet. Click “Add product”.</div>
              )}

              <div className="grid gap-4">
                {fields.map((field, i) => {
                  const img = current?.products?.[i]?.image || "";
                  return (
                    <div key={field.id} className="border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Item {i + 1}</h3>
                        <div className="flex items-center gap-2">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => swap(i, i - 1)}
                              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                            >
                              ↑
                            </button>
                          )}
                          {i < fields.length - 1 && (
                            <button
                              type="button"
                              onClick={() => swap(i, i + 1)}
                              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-[180px,1fr] gap-4">
                        <div>
                          <div className="rounded-lg border overflow-hidden bg-gray-50">
                            {img ? (
                              <img
                                src={img}
                                alt={`Product ${i + 1}`}
                                className="w-full h-28 object-cover"
                              />
                            ) : (
                              <div className="h-28 grid place-items-center text-gray-400 text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onUploadProductImage(i)}
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
                            <input
                              {...register(`products.${i}.image`)}
                              className={INPUT_CLS}
                              placeholder="/materials.jpg"
                            />
                            <p className={HELP_CLS}>You can paste a URL or use the uploader.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Spacer for bottom bar */}
            <div className="h-20" />
          </form>
        </div>
      </main>

      {/* Sticky Save Bar (uses form="admin-form" instead of formAction) */}
      <div className="fixed bottom-0 inset-x-0 z-50">
        <div className="mx-auto max-w-6xl px-4 pb-4">
          <div
            className={`${
              isDirty ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
            } transition-all`}
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
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={refreshFromServer}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Refresh
                </button>
                <button
                  type="submit"
                  form="admin-form"
                  className="rounded-lg bg-[var(--color-primary)] text-white px-5 py-2 text-sm hover:opacity-95 disabled:opacity-60"
                  disabled={!isDirty || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme preview style token */}
      <style>{`
        :root { --color-primary: ${primaryColor}; }
      `}</style>
    </div>
  );
}
