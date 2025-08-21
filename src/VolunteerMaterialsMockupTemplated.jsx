import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"
import { motion } from "framer-motion"
import { ArrowRight, MapPin, Phone, Mail, Truck, Timer, Handshake, Shield } from "lucide-react"
import { Link } from 'react-router-dom'

export default function VolunteerMaterialsMockupTemplated() {
  return (
    <div className="font-sans text-[var(--color-text)]">
      <style>{`
        :root {
          --color-primary: #F69321;
          --color-bg: #ffffff;
          --color-surface: #ffffff;
          --color-text: #111827;
          --color-muted: #6b7280;
          --color-dark: #797a7cff;
        }
      `}</style>

      
      <section id="hero" className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover scale-110">
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 px-6 items-center">
          <div className="text-white">
            <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">Building Tennessee’s Future</h1>
            <p className="text-xl md:text-2xl max-w-xl mb-8 text-white/90">Family-owned quarry & materials supplier trusted by builders, paving crews, and concrete projects across Tennessee since 2007.</p>
            <div className="flex gap-6 flex-wrap">
              <Button className="rounded-full px-8 py-4 text-lg shadow-2xl">Call Now (931) 364-2655</Button>
              <Button variant="outline" className="px-8 py-4 text-lg rounded-full border-white text-white hover:bg-white hover:text-black">Request a Callback</Button>
            </div>
          </div>

          <div className="hidden md:block bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-white">Why Choose Us?</h3>
            <ul className="space-y-4 text-lg text-white/90">
              <li className="flex items-center gap-2"><Shield size={18} className="text-[var(--color-primary)]" /> Trusted Quality Stone Since 2007</li>
              <li className="flex items-center gap-2"><Timer size={18} className="text-[var(--color-primary)]" /> On-Time Delivery, No Surprises</li>
              <li className="flex items-center gap-2"><Truck size={18} className="text-[var(--color-primary)]" /> Full Range of Materials in One Place</li>
              <li className="flex items-center gap-2"><Handshake size={18} className="text-[var(--color-primary)]" /> Local, Family-Owned & Tennessee Proud</li>
            </ul>
          </div>
        </motion.div>

        <div className="absolute bottom-10 inset-x-0 flex justify-center z-10">
          <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-1 animate-bounce">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      <section className="relative py-6 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center gap-6 justify-between">
          <div className="flex items-center gap-3 text-[var(--color-text)]/80">
            <img src="/tn-flag.png" alt="Tennessee" className="h-12" />
            <p className="text-sm md:text-base">Proudly serving Tennessee contractors & communities</p>
          </div>
          <div className="flex items-center gap-6 opacity-80">
            {['/dot-logo.png','/contractors-assoc.png','/safety-cert.png'].map((l,i)=>(<img key={i} src={l} className="h-8"/>))}
          </div>
        </div>
      </section>

{/* WHAT WE OFFER — refined separation */}
<section id="materials" className="relative py-24 px-6 section-split">
  {/* thin grid band behind the heading for texture */}
  <div className="absolute inset-x-0 top-0 h-28 bg-grid-slate pointer-events-none" />

  <div className="relative max-w-7xl mx-auto">
    <div className="text-center mb-14">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-black/5 text-black/60">
        OUR PRODUCTS
      </div>
      <h2 className="mt-4 text-5xl font-bold">What We Offer</h2>
      <p className="mt-3 text-[var(--color-muted)] max-w-2xl mx-auto">
        Aggregates, paving, and concrete—reliable quality from one trusted supplier.
      </p>
    </div>

    <div className="grid md:grid-cols-4 gap-8">
      {[
        { title: 'Construction Aggregates', img: '/materials.jpg', desc: 'Industrial and construction grade.' },
        { title: 'Road Construction and Paving', img: '/sand-gravel.jpg', desc: 'Premium aggregates for all jobs.' },
        { title: 'Asphalt', img: '/paving.jpg', desc: 'Durable asphalt for long-lasting roads.' },
        { title: 'Ready Mix Concrete', img: '/concrete.jpg', desc: 'Ready-mix concrete that performs.' },
      ].map((item,i)=> (
        <div
          key={i}
          className="relative rounded-2xl overflow-hidden border border-black/[.06] bg-[var(--color-surface)] lift"
        >
          {/* image */}
          <div className="relative h-44">
            <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
            {/* soft gradient at bottom of image */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* content */}
          <div className="relative p-6 card-accent">
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p className="mt-2 text-[var(--color-muted)]">{item.desc}</p>

            {/* faint divider + feature chips */}
            <div className="my-5 h-px divider-faint" />
            <div className="flex flex-wrap gap-2">
              {['DOT-Ready','Local sourcing','Fast lead times'].map((chip, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-black/5 text-black/60">
                  {chip}
                </span>
              ))}
            </div>

            <button className="mt-6 text-[var(--color-primary)] font-semibold inline-flex items-center">
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


{/* MISSION & IMPACT — elevated */}
<section id="mission" className="relative py-28 mission-wrap">
  {/* faint grid band behind heading */}
  <div className="absolute inset-x-0 top-0 h-28 bg-grid-faint pointer-events-none" />

  <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
    {/* Left: copy + stats + timeline */}
    <div>
      {/* eyebrow + headline */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-black/5 text-black/60">
        OUR MISSION
      </div>
      <h2 className="mt-4 text-4xl md:text-5xl font-bold">
        Mission &amp; Impact
      </h2>
      <p className="mt-4 text-lg text-[var(--color-muted)]">
        We exist to make Tennessee’s infrastructure stronger—supplying reliable materials,
        on-time logistics, and service you can count on. Privately owned since 2007, we invest
        in people, safety, and communities first.
      </p>

      {/* stat row */}
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

      {/* faint divider */}
      <div className="my-8 hr-soft" />

      {/* timeline */}
      <ol className="grid gap-4 text-sm">
        <li className="flex items-start gap-3">
          <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]/80"></span>
          <div>
            <div className="font-medium">2007 — Founded in Lewisburg</div>
            <div className="text-black/60">Started with one quarry and a promise: quality stone, honest lead times.</div>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]/80"></span>
          <div>
            <div className="font-medium">2016 — Added paving & logistics</div>
            <div className="text-black/60">Expanded fleet and dispatch to streamline delivery windows.</div>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]/80"></span>
          <div>
            <div className="font-medium">Today — Full aggregate portfolio</div>
            <div className="text-black/60">Sand, gravel, specialty stone, and ready-mix partnerships statewide.</div>
          </div>
        </li>
      </ol>

      {/* capability chips + CTA */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        {['DOT-spec', 'E-ticketing', 'Live ETAs', 'Reclaimed options'].map((c) => (
          <span key={c} className="badge-chip text-xs px-3 py-1 rounded-full">{c}</span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-4">
        <button className="inline-flex items-center px-5 py-3 rounded-full bg-[var(--color-primary)] text-white font-semibold hover:opacity-90">
          Explore Materials
        </button>
        <button className="inline-flex items-center px-5 py-3 rounded-full border border-black/15 text-black hover:bg-black/[.035]">
          See Delivery Areas
        </button>
      </div>
    </div>

    {/* Right: collage image with quote overlay */}
    <div className="relative">
      {/* large image with angled mask */}
      <div className="relative rounded-3xl overflow-hidden angle-mask shadow-lg border border-black/[.06]">
        <img
          src="/about-us.jpg"
          alt="Volunteer Materials team at site"
          className="w-full h-[460px] object-cover"
        />
        {/* soft vignette for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </div>

      {/* floating quote card */}
      <div className="absolute -bottom-6 left-6 right-6 md:left-auto md:right-[-10%] md:w-[70%]">
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-black/[.06] shadow-xl p-6">
          <p className="text-[15px] text-black/80 italic leading-relaxed">
            “Our job is simple: deliver exactly what crews need, exactly when they need it—
            no surprises. That’s how you build trust.”
          </p>
          <div className="mt-4 flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg object-contain bg-black/5 p-1" />
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


 {/* WHY VOLUNTEER MATERIALS — structured + interesting */}
<section id="why" className="relative py-24 px-6">
  {/* stepped background blocks for depth without “coloring the page” */}
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
      {/* vertical connector line on desktop for visual rhythm */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-black/10" />

      {[
        { Icon: Shield, title: 'Trusted, Tested Quality', desc: 'Supplying premium stone since 2007.' },
        { Icon: Timer, title: 'On-Time Delivery', desc: 'Fast, accurate delivery with no surprises.' },
        { Icon: Handshake, title: 'Reliable Partners', desc: 'Contractors count on us for support.' },
        { Icon: Truck, title: 'Full Stone Range', desc: 'All essential materials from one source.' },
      ].map((item, i) => (
        <div
          key={i}
          className="relative rounded-2xl border border-black/[.06] bg-[var(--color-surface)] p-6 shadow-sm lift"
        >
          <div className="flex items-start gap-4">
            {/* icon badge with soft ring */}
            <div className="relative">
              <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-[var(--color-primary)]/10">
                <item.Icon size={22} className="text-[var(--color-primary)]" />
              </div>
              <div className="absolute inset-0 -z-10 rounded-xl ring-8 ring-[var(--color-primary)]/5" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="mt-1 text-[var(--color-muted)]">{item.desc}</p>

              {/* faint row divider for breathing room */}
              <div className="my-5 h-px divider-faint" />

              {/* bullet list keeps the card visually active without heavy color */}
              <ul className="grid grid-cols-2 gap-2 text-sm text-black/70">
                {['QA reports', 'DOT spec', 'Local dispatch', 'Live ETAs'].map((b, idx) => (
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

      <section className="relative bg-[#0f172a] py-24 px-6 text-white">
        <div className="absolute inset-0 bg-[url('/quarry-pattern.png')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-3xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <img src="/testimonial.jpg" alt="testimonial" className="rounded-3xl shadow-lg object-cover" />
          <div>
            <h2 className="text-4xl font-bold mb-8">Testimonials</h2>
            <blockquote className="text-2xl italic leading-relaxed mb-6 text-white/90">“I have used this company several times a year for the last 7 years. They never disappoint. Good customer service, same-day delivery, and good prices.”</blockquote>
            <p className="text-[var(--color-primary)] font-semibold">– Tennessee Horse Trails and Campgrounds</p>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-fixed bg-center bg-cover text-white text-center" style={{ backgroundImage: "url('/credit-bg.jpg')" }}>
        <div className="bg-black/60 absolute inset-0" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl font-extrabold mb-6">Need a Line of Credit?</h2>
          <p className="mb-8 text-lg">Submit a credit application to get started with billing terms for your next project.</p>
          <a
  href="/VMAT-Credit-Application.pdf"
  target="_blank"
  rel="noopener noreferrer"
>
  <Button className="px-8 py-4 text-lg rounded-full shadow-xl">
    Apply for Credit
  </Button>
</a>
        </div>
      </section>

      <section id="process" className="py-24 px-6 bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Our Simple Process</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { step: '01', title: 'Connect', desc: 'Give us a call or send a quote request.' },
              { step: '02', title: 'Deliver', desc: 'We handle logistics, scheduling, and prep.' },
              { step: '03', title: 'Build', desc: 'Job-site tested products you can trust.' },
              { step: '04', title: 'Support', desc: 'We’re here for estimates, advice & more.' },
            ].map((item,i)=> (
              <Card key={i} className="rounded-2xl shadow-md hover:shadow-xl transition bg-[var(--color-surface)] border border-gray-100">
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

      <section id="faq" className="py-24 bg-gray-50 px-6 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            { q: 'What products does Volunteer Materials offer?', a: 'We provide stone, sand, gravel, paving asphalt, and ready-mix concrete.' },
            { q: 'Where are the company’s locations?', a: 'We are based in Lewisburg and serve surrounding regions in Tennessee.' },
            { q: 'How do I order concrete or aggregates?', a: 'You can call us directly or request a callback through our website.' },
            { q: 'Do you offer online tools for estimating quantities?', a: 'Yes, our team provides digital tools and calculators for accurate estimates.' },
            { q: 'What are the hours and best way to reach you?', a: 'We are available Monday–Friday by phone and email.' },
          ].map((item,i)=> (
            <details key={i} className="bg-white rounded-xl shadow-md p-6">
              <summary className="cursor-pointer text-lg font-semibold mb-2">{item.q}</summary>
              <p className="text-[var(--color-muted)] mt-2">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Supplying Projects Across the Region</h2>
            <p className="mb-8 text-lg text-white/90">From highways to home developments, we deliver quality materials where and when you need them.</p>
            <Button className="bg-black text-[var(--color-primary)] hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-lg">View Our Locations</Button>
          </div>
          <img src="/locations.jpg" alt="locations" className="rounded-3xl shadow-lg object-cover" />
        </div>
      </section>

      <footer id="contact" className="py-20 px-6" style={{ background: 'var(--color-dark)' }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-gray-300">
          <div>
            <img src="/logo.png" alt="Volunteer Materials" className="h-18 mb-6" />
            <p>Helping Tennessee build stronger communities with ready-to-use materials, quality resources, and reliable service since 2007.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#materials" className="hover:text-white">Materials</a></li>
              <li><a href="#why" className="hover:text-white">Why Us</a></li>
              <li><a href="#process" className="hover:text-white">Process</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              <li>Job Application</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><MapPin size={18}/> 750 Highway 99, Lewisburg, TN</li>
              <li className="flex items-center gap-2"><Phone size={18}/> (931) 364-2655</li>
              <li className="flex items-center gap-2"><Mail size={18}/> info@volunteermaterials.com</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Certifications</h4>
            <div className="flex gap-4">
              <img src="/dot-logo.png" alt="DOT" className="h-10" />
              <img src="/contractors-assoc.png" alt="Contractors" className="h-10" />
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-12 border-t border-white/10 pt-8">© {new Date().getFullYear()} Volunteer Materials. All rights reserved.</div>
      </footer>
    </div>
  )
}
