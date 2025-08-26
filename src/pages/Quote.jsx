import { useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { Button } from "../components/ui/button";

const PRODUCTS = [
  "#57 Gravel",
  "Crusher Run",
  "Rip Rap",
  "Sand",
  "Topsoil",
  "Asphalt (Paving Base)",
  "Ready-Mix Concrete",
];

export default function Quote() {
  const [form, setForm] = useState({
    customer: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    shipTo: "", // full address line
    product: PRODUCTS[0],
    totalLoads: "",
    deliveryDate: "",
    deliveryTime: "Morning",
  });

  const mapSrc = useMemo(() => {
    const q = encodeURIComponent(form.shipTo || "Tennessee");
    // Free, no API key – just a search embed:
    return `https://www.google.com/maps?q=${q}&output=embed`;
  }, [form.shipTo]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // Build a mailto with formatted body
  function handleSend() {
    const to = "sales@volunteermaterials.com";
    const subject = encodeURIComponent(
      `New Quote Request — ${form.customer || "Customer"}`
    );
    const bodyLines = [
      `Customer: ${form.customer}`,
      `First Name: ${form.firstName}`,
      `Last Name: ${form.lastName}`,
      `Phone Number: ${form.phone}`,
      `Email Address: ${form.email}`,
      `Ship To Location: ${form.shipTo}`,
      `Product: ${form.product}`,
      `Total Loads: ${form.totalLoads}`,
      `Delivery Date Requested: ${form.deliveryDate}`,
      `Delivery Time Requested: ${form.deliveryTime}`,
    ];
    const body = encodeURIComponent(bodyLines.join("\n"));
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-[var(--color-bg)] pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-black/5 text-black/60">
              CREATE A QUOTE
            </div>
            <h1 className="mt-3 text-4xl font-bold">Quote Request</h1>
            <p className="mt-2 text-[var(--color-muted)]">
              Fill out the form and we’ll route your request to sales.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* FORM */}
            <div className="rounded-2xl border border-black/10 bg-white shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Customer</label>
                  <input
                    name="customer"
                    value={form.customer}
                    onChange={onChange}
                    className="w-full rounded-lg border border-black/15 px-3 py-2"
                    placeholder="Company or individual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={onChange}
                    className="w-full rounded-lg border border-black/15 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={onChange}
                    className="w-full rounded-lg border border-black/15 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    className="w-full rounded-lg border border-black/15 px-3 py-2"
                    placeholder="(###) ###-####"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    className="w-full rounded-lg border border-black/15 px-3 py-2"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Ship to Location (Street, City, State, Zip)
                  </label>
                  <input
                    name="shipTo"
                    value={form.shipTo}
                    onChange={onChange}
                    className="w-full rounded-lg border border-black/15 px-3 py-2"
                    placeholder="123 Main St, Lewisburg, TN 37091"
                  />
                  <p className="mt-1 text-xs text-black/60">
                    Map preview updates as you type.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Product</label>
                  <select
                    name="product"
                    value={form.product}
                    onChange={onChange}
                    className="w-full rounded-lg border border-black/15 px-3 py-2 bg-white"
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Total Loads</label>
                  <input
                    type="number"
                    min="1"
                    name="totalLoads"
                    value={form.totalLoads}
                    onChange={onChange}
                    className="w-full rounded-lg border border-black/15 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Delivery Date Requested
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={form.deliveryDate}
                    onChange={onChange}
                    className="w-full rounded-lg border border-black/15 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Delivery Time Requested
                  </label>
                  <select
                    name="deliveryTime"
                    value={form.deliveryTime}
                    onChange={onChange}
                    className="w-full rounded-lg border border-black/15 px-3 py-2 bg-white"
                  >
                    <option>Morning</option>
                    <option>Afternoon</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={handleSend} className="px-5 py-3 rounded-full">
                  Send to Sales
                </Button>

                {/* Optional: print/save */}
                <button
                  onClick={() => window.print()}
                  className="px-5 py-3 rounded-full border border-black/15 hover:bg-black/[.035]"
                >
                  Print / Save PDF
                </button>
              </div>

              <p className="mt-3 text-xs text-black/60">
                Submitting opens your email client with the details prefilled to{" "}
                <strong>Sales@volunteermaterials.com</strong>.
              </p>
            </div>

            {/* MAP PREVIEW */}
            <div className="rounded-2xl overflow-hidden border border-black/10 bg-white shadow-sm">
              <div className="h-12 flex items-center px-4 text-sm font-semibold tracking-wide bg-black/5 text-black/70">
                Delivery Location Preview
              </div>
              <iframe
                title="Map Preview"
                src={mapSrc}
                className="w-full h-[460px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
