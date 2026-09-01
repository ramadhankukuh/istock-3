"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, CircleUserRound, MoonStar, SunMedium } from "lucide-react";
import { navItems } from "@/lib/site";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/components/theme-provider";
import { ProfileDialog } from "@/components/profile-dialog";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const isToolPage = pathname.startsWith("/tools/");
  const activeNavIndex = navItems.findIndex(
    (item) => !item.disabled && isActive(pathname, item.href),
  );

  return (
    <div className="relative min-h-screen text-foreground">
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* ── Mobile header: profile | logo center | theme ── */}
      <header className="sticky top-0 z-40 border-b border-(--border) bg-(--glass) backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
          {/* Left: Profile */}
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-foreground transition hover:bg-(--surface-strong)/80"
            aria-label="Profile"
          >
            <CircleUserRound className="h-4 w-4" />
          </button>

          {/* Center: Logo + iStock (spacer flex-1 on each side) */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--border) bg-(--surface-strong) shadow-(--shadow-soft)">
              <BarChart3 className="h-4 w-4 text-(--accent)" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">
                iStock
              </p>
            </div>
          </Link>

          {/* Right: Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-foreground transition hover:bg-(--surface-strong)/80"
            aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <SunMedium className="h-4 w-4" />
            ) : (
              <MoonStar className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* ── Desktop header: profile | logo center + nav | theme ── */}
      <header className="sticky top-4 z-40 mx-auto hidden w-full max-w-5xl px-4 sm:top-6 sm:px-6 lg:block lg:top-8">
        <div className="rounded-4xl border border-(--border)/80 bg-(--glass) px-4 py-2 shadow-(--shadow) shadow-black/3 backdrop-blur-3xl backdrop-saturate-150 lg:rounded-[2.25rem] lg:px-6">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Profile */}
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-foreground transition hover:bg-(--surface-strong)/80 lg:h-10 lg:w-10"
              aria-label="Profile"
            >
              <CircleUserRound className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>

            {/* Center: Logo + iStock */}
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--border) bg-(--surface-strong) shadow-(--shadow-soft) lg:h-10 lg:w-10">
                <BarChart3 className="h-4 w-4 text-(--accent) lg:h-5 lg:w-5" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted lg:text-xs">
                  iStock
                </p>
              </div>
            </Link>

            {/* Right: Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-foreground transition hover:bg-(--surface-strong)/80 lg:h-10 lg:w-10"
              aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? (
                <SunMedium className="h-4 w-4 lg:h-5 lg:w-5" />
              ) : (
                <MoonStar className="h-4 w-4 lg:h-5 lg:w-5" />
              )}
            </button>
          </div>

          {/* Nav pills below */}
          <nav className="mt-3 flex justify-center">
            <div className="relative flex gap-0.5 rounded-2xl bg-(--surface-strong)/50 p-0.5">
              {activeNavIndex >= 0 ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0.5 left-0 rounded-2xl bg-foreground/90 shadow-(--shadow-soft) motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out"
                  style={{
                    width: `${100 / navItems.length}%`,
                    transform: `translateX(${activeNavIndex * 100}%)`,
                  }}
                />
              ) : null}

              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  !item.disabled && isActive(pathname, item.href);

                if (item.disabled) {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      disabled
                      className="relative z-10 flex cursor-not-allowed items-center gap-1 rounded-[0.85rem] px-2.5 py-1.5 text-[10px] font-medium text-muted opacity-60 lg:gap-1.5 lg:px-3 lg:py-2 lg:text-xs"
                    >
                      <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative z-10 flex items-center gap-1 rounded-[0.85rem] px-2.5 py-1.5 text-[10px] font-medium transition-colors lg:gap-1.5 lg:px-3 lg:py-2 lg:text-xs",
                      active
                        ? "text-background"
                        : "text-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      <main className={`mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6 ${isToolPage ? "pb-6" : "pb-24"}`}>
        {children}
      </main>

      {!isToolPage && (
      /* ── Mobile bottom navbar ── */
      <nav className="fixed inset-x-4 bottom-4 z-40 sm:inset-x-8 lg:hidden">
        <div className="mx-auto max-w-2xl rounded-4xl border border-(--border)/80 bg-(--glass) p-1.5 shadow-(--shadow) shadow-black/3 backdrop-blur-3xl backdrop-saturate-150">
          <div className="relative grid grid-cols-5">
            {activeNavIndex >= 0 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0.5 left-0 rounded-[1.45rem] bg-foreground/90 shadow-(--shadow-soft) motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out"
                style={{
                  width: `${100 / navItems.length}%`,
                  transform: `translateX(${activeNavIndex * 100}%)`,
                }}
              />
            ) : null}

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = !item.disabled && isActive(pathname, item.href);

              if (item.disabled) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled
                    className="relative z-10 flex cursor-not-allowed flex-col items-center gap-1 rounded-[1.3rem] px-2 py-2 text-[11px] font-medium text-muted opacity-60"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-1 rounded-[1.3rem] px-2 py-2 text-[11px] font-medium transition-colors",
                    active
                      ? "text-background"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      )}
    </div>
  );
}
