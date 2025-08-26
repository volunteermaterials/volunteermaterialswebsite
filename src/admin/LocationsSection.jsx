// src/admin/LocationsSection.jsx
import React from "react";
import { useFieldArray } from "react-hook-form";

const INPUT = "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent";
const LABEL = "block text-sm font-medium text-gray-700";
const HELP  = "text-xs text-gray-500 mt-1";

export default function LocationsSection({ control, register, watch, removeNullLatLng }) {
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "locations",
  });

  const locations = watch("locations") || [];

  return (
    <section id="locations" data-anchor className="bg-white border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Locations</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              append({
                id: crypto.randomUUID(),
                name: "",
                kind: "quarry", // quarry | plant | concrete | paving_hq | sand_gravel | hq | yard
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
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            + Add location
          </button>
        </div>
      </div>

      {fields.length === 0 && (
        <div className="text-sm text-gray-500">No locations yet. Click “Add location”.</div>
      )}

      <div className="grid gap-4">
        {fields.map((field, i) => {
          const row = locations[i] || {};
          return (
            <div key={field.id} className="border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Location {i + 1}</h3>
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

              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className={LABEL}>Name</label>
                  <input {...register(`locations.${i}.name`)} className={INPUT} placeholder="Pottsville Quarry" />
                </div>
                <div>
                  <label className={LABEL}>Kind</label>
                  <select {...register(`locations.${i}.kind`)} className={INPUT}>
                    <option value="Quarry">quarry</option>
                    <option value="Asphalt Plant">plant</option>
                    <option value="Concrete">concrete</option>
                    <option value="Paving HQ">paving_hq</option>
                    <option value="Sand and Gravel">sand_gravel</option>
                    {/* <option value="yard">yard</option>*/ }
                    <option value="Corporate HQ">hq</option>
                  </select>
                  <p className={HELP}>Used for filtering and badges.</p>
                </div>

                <div>
                  <label className={LABEL}>Established (YYYY-MM-DD or YYYY)</label>
                  <input {...register(`locations.${i}.established`)} className={INPUT} placeholder="2007-07-02" />
                </div>
                <div>
                  <label className={LABEL}>Phone</label>
                  <input {...register(`locations.${i}.phone`)} className={INPUT} placeholder="931-364-2655" />
                </div>
                <div>
                  <label className={LABEL}>Fax</label>
                  <input {...register(`locations.${i}.fax`)} className={INPUT} placeholder="931-364-4115" />
                </div>

                <div className="md:col-span-3 grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className={LABEL}>Address 1</label>
                    <input {...register(`locations.${i}.address1`)} className={INPUT} placeholder="750 Highway 99" />
                  </div>
                  <div className="md:col-span-3">
                    <label className={LABEL}>Address 2</label>
                    <input {...register(`locations.${i}.address2`)} className={INPUT} placeholder="" />
                  </div>
                  <div>
                    <label className={LABEL}>City</label>
                    <input {...register(`locations.${i}.city`)} className={INPUT} placeholder="Lewisburg" />
                  </div>
                  <div>
                    <label className={LABEL}>State</label>
                    <input {...register(`locations.${i}.state`)} className={INPUT} placeholder="TN" />
                  </div>
                  <div>
                    <label className={LABEL}>Zip</label>
                    <input {...register(`locations.${i}.zip`)} className={INPUT} placeholder="37091" />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Latitude</label>
                  <input {...register(`locations.${i}.lat`)} className={INPUT} placeholder="35.86" />
                </div>
                <div>
                  <label className={LABEL}>Longitude</label>
                  <input {...register(`locations.${i}.lng`)} className={INPUT} placeholder="-86.66" />
                </div>
                <div>
                  <label className={LABEL}>Active</label>
                  <select {...register(`locations.${i}.active`)} className={INPUT}>
                    <option value={true}>true</option>
                    <option value={false}>false</option>
                  </select>
                </div>
              </div>

              <p className={HELP + " mt-2"}>
                Leave lat/lng empty if unknown; the map will still list the location. For production,
                add a server geocode step to populate coordinates safely.
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
