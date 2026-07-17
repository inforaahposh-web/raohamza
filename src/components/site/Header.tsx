import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site-data";
import { useSection } from "@/lib/cms";
import { Menu, X } from "lucide-react";
import avatarMark from "@/assets/header-avatar.png";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: site } = useSection("site");
  const siteName = site?.name ?? "Rao Hamza Saif";
  const isDetailPage = path.startsWith("/case-studies/") && path.length > "/case-studies/".length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  const headerSolid = scrolled || isDetailPage;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        headerSolid ? "border-b border-border bg-white/95 backdrop-blur-xl shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-3 md:h-20">
        <Link to="/" className="group flex min-w-0 items-center gap-2.5">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#f0f0f0] shadow-soft transition-transform duration-300 group-hover:-rotate-6">
            <img
              src={avatarMark}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </span>
          <span className="truncate font-display text-sm font-bold tracking-tight text-ink sm:text-base">
            {siteName}
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
