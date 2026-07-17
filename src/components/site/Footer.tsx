import { Link } from "@tanstack/react-router";
import { nav } from "@/lib/site-data";
import { useSection } from "@/lib/cms";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  const { data: site } = useSection("site");
  if (!site) return null;
  return (
    <footer className="mt-24 bg-dark-bg text-dark-fg">
      <div className="container-x py-20">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/50">Let's talk</p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-white md:text-6xl">
              Got a budget<br />
              and a <span className="italic-purple">problem</span>?
            </h2>
            <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5">
              Start a project <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div>
            <p className="text-sm uppercase tracking-widest text-white/50">Navigation</p>
            <ul className="mt-4 space-y-2">
              {nav.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-lg text-white/80 transition-colors hover:text-primary">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm uppercase tracking-widest text-white/50">Elsewhere</p>
            <ul className="mt-4 space-y-2">
              {site.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-lg text-white/80 transition-colors hover:text-primary">
                    {s.label} <ArrowUpRight className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-white/50">{site.location}</p>
            <p className="text-sm text-white/50">{site.hours}</p>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/40 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Built with intent · not templates.</p>
        </div>
      </div>
    </footer>
  );
}
