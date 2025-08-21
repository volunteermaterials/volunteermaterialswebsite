// src/App.jsx
import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import VolunteerMaterialsMockupTemplated from "./VolunteerMaterialsMockupTemplated"
import Quote from "./pages/Quote"   // your quote page

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<VolunteerMaterialsMockupTemplated />} />
        <Route path="/quote" element={<Quote />} />
      </Route>
    </Routes>
  )
}
