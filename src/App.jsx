import React from "react";
import { Routes, Route } from "react-router-dom";

import VolunteerMaterialsMockupTemplated from "./VolunteerMaterialsMockupTemplated.jsx";
import Admin from "./admin/Admin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
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

      {/* 404 */}
      <Route path="*" element={<div className="p-8">Not found</div>} />
    </Routes>
  );
}
