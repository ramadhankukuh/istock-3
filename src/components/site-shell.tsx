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

      {/* ── Desktop header: logo | nav center | actions ── */}
      <header className="sticky top-4 z-40 mx-auto hidden w-full max-w-5xl px-4 sm:top-6 sm:px-6 lg:block lg:top-8">
        <div className="rounded-2xl border border-(--border)/80 bg-(--glass) px-3 py-2 shadow-(--shadow) shadow-black/3 backdrop-blur-3xl backdrop-saturate-150 lg:rounded-3xl lg:px-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            {/* Left: Logo */}
            <Link href="/" className="flex w-fit items-center gap-2.5 justify-self-start">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--border) bg-(--surface-strong) shadow-(--shadow-soft) lg:h-10 lg:w-10">
                <BarChart3 className="h-5 w-5 text-(--accent)" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground lg:text-xs">
                iStock
              </span>
            </Link>

            {/* Center: Nav pills */}
            <nav className="justify-self-center">
              <div className="relative flex gap-0.5 rounded-full bg-(--surface-strong)/60 p-0.5">
                {activeNavIndex >= 0 ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0.5 left-0 rounded-full bg-foreground/90 shadow-(--shadow-soft) motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out"
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
                        className="relative z-10 flex cursor-not-allowed items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-muted opacity-60"
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
                        "relative z-10 flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors",
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
            </nav>

            {/* Right: Profile + theme */}
            <div className="flex items-center gap-2 justify-self-end">
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-foreground transition hover:bg-(--surface-strong)/80 lg:h-10 lg:w-10"
                aria-label="Profile"
              >
                <CircleUserRound className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-foreground transition hover:bg-(--surface-strong)/80 lg:h-10 lg:w-10"
                aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? (
                  <SunMedium className="h-5 w-5" />
                ) : (
                  <MoonStar className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
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
