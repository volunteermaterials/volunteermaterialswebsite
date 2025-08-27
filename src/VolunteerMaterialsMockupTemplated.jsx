import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Truck,
  Timer,
  Handshake,
  Shield,
} from "lucide-react";

import Navbar from "./components/Navbar.jsx";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { useContent } from "./content/ContentContext.jsx";

// ---- Leaflet (overview map in CTA) ----
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

// Default marker icon via CDN (avoids local asset path issues)
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -30],
  shadowSize: [41, 41],
});
const centerTN = [35.8601, -86.6602];

// Fit map to all points
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

// ------------------------------
// Utilities
// ------------------------------
const cls = (...xs) => xs.filter(Boolean).join(" ");

const ensureUrl = (u) => {
  if (!u) return "";
  if (/^(https?:)?\/\//i.test(u) || /^data:/i.test(u)) return u;
  return u.startsWith("/") ? u : `/${u}`;
};

// Subtle shimmer for loading skeletons
const Shimmer = ({ className = "" }) => (
  <div
    className={cls(
      "animate-pulse bg-gradient-to-r from-black/5 via-black/10 to-black/5",
      className
    )}
  />
);

// Default content if none loaded
const DEFAULTS = {
  theme: { primary: "#F69321" },
  hero: {
    headline: "Building Tennessee’s Future",
    subhead:
      "Family-owned quarry & materials supplier trusted by builders, paving crews, and concrete projects across Tennessee since 2007.",
    video: "/hero-video.mp4",
  },
  products: [
    {
      name: "Construction Aggregates",
      description: "Industrial and construction grade.",
      image: "/materials.jpg",
    },
    {
      name: "Road Construction and Paving",
      description: "Premium aggregates for all jobs.",
      image: "/sand-gravel.jpg",
    },
    {
      name: "Asphalt",
      description: "Durable asphalt for long-lasting roads.",
      image: "/paving.jpg",
    },
    {
      name: "Ready Mix Concrete",
      description: "Ready-mix concrete that performs.",
      image: "/concrete.jpg",
    },
  ],
  // Parent company defaults (overridable via content)
  parentCompany: {
    show: true,
    sectionTitle: "An Armada Materials Company", // exact text as requested
    name: "Armada Materials",
    url: "https://www.armadamaterials.com",
    logo: "/armada-logo.png", // place real file in /public or set via content
  },
};

// ------------------------------
// Section: Hero
// ------------------------------
const Hero = ({ hero }) => {
  const headline = hero?.headline || DEFAULTS.hero.headline;
  const subhead = hero?.subhead || DEFAULTS.hero.subhead;
  const videoSrc = ensureUrl(hero?.video || DEFAULTS.hero.video);

  return (
    <section id="hero" className="relative h-[100vh] flex items-center justify-center overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-110"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 px-6 items-center"
      >
        <div className="text-white">
          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            {headline}
          </h1>
          <p className="text-xl md:text-2xl max-w-xl mb-8 text-white/90">{subhead}</p>
          <div className="flex gap-6 flex-wrap">
            <a href="tel:+19313642655" aria-label="Call Volunteer Materials">
              <Button className="rounded-full px-8 py-4 text-lg shadow-2xl">
                Call Now (931) 364-2655
              </Button>
            </a>
            <Link to="/quote">
              <Button
                variant="outline"
                className="px-8 py-4 text-lg rounded-full border-white text-white hover:bg-white hover:text-black"
              >
                Request a Callback
              </Button>
            </Link>
          </div>
        </div>

        <div className="hidden md:block bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold mb-4 text-white">Why Choose Us?</h3>
          <ul className="space-y-4 text-lg text-white/90">
            <li className="flex items-center gap-2">
              <Shield size={18} className="text-[var(--color-primary)]" /> Trusted Quality Stone
              Since 2007
            </li>
            <li className="flex items-center gap-2">
              <Timer size={18} className="text-[var(--color-primary)]" /> On-Time Delivery, No
              Surprises
            </li>
            <li className="flex items-center gap-2">
              <Truck size={18} className="text-[var(--color-primary)]" /> Full Range of Materials
              in One Place
            </li>
            <li className="flex items-center gap-2">
              <Handshake size={18} className="text-[var(--color-primary)]" /> Local, Family-Owned
              & Tennessee Proud
            </li>
          </ul>
        </div>
      </motion.div>

      <div className="absolute bottom-10 inset-x-0 flex justify-center z-10">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-1 animate-bounce">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      </div>
    </section>
  );
};

// ------------------------------
// Section: Partner badges
// ------------------------------
const PartnerBadges = () => (
  <section className="relative py-6 bg-gray-100">
    <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center gap-6 justify-between">
      <div className="flex items-center gap-3 text-[var(--color-text)]/80">
        <img src="/tn-flag.png" alt="Tennessee flag" className="h-12" />
        <p className="text-sm md:text-base">Proudly serving Tennessee contractors & communities</p>
      </div>
      <div className="flex items-center gap-6 opacity-80">
        {["/dot-logo.png", "/contractors-assoc.png", "/safety-cert.png"].map((l, i) => (
          <img key={i} src={l} className="h-8" alt="Certification logo" loading="lazy" />
        ))}
      </div>
    </div>
  </section>
);

// ------------------------------
// Section: Products grid
// ------------------------------
const ProductsGrid = ({ products }) => {
  const items = (products?.length ? products : DEFAULTS.products).slice(0, 4);

  return (
    <section id="materials" className="relative py-24 px-6 section-split">
      <div className="absolute inset-x-0 top-0 h-28 bg-grid-slate pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-black/5 text-black/60">
            OUR SERVICES
          </div>
          <h2 className="mt-4 text-5xl font-bold">What We Offer</h2>
          <p className="mt-3 text-[var(--color-muted)] max-w-2xl mx-auto">
            Aggregates, paving, and concrete—reliable quality from one trusted supplier.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {items.map((item, i) => {
            const title = item.title ?? item.name ?? "Product";
            const desc = item.desc ?? item.description ?? "";
            const img = ensureUrl(item.img ?? item.image ?? "/materials.jpg");

            return (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden border border-black/[.06] bg-[var(--color-surface)] lift"
              >
                <div className="relative h-44">
                  <img src={img} alt={title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="relative p-6 card-accent">
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-[var(--color-muted)]">{desc}</p>

                  <div className="my-5 h-px divider-faint" />
                  <div className="flex flex-wrap gap-2">
                    {["DOT-Ready", "Local sourcing", "Fast lead times"].map((chip, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-full bg-black/5 text-black/60"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  <button className="mt-6 text-[var(--color-primary)] font-semibold inline-flex items-center">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ------------------------------
// Section: Mission & Impact
// ------------------------------
const Mission = () => (
  <section id="mission" className="relative py-28 mission-wrap">
    <div className="absolute inset-x-0 top-0 h-28 bg-grid-faint pointer-events-none" />

    <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-black/5 text-black/60">
          OUR MISSION
        </div>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold">Mission &amp; Impact</h2>
        <p className="mt-4 text-lg text-[var(--color-muted)]">
          We exist to make Tennessee’s infrastructure stronger—supplying reliable materials,
          on-time logistics, and service you can count on. Privately owned since 2007, we
          invest in people, safety, and communities first.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="stat">
            <div className="kpi text-3xl">+700</div>
            <div className="text-xs text-black/60">Projects/year</div>
          </div>
          <div className="stat">
            <div className="kpi text-3xl">99.2%</div>
            <div className="text-xs text-black/60">On-time delivery</div>
          </div>
          <div className="stat">
            <div className="kpi text-3xl">2007</div>
            <div className="text-xs text-black/60">Family-owned</div>
          </div>
        </div>

        <div className="my-8 hr-soft" />

        <ol className="grid gap-4 text-sm">
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]/80"></span>
            <div>
              <div className="font-medium">2007 — Founded in Lewisburg</div>
              <div className="text-black/60">
                Started with one quarry and a promise: quality stone, honest lead times.
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]/80"></span>
            <div>
              <div className="font-medium">2016 — Added paving & logistics</div>
              <div className="text-black/60">
                Expanded fleet and dispatch to streamline delivery windows.
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]/80"></span>
            <div>
              <div className="font-medium">Today — Full aggregate portfolio</div>
              <div className="text-black/60">
                Sand, gravel, specialty stone, and ready-mix partnerships statewide.
              </div>
            </div>
          </li>
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          {["DOT-spec", "E-ticketing", "Live ETAs", "Reclaimed options"].map((c) => (
            <span key={c} className="badge-chip text-xs px-3 py-1 rounded-full">
              {c}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <a href="#materials">
            <button className="inline-flex items-center px-5 py-3 rounded-full bg-[var(--color-primary)] text-white font-semibold hover:opacity-90">
              Explore Materials
            </button>
          </a>
          <a href="#locations">
            <button className="inline-flex items-center px-5 py-3 rounded-full border border-black/15 text-black hover:bg-black/[.035]">
              See Delivery Areas
            </button>
          </a>
        </div>
      </div>

      <div className="relative">
        <div className="relative rounded-3xl overflow-hidden angle-mask shadow-lg border border-black/[.06]">
          <img
            src="/about-us.jpg"
            alt="Volunteer Materials team at site"
            className="w-full h-[460px] object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        </div>

        <div className="absolute -bottom-6 left-6 right-6 md:left-auto md:right-[-10%] md:w-[70%]">
          <div className="rounded-2xl bg-white/90 backdrop-blur border border-black/[.06] shadow-xl p-6">
            <p className="text-[15px] text-black/80 italic leading-relaxed">
              “Our job is simple: deliver exactly what crews need, exactly when they need
              it—no surprises. That’s how you build trust.”
            </p>
            <div className="mt-4 flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Volunteer Materials logo"
                className="h-8 w-8 rounded-lg object-contain bg-black/5 p-1"
              />
              <div>
                <div className="text-sm font-semibold">VP of Aggregates</div>
                <div className="text-xs text-black/60">Volunteer Materials</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ------------------------------
// Section: Why Us
// ------------------------------
const WhyUs = () => {
  const items = [
    { Icon: Shield, title: "Trusted, Tested Quality", desc: "Supplying premium stone since 2007." },
    { Icon: Timer, title: "On-Time Delivery", desc: "Fast, accurate delivery with no surprises." },
    { Icon: Handshake, title: "Reliable Partners", desc: "Contractors count on us for support." },
    { Icon: Truck, title: "Full Stone Range", desc: "All essential materials from one source." },
  ];

  return (
    <section id="why" className="relative py-24 px-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-48 bg-black/[.03]" />
        <div className="absolute inset-x-0 top-48 h-48 bg-black/[.02]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-black/5 text-black/60">
            WHY US
          </div>
          <h2 className="mt-4 text-4xl font-bold">Why Volunteer Materials</h2>
          <p className="mt-3 text-[var(--color-muted)] max-w-2xl mx-auto">
            Proven quality, dependable timelines, and a partner that’s easy to work with.
          </p>
        </div>

        <div className="relative grid md:grid-cols-2 gap-8">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-black/10" />
          {items.map((item, i) => (
            <div
              key={i}
              className="relative rounded-2xl border border-black/[.06] bg-[var(--color-surface)] p-6 shadow-sm lift"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-[var(--color-primary)]/10">
                    <item.Icon size={22} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="absolute inset-0 -z-10 rounded-xl ring-8 ring-[var(--color-primary)]/5" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="mt-1 text-[var(--color-muted)]">{item.desc}</p>
                  <div className="my-5 h-px divider-faint" />
                  <ul className="grid grid-cols-2 gap-2 text-sm text-black/70">
                    {["QA reports", "DOT spec", "Local dispatch", "Live ETAs"].map((b, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]/70" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ------------------------------
// Section: Testimonials
// ------------------------------
const Testimonials = () => (
  <section className="relative bg-[#0f172a] py-24 px-6 text-white">
    <div
      className="absolute inset-0 bg-[url('/quarry-pattern.png')] bg-cover bg-center opacity-10"
      aria-hidden="true"
    />
    <div className="relative max-w-3xl mx-auto grid md:grid-cols-2 gap-16 items-center">
      <img
        src="/testimonial.jpg"
        alt="Customer testimonial"
        className="rounded-3xl shadow-lg object-cover"
        loading="lazy"
      />
      <div>
        <h2 className="text-4xl font-bold mb-8">Testimonials</h2>
        <blockquote className="text-2xl italic leading-relaxed mb-6 text-white/90">
          “I have used this company several times a year for the last 7 years. They never
          disappoint. Good customer service, same-day delivery, and good prices.”
        </blockquote>
        <p className="text-[var(--color-primary)] font-semibold">
          – Tennessee Horse Trails and Campgrounds
        </p>
      </div>
    </div>
  </section>
);

// ------------------------------
// Section: Credit CTA
// ------------------------------
const CreditCTA = () => (
  <section
    className="relative py-24 bg-fixed bg-center bg-cover text-white text-center"
    style={{ backgroundImage: "url('/credit-bg.jpg')" }}
  >
    <div className="bg-black/60 absolute inset-0" />
    <div className="relative z-10 max-w-3xl mx-auto">
      <h2 className="text-5xl font-extrabold mb-6">Need a Line of Credit?</h2>
      <p className="mb-8 text-lg">
        Submit a credit application to get started with billing terms for your next project.
      </p>
      <a href="/VMAT-Credit-Application.pdf" target="_blank" rel="noopener noreferrer">
        <Button className="px-8 py-4 text-lg rounded-full shadow-xl">Apply for Credit</Button>
      </a>
    </div>
  </section>
);

// ------------------------------
// Section: Process
// ------------------------------
const Process = () => {
  const steps = [
    { step: "01", title: "Connect", desc: "Give us a call or send a quote request." },
    { step: "02", title: "Deliver", desc: "We handle logistics, scheduling, and prep." },
    { step: "03", title: "Build", desc: "Job-site tested products you can trust." },
    { step: "04", title: "Support", desc: "We’re here for estimates, advice & more." },
  ];

  return (
    <section id="process" className="py-24 px-6 bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Our Simple Process</h2>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {steps.map((item, i) => (
            <Card
              key={i}
              className="rounded-2xl shadow-md hover:shadow-xl transition bg-[var(--color-surface)] border border-gray-100"
            >
              <CardContent className="p-8">
                <div className="text-6xl font-extrabold text-gray-300 mb-6">{item.step}</div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-[var(--color-muted)]">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// ------------------------------
// Section: FAQ
// ------------------------------
const FAQ = () => {
  const qa = [
    {
      q: "What products does Volunteer Materials offer?",
      a: "We provide stone, sand, gravel, paving asphalt, and ready-mix concrete.",
    },
    {
      q: "Where are the company’s locations?",
      a: "We are based in Lewisburg and serve surrounding regions in Tennessee.",
    },
    {
      q: "How do I order concrete or aggregates?",
      a: "You can call us directly or request a callback through our website.",
    },
    {
      q: "Do you offer online tools for estimating quantities?",
      a: "Yes, our team provides digital tools and calculators for accurate estimates.",
    },
    {
      q: "What are the hours and best way to reach you?",
      a: "We are available Monday–Friday by phone and email.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-gray-50 px-6 max-w-5xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
      <div className="space-y-6">
        {qa.map((item, i) => (
          <details key={i} className="bg-white rounded-xl shadow-md p-6">
            <summary className="cursor-pointer text-lg font-semibold mb-2">{item.q}</summary>
            <p className="text-[var(--color-muted)] mt-2">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

// ------------------------------
// Map preview for CTA (overview only)
// ------------------------------
function LocationsOverviewMap({ locations = [] }) {
  const points = useMemo(
    () => locations.filter((l) => l.lat && l.lng),
    [locations]
  );

  return (
    <div className="rounded-3xl shadow-lg overflow-hidden border border-white/20">
      <MapContainer
        center={centerTN}
        zoom={7}
        scrollWheelZoom={false}
        zoomControl={false}               // avoid needing Leaflet CSS for controls
        className="h-[320px] md:h-[360px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBoundsOnData points={points} />
        {points.map((loc) => (
          <Marker
            key={loc.id || `${loc.name}-${loc.lat}-${loc.lng}`}
            position={[loc.lat, loc.lng]}
            icon={defaultIcon}
          />
        ))}
      </MapContainer>
    </div>
  );
}

// ------------------------------
// Section: Locations CTA (now shows Leaflet map)
// ------------------------------
const LocationsCTA = ({ locations }) => (
  <section
    id="locations"
    className="py-24 px-6 text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90"
  >
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
      <div>
        <h2 className="text-4xl font-bold mb-6">Supplying Projects Across the Region</h2>
        <p className="mb-8 text-lg text-white/90">
          From highways to home developments, we deliver quality materials where and when you need
          them.
        </p>
        <Link to="/locations">
          <Button className="bg-black text-[var(--color-primary)] hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-lg">
            View Our Locations
          </Button>
        </Link>
      </div>

      {/* Replaced the image with a live Leaflet overview map */}
      <LocationsOverviewMap locations={locations} />
    </div>
  </section>
);

// ------------------------------
// Section: Footer (Armada block directly under Certifications)
// ------------------------------
const Footer = ({ parent }) => {
  const parentEnabled = parent?.show !== false && (parent?.logo || parent?.name);
  const parentLogo = ensureUrl(parent?.logo);
  const parentUrl = parent?.url || "https://www.armadamaterials.com";
  const parentName = parent?.name || "Armada Materials";
  const sectionTitle = "An Armada Materials Company"; // exact title only

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Volunteer Materials",
    url: typeof window !== "undefined" ? window.location.origin : undefined,
    parentOrganization: {
      "@type": "Organization",
      name: parentName,
      url: parentUrl,
    },
  };

  return (
    <footer id="contact" className="pt-8 px-6" style={{ background: "var(--color-dark)" }}>
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-gray-300">
        <div>
          <img src="/logo.png" alt="Volunteer Materials" className="h-18 mb-6" />
          <p>
            Helping Tennessee build stronger communities with ready-to-use materials, quality
            resources, and reliable service since 2007.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <a href="#materials" className="hover:text-white">
                Materials
              </a>
            </li>
            <li>
              <a href="#why" className="hover:text-white">
                Why Us
              </a>
            </li>
            <li>
              <a href="#process" className="hover:text-white">
                Process
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-white">
                FAQ
              </a>
            </li>
            <li>
              <Link to="/careers" className="hover:text-white">
                Careers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <MapPin size={18} /> 750 Highway 99, Lewisburg, TN
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} /> (931) 364-2655
            </li>
            <li className="flex items-center gap-2">
              <Mail size={18} /> info@volunteermaterials.com
            </li>
          </ul>
        </div>

        {/* Certifications column */}
        <div>
          <h4 className="font-semibold text-white mb-4">Certifications</h4>
          <div className="flex flex-wrap items-center gap-4">
            <img src="/dot-logo.png" alt="DOT certification" className="h-10" loading="lazy" />
            <img src="/contractors-assoc.png" alt="Contractors association" className="h-10" loading="lazy" />
          </div>

          {/* Armada block: directly under Certifications */}
          {parentEnabled && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-white font-semibold mb-3">{sectionTitle}</div>
              <a
                href={parentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 hover:opacity-90"
                aria-label={`${parentName} website`}
                title={parentName}
              >
                {parentLogo ? (
                  <img
                    src={parentLogo}
                    alt={`${parentName} logo`}
                    className="h-8 object-contain"
                    loading="lazy"
                    width="160"
                    height="32"
                  />
                ) : (
                  <span className="font-semibold underline text-gray-200">{parentName}</span>
                )}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-gray-400 mt-12 border-t border-white/10 pt-8 pb-10">
        © {new Date().getFullYear()} Volunteer Materials. All rights reserved.
      </div>

      {/* Minimal JSON-LD to reflect parent relationship */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
    </footer>
  );
};

// ------------------------------
// Main Page Component
// ------------------------------
export default function VolunteerMaterialsMockupTemplated() {
  const { content, loading, error, refetch } = useContent();

  // Theme + Content extraction with fallbacks
  const primary = content?.theme?.primary ?? DEFAULTS.theme.primary;
  const hero = content?.hero ?? DEFAULTS.hero;
  const products = content?.products ?? DEFAULTS.products;
  const parentCompany = content?.parentCompany ?? DEFAULTS.parentCompany;
  const locations = content?.locations ?? []; // <-- pass to CTA map

  // Sync CSS variable with content theme
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", primary);
  }, [primary]);

  // Live refresh on Admin save (localStorage ping)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "content:updatedAt") {
        if (typeof refetch === "function") {
          refetch().catch(() => {});
        } else {
          window.location.reload();
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refetch]);

  const page = (
    <div className="font-sans text-[var(--color-text)]">
      <style>{`
        :root {
          --color-primary: ${primary};
          --color-bg: #ffffff;
          --color-surface: #ffffff;
          --color-text: #111827;
          --color-muted: #6b7280;
          --color-dark: #797a7cff;
          --nav-height: 72px;
        }
        /* Make anchor jumps land below a fixed/sticky navbar */
        section[id] { scroll-margin-top: calc(var(--nav-height) + 8px); }
        .bg-grid-slate {
          background:
            linear-gradient(transparent 23px, rgba(0,0,0,0.04) 24px),
            linear-gradient(90deg, transparent 23px, rgba(0,0,0,0.04) 24px);
          background-size: 24px 24px;
        }
        .bg-grid-faint {
          background:
            linear-gradient(transparent 23px, rgba(0,0,0,0.03) 24px),
            linear-gradient(90deg, transparent 23px, rgba(0,0,0,0.03) 24px);
          background-size: 24px 24px;
        }
        .divider-faint { background: linear-gradient(to right, rgba(0,0,0,.06), rgba(0,0,0,.06)); }
        .badge-chip { background: rgba(0,0,0,.05); color: rgba(0,0,0,.6); }
        .lift { transition: transform .2s ease, box-shadow .2s ease; }
        .lift:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,.08); }
        .hr-soft { height:1px; background: rgba(0,0,0,.08); }
        .angle-mask::after { content:""; position:absolute; inset:0; mask: linear-gradient(180deg, black 80%, transparent); }
      `}</style>

      {/* NAVBAR */}
      <Navbar />

      <Hero hero={hero} />
      <PartnerBadges />
      <ProductsGrid products={products} />
      <Mission />
      <WhyUs />
      <Testimonials />
      <CreditCTA />
      <Process />
      <FAQ />
      {/* Pass locations into CTA to render overview map */}
      <LocationsCTA locations={locations} />
      <Footer parent={parentCompany} />
    </div>
  );

  /* if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="p-4 bg-red-50 text-red-700 border-b border-red-200">
          Failed to load content. Showing defaults.
        </div>
        {page}
      </div>
    );*/
  

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="relative h-[60vh] bg-black/5">
          <div className="absolute inset-0">
            <Shimmer className="w-full h-full" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center px-6">
            <div className="w-full md:max-w-xl space-y-4">
              <Shimmer className="h-10 rounded" />
              <Shimmer className="h-6 rounded w-5/6" />
              <div className="flex gap-3 pt-2">
                <Shimmer className="h-10 w-40 rounded-full" />
                <Shimmer className="h-10 w-56 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <Shimmer className="h-9 w-72 rounded mb-6" />
            <div className="grid md:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-black/[.06] overflow-hidden">
                  <Shimmer className="h-44 w-full" />
                  <div className="p-6 space-y-3">
                    <Shimmer className="h-6 w-1/2 rounded" />
                    <Shimmer className="h-4 w-5/6 rounded" />
                    <div className="pt-2">
                      <Shimmer className="h-6 w-24 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return page;
}
