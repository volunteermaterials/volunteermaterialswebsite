import React from "react";
import { Routes, Route } from "react-router-dom";

import VolunteerMaterialsMockupTemplated from "./VolunteerMaterialsMockupTemplated.jsx";
import Admin from "./admin/Admin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Quote from "./pages/Quote.jsx";  
import Locations from "./pages/Locations.jsx";
import Calculators from "./pages/Calculators.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";  // ✅ import

export default function App() {
  return (
    <>
      <ScrollToTop />   {/* ✅ Always runs on route change */}
      <Routes>
        {/* Public site */}
        <Route path="/" element={<VolunteerMaterialsMockupTemplated />} />

        {/* Admin (protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Quote */}
        <Route path="/quote" element={<Quote />} />

        {/* Locations */}
        <Route path="/locations" element={<Locations />} />

        {/* Calculator */}
        <Route path="/calculators" element={<Calculators />} />

        {/* 404 */}
        <Route path="*" element={<div className="p-8">Not found</div>} />
      </Routes>
    </>
  );
}
