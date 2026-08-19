"use client";

import { useState } from "react";
import type { ViewMode } from "@/lib/viewMode";

interface NavItem {
  id: ViewMode;
  label: string;
}

const PRIMARY_ITEMS: NavItem[] = [
  { id: "overview", label: "OVERVIEW" },
  { id: "device", label: "TRY DEVICE" },
  { id: "hardware3d", label: "HARDWARE" },
  { id: "actuator", label: "PIN MECHANISM" },
  { id: "impact", label: "IMPACT" },
];

const SECONDARY_ITEM: NavItem = { id: "standard", label: "ENGINEERING VIEW" };

const ALL_ITEMS = [...PRIMARY_ITEMS, SECONDARY_ITEM];

interface MainNavigationProps {
  active: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

/**
 * The product's primary navigation, shown whenever the Guided Tour isn't
 * active. Desktop gets a compact pill row (Engineering View visually
 * separated as the secondary/technical item); narrow screens get a
 * hamburger-triggered drawer with large touch targets instead of trying to
 * cram the same row into a small width.
 */
export default function MainNavigation({ active, onNavigate }: MainNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function go(view: ViewMode) {
    onNavigate(view);
    setMobileOpen(false);
  }

  return (
    <nav aria-label="Main" className="relative">
      {/* Desktop / wide layout */}
      <div className="hidden items-center gap-2 sm:flex">
        <div className="flex rounded border border-white/15 p-0.5">
          {PRIMARY_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={active === item.id ? "page" : undefined}
              className={`rounded px-3 py-1 text-[11px] font-semibold tracking-[0.1em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39ff8f] ${
                active === item.id ? "bg-[#39ff8f]/15 text-[#39ff8f]" : "text-white/40 hover:text-white/70"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(SECONDARY_ITEM.id)}
          aria-current={active === SECONDARY_ITEM.id ? "page" : undefined}
          className={`rounded border px-2.5 py-1 text-[10px] font-medium tracking-[0.1em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39ff8f] ${
            active === SECONDARY_ITEM.id
              ? "border-[#39ff8f]/50 text-[#39ff8f]"
              : "border-white/10 text-white/35 hover:text-white/60"
          }`}
        >
          {SECONDARY_ITEM.label}
        </button>
      </div>

      {/* Narrow / mobile layout */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="main-nav-drawer"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          className="flex items-center gap-2 rounded border border-white/15 px-3 py-2 text-[11px] font-semibold tracking-[0.1em] text-white/70"
        >
          <span aria-hidden>{mobileOpen ? "✕" : "☰"}</span>
          MENU
        </button>
        {mobileOpen && (
          <div
            id="main-nav-drawer"
            className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-white/15 bg-[#0a0b0a] p-1.5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.9)]"
          >
            {ALL_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                aria-current={active === item.id ? "page" : undefined}
                className={`block w-full rounded px-3 py-2.5 text-left text-[12px] font-semibold tracking-[0.08em] transition-colors ${
                  active === item.id ? "bg-[#39ff8f]/15 text-[#39ff8f]" : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
