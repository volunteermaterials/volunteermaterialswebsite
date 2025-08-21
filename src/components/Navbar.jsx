// src/components/Navbar.jsx
import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between backdrop-blur bg-white/70 rounded-b-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Volunteer Materials" className="h-12" />
          <span className="sr-only">Volunteer Materials</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text)]/80">
          <a href="/#materials" className="hover:text-[var(--color-primary)]">Materials</a>
          <a href="/#mission"   className="hover:text-[var(--color-primary)]">Mission</a>
          <a href="/#why"       className="hover:text-[var(--color-primary)]">Why Us</a>
          <a href="/#process"   className="hover:text-[var(--color-primary)]">Process</a>
          <a href="/#faq"       className="hover:text-[var(--color-primary)]">FAQ</a>
          <a href="/#contact"   className="hover:text-[var(--color-primary)]">Contact</a>
        </nav>

        {/* Use a Link wrapper so it always navigates */}
        <Link to="/quote">
          <Button className="hidden md:inline-flex rounded-full px-5 py-2 shadow-sm">
            Get a Quote
          </Button>
        </Link>
      </div>
    </header>
  );
}
