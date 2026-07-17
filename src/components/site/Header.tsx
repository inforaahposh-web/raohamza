import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site-data";
import { useSection } from "@/lib/cms";
import { Menu, X } from "lucide-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: site } = useSection("site");
  const siteName = site?.name ?? "Rao Hamza Saif";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-white/75 border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white font-display font-bold text-sm shadow-soft transition-transform duration-300 group-hover:-rotate-6">
            {siteName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </span>
          <span className="font-display text-base font-bold tracking-tight text-ink">
            {siteName.split(" ")[0]}<span className="italic-purple">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "text-primary" : "text-ink-soft hover:text-primary"
                }`}
              >
                {n.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/contact" className="hidden md:inline-flex btn-primary text-sm">
            Book a call
          </Link>
          <button
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-border md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-white md:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-xl px-4 py-3 text-base font-medium text-ink hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <Link to="/contact" className="btn-primary mt-2">
              Book a call
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
