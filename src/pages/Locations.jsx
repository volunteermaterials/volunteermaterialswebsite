// src/pages/Locations.jsx
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useContent } from "../content/ContentContext.jsx";

import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

// Fix Vite + Leaflet default marker path issue by using CDN icons
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -30],
  shadowSize: [41, 41],
});

const centerTN = [35.8601, -86.6602]; // state-center fallback

// Helper for Google directions deeplink
const directionsUrl = (loc) => {
  const addr = [
    loc.address1,
    loc.address2,
    loc.city && `${loc.city},`,
    loc.state,
    loc.zip,
  ]
    .filter(Boolean)
    .join(" ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    addr || `${loc.lat},${loc.lng}`
  )}`;
};

function FitBoundsOnData({ points }) {
  const map = useMap();
  useEffect(() => {
    const withCoords = points.filter((p) => p.lat && p.lng);
    if (!withCoords.length) return;
    const bounds = L.latLngBounds(withCoords.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.2));
  }, [points, map]);
  return null;
}

export default function Locations() {
  const { content } = useContent();

  // ✅ Force scroll to top whenever this page mounts
  useEffect(() => {
    // Use the simplest, most compatible API for an immediate jump
    window.scrollTo(0, 0);
  }, []);

  const locations = content?.locations ?? [];
  const [activeId, setActiveId] = useState(null);

  // Basic kinds for quick filtering (optional)
  const kinds = useMemo(
    () => Array.from(new Set(locations.map((l) => l.kind).filter(Boolean))),
    [locations]
  );
  const [kindFilter, setKindFilter] = useState("all");

  const filtered = useMemo(() => {
    if (kindFilter === "all") return locations;
    return locations.filter((l) => l.kind === kindFilter);
  }, [locations, kindFilter]);

  // active location (selected from list)
  const active = useMemo(
    () => filtered.find((l) => l.id === activeId) || null,
    [filtered, activeId]
  );

  // Imperative flyTo when choosing from list
  function FlyToSelected({ target }) {
    const map = useMap();
    useEffect(() => {
      if (!target || !target.lat || !target.lng) return;
      map.flyTo([target.lat, target.lng], 12, { duration: 0.6 });
    }, [target, map]);
    return null;
  }

  return (
    <>
      <Navbar />
      <section className="min-h-screen pt-28 pb-16 px-6 bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-black/5 text-black/60">
              LOCATIONS
            </div>
            <h1 className="mt-3 text-4xl font-bold">Our Locations</h1>
            <p className="mt-2 text-[var(--color-muted)]">
              Browse yards, plants, and offices. Click a card to highlight it on the map.
            </p>
          </div>

          {/* Filters */}
          {kinds.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setKindFilter("all")}
                className={`px-3 py-1.5 rounded-full border ${
                  kindFilter === "all"
                    ? "bg-[var(--color-primary)] text-white border-transparent"
                    : "bg-white border-black/10 hover:bg-black/[.035]"
                }`}
              >
                All
              </button>
              {kinds.map((k) => (
                <button
                  key={k}
                  onClick={() => setKindFilter(k)}
                  className={`px-3 py-1.5 rounded-full border capitalize ${
                    kindFilter === k
                      ? "bg-[var(--color-primary)] text-white border-transparent"
                      : "bg-white border-black/10 hover:bg-black/[.035]"
                  }`}
                >
                  {k.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          )}

          {/* Force 2 columns from md and up without arbitrary grid-template */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* List (left) */}
            <div className="space-y-3 md:max-w-[420px] md:w-[420px] md:col-span-1">
              {filtered.length === 0 && (
                <div className="rounded-xl border border-black/10 bg-white p-6">
                  <div className="text-black/70">
                    No locations yet. Add them in Admin → Content → Locations.
                  </div>
                </div>
              )}

              {filtered.map((loc) => {
                const established =
                  loc.established &&
                  (loc.established.length === 4
                    ? loc.established
                    : new Date(loc.established).toLocaleDateString());
                const noCoords = !loc.lat || !loc.lng;

                return (
                  <button
                    key={loc.id}
                    onClick={() => setActiveId(loc.id)}
                    className={`w-full text-left rounded-xl border p-4 hover:shadow-sm transition bg-white ${
                      activeId === loc.id
                        ? "border-[var(--color-primary)]"
                        : "border-black/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-lg">{loc.name}</div>
                      {loc.kind && (
                        <span className="text-xs px-2 py-1 rounded-full bg-black/5 text-black/60 capitalize">
                          {loc.kind.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-sm text-black/70">
                      {loc.address1}
                      {loc.address2 ? `, ${loc.address2}` : ""}
                      <br />
                      {[loc.city, loc.state, loc.zip].filter(Boolean).join(", ")}
                    </div>

                    <div className="mt-2 text-sm text-black/60">
                      {established ? `Est. ${established}` : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {loc.phone && (
                        <a
                          href={`tel:${loc.phone.replace(/\D/g, "")}`}
                          className="text-[13px] underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {loc.phone}
                        </a>
                      )}
                      {loc.fax && (
                        <span className="text-[13px] text-black/50">
                          • Fax {loc.fax}
                        </span>
                      )}
                      <a
                        href={directionsUrl(loc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Directions →
                      </a>
                      {noCoords && (
                        <span className="text-[11px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                          no map pin (lat/lng missing)
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Map (right) */}
            <div className="rounded-2xl overflow-hidden border border-black/10 bg-white md:col-span-1">
              <MapContainer
                center={centerTN}
                zoom={7}
                scrollWheelZoom={true}
                className="h-[680px] w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBoundsOnData points={filtered.filter((l) => l.lat && l.lng)} />
                <FlyToSelected target={active} />

                {filtered
                  .filter((l) => l.lat && l.lng)
                  .map((loc) => (
                    <Marker
                      key={loc.id}
                      position={[loc.lat, loc.lng]}
                      icon={defaultIcon}
                      eventHandlers={{
                        click: () => setActiveId(loc.id),
                      }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">{loc.name}</div>
                          <div>
                            {loc.address1}
                            {loc.address2 ? `, ${loc.address2}` : ""}
                            <br />
                            {[loc.city, loc.state, loc.zip].filter(Boolean).join(", ")}
                          </div>
                          {loc.phone && (
                            <div className="mt-1">
                              <a
                                href={`tel:${loc.phone.replace(/\D/g, "")}`}
                                className="underline"
                              >
                                {loc.phone}
                              </a>
                            </div>
                          )}
                          <div className="mt-2">
                            <a
                              href={directionsUrl(loc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              Directions →
                            </a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
