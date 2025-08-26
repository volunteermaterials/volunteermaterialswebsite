// src/pages/Calculators.jsx
import React, { useMemo, useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import { useContent } from "../content/ContentContext.jsx";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

// Helpers
const toNum = (v) => (v === "" || v === null || v === undefined ? 0 : Number(v));
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Conversions
// If older data has t/yd³, convert to lb/ft³ so we can compute tons directly from ft³.
const tonYd3_to_lbFt3 = (tPerYd3) => (Number(tPerYd3) * 2000) / 27;

function useAggregateMaterials(materials) {
  // Build a flat list of active materials with lb/ft³ resolved
  return useMemo(() => {
    const list = (materials || [])
      .filter((m) => m?.active !== false)
      .map((m, i) => {
        const name = (m.name || `Material ${i + 1}`).trim();
        let lbft3 = Number(m.densityLbPerFt3);
        // Fallback for legacy content: if someone previously saved tons/yd³, convert
        if (!lbft3 && m.densityTonsPerCY) {
          lbft3 = tonYd3_to_lbFt3(Number(m.densityTonsPerCY));
        }
        return {
          id: m.id || `${i}`,
          name,
          lbft3: Number.isFinite(lbft3) && lbft3 > 0 ? lbft3 : null,
          category: m.category || "aggregate",
        };
      });
    // Keep only items that have a usable lb/ft³
    return list.filter((m) => m.lbft3);
  }, [materials]);
}

function AggregatesCalculator({ materials, defaultWastePct = 10 }) {
  const items = useAggregateMaterials(materials);
  const firstId = items[0]?.id;

  const [materialId, setMaterialId] = useState(firstId || "");
  const [length, setLength] = useState(""); // ft
  const [width, setWidth] = useState("");   // ft
  const [depth, setDepth] = useState("");   // numeric
  const [depthUnit, setDepthUnit] = useState("in"); // in | ft
  const [wastePct, setWastePct] = useState(defaultWastePct);

  useEffect(() => {
    if (!materialId && firstId) setMaterialId(firstId);
  }, [firstId, materialId]);

  useEffect(() => {
    setWastePct(defaultWastePct);
  }, [defaultWastePct]);

  const selected = useMemo(
    () => items.find((m) => m.id === materialId) || items[0],
    [materialId, items]
  );

  const calc = useMemo(() => {
    const L = toNum(length);
    const W = toNum(width);
    const D = toNum(depth);
    const waste = toNum(wastePct) / 100;

    if (!L || !W || !D || !selected?.lbft3) {
      return { tons: 0, tonsWaste: 0 };
    }

    const depthFeet = depthUnit === "in" ? D / 12 : D;
    const volumeFt3 = L * W * depthFeet; // ft³
    // tons = (ft³ * lb/ft³) / 2000
    const tons = (volumeFt3 * selected.lbft3) / 2000;
    const tonsWaste = tons * (1 + waste);

    return {
      tons: round2(tons),
      tonsWaste: round2(tonsWaste),
    };
  }, [length, width, depth, depthUnit, wastePct, selected]);

  return (
    <Card className="rounded-2xl shadow-sm border border-black/10">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4">Aggregates Calculator (Tons)</h3>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Material</label>
              <select
                value={selected?.id || ""}
                onChange={(e) => setMaterialId(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 bg-white"
              >
                {items.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.lbft3} lb/ft³
                  </option>
                ))}
              </select>
              {items.length === 0 && (
                <p className="text-xs text-amber-700 mt-1">
                  No materials with density found. Add items in Admin → Materials (lb/ft³).
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Length (ft)</label>
              <input
                inputMode="decimal"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="ft"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Width (ft)</label>
              <input
                inputMode="decimal"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="ft"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Depth</label>
                <input
                  inputMode="decimal"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="w-full rounded-lg border border-black/15 px-3 py-2"
                  placeholder="in or ft"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Units</label>
                <select
                  value={depthUnit}
                  onChange={(e) => setDepthUnit(e.target.value)}
                  className="w-28 rounded-lg border border-black/15 px-3 py-2 bg-white"
                >
                  <option value="in">in</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Waste Allowance</label>
              <div className="flex gap-2 items-center">
                <input
                  inputMode="decimal"
                  value={wastePct}
                  onChange={(e) => setWastePct(e.target.value)}
                  className="w-full rounded-lg border border-black/15 px-3 py-2"
                  placeholder="10"
                />
                <span className="text-sm text-black/60">%</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="rounded-xl bg-black/[.03] border border-black/10 p-4">
            <div className="text-sm text-black/60">Results</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Tons</span>
                <span className="font-semibold">{calc.tons}</span>
              </div>
            </div>
            <div className="my-3 h-px bg-black/10" />
            <div className="text-xs text-black/60 mb-1">Including waste ({wastePct || 0}%):</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Tons (with waste)</span>
                <span className="font-semibold">{calc.tonsWaste}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button className="px-4 py-2 rounded-full" onClick={() => window.print()}>
                Print / Save
              </Button>
              <Button
                variant="outline"
                className="px-4 py-2 rounded-full"
                onClick={() => {
                  setLength(""); setWidth(""); setDepth(""); setWastePct(defaultWastePct);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-black/60">
          Results are estimates. For compaction/moisture variability, consider extra margin.
        </p>
      </CardContent>
    </Card>
  );
}

function ConcreteCalculator({ defaultWastePct = 10 }) {
  const [length, setLength] = useState(""); // ft
  const [width, setWidth] = useState("");   // ft
  const [thicknessIn, setThicknessIn] = useState(""); // inches
  const [wastePct, setWastePct] = useState(defaultWastePct);

  useEffect(() => {
    setWastePct(defaultWastePct);
  }, [defaultWastePct]);

  const calc = useMemo(() => {
    const L = toNum(length);
    const W = toNum(width);
    const T = toNum(thicknessIn);
    const waste = toNum(wastePct) / 100;
    if (!L || !W || !T) return { cy: 0, cyWaste: 0 };
    const volumeFt3 = L * W * (T / 12);
    const cy = volumeFt3 / 27;
    const cyWaste = cy * (1 + waste);
    return { cy: round2(cy), cyWaste: round2(cyWaste) };
  }, [length, width, thicknessIn, wastePct]);

  return (
    <Card className="rounded-2xl shadow-sm border border-black/10">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4">Concrete Calculator (Cubic Yards)</h3>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Length (ft)</label>
              <input
                inputMode="decimal"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="ft"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Width (ft)</label>
              <input
                inputMode="decimal"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="ft"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thickness (in)</label>
              <input
                inputMode="decimal"
                value={thicknessIn}
                onChange={(e) => setThicknessIn(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2"
                placeholder="in"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Waste Allowance</label>
              <div className="flex gap-2 items-center">
                <input
                  inputMode="decimal"
                  value={wastePct}
                  onChange={(e) => setWastePct(e.target.value)}
                  className="w-full rounded-lg border border-black/15 px-3 py-2"
                  placeholder="10"
                />
                <span className="text-sm text-black/60">%</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="rounded-xl bg-black/[.03] border border-black/10 p-4">
            <div className="text-sm text-black/60">Results</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Cubic Yards</span>
                <span className="font-semibold">{calc.cy}</span>
              </div>
            </div>
            <div className="my-3 h-px bg-black/10" />
            <div className="text-xs text-black/60 mb-1">Including waste ({wastePct || 0}%):</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>CY (with waste)</span>
                <span className="font-semibold">{calc.cyWaste}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button className="px-4 py-2 rounded-full" onClick={() => window.print()}>
                Print / Save
              </Button>
              <Button
                variant="outline"
                className="px-4 py-2 rounded-full"
                onClick={() => {
                  setLength(""); setWidth(""); setThicknessIn(""); setWastePct(defaultWastePct);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-black/60">
          Concrete volumes are estimates. For pump priming, spillage, or irregular subgrade, consider extra margin.
        </p>
      </CardContent>
    </Card>
  );
}

export default function Calculators() {
  const { content } = useContent();
  const materials = content?.materials || [];
  const aggDefaultWaste = content?.calculators?.aggregates?.defaultWastePct ?? 10;
  const concDefaultWaste = content?.calculators?.concrete?.defaultWastePct ?? 10;

  return (
    <>
      <Navbar />
      <section className="min-h-screen pt-28 pb-20 px-6 bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-black/5 text-black/60">
              PRODUCT CALCULATORS
            </div>
            <h1 className="mt-3 text-4xl font-bold">Estimate Materials</h1>
            <p className="mt-2 text-[var(--color-muted)]">
              Aggregates: enter dimensions, get <strong>Tons</strong>. Concrete: enter dimensions, get <strong>cubic yards</strong>.
            </p>
          </div>

          <div className="grid gap-8">
            <AggregatesCalculator materials={materials} defaultWastePct={aggDefaultWaste} />
            <ConcreteCalculator defaultWastePct={concDefaultWaste} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="px-5 py-3 rounded-full">
              <a href="/quote">Request a Quote</a>
            </Button>
            <Button asChild variant="outline" className="px-5 py-3 rounded-full">
              <a href="tel:+19313642655">Call Dispatch (931) 364-2655</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
