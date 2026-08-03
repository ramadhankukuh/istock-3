"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  LogOut,
  MoonStar,
  Shield,
  SunMedium,
  FileText,
  ExternalLink,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export function ProfileDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { status, data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  const initials = getInitials(user?.name);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — no blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20"
            onClick={onClose}
          />

          {/* Panel — mobile: full screen slide from left | desktop: centered card */}
          <motion.div
            ref={panelRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-md overflow-y-auto border-r border-(--border) bg-(--background) p-6 shadow-(--shadow) sm:rounded-r-3xl"
          >
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-muted transition hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-6">
              {isAuthenticated ? (
                <div className="flex flex-col items-center gap-2">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user?.name ?? "Profile"}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--accent) text-lg font-bold text-white">
                      {initials}
                    </div>
                  )}
                  <h2 className="text-lg font-semibold">
                    {user?.name ?? "User"}
                  </h2>
                  <p className="text-sm text-muted">{user?.email}</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-(--border) bg-(--surface-strong) p-5">
                  {/* Guest profile header */}
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--foreground)/10">
                      <User className="h-5 w-5 text-(--foreground)" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">
                        You&apos;re browsing in guest mode
                      </p>
                      <p className="text-xs text-muted">
                        Sign in to sync watchlist &amp; portfolio
                      </p>
                    </div>
                  </div>

                  {/* Login button */}
                  <Button
                    className="w-full gap-3 py-2.5 text-sm"
                    onClick={() =>
                      signIn("google", { callbackUrl: window.location.pathname })
                    }
                  >
                    <GoogleIcon className="h-5 w-5 shrink-0" />
                    <span>Login dengan Google</span>
                  </Button>
                  <p className="mt-3 text-center text-[11px] text-muted">
                    Dengan sign in, kamu setuju dengan{" "}
                    <Link
                      href="/syarat-ketentuan"
                      onClick={onClose}
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      Syarat &amp; Ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link
                      href="/kebijakan-privasi"
                      onClick={onClose}
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      Kebijakan Privasi
                    </Link>{" "}
                    kami.
                  </p>
                </div>
              )}

              {/* Appearance */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
                  Appearance
                </p>
              <div className="rounded-2xl border border-(--border) bg-(--surface-strong) p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Tema</p>
                    <p className="text-xs text-muted">
                      {theme === "dark" ? "Mode gelap" : "Mode terang"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--surface) transition hover:bg-(--surface-strong)"
                  >
                    {theme === "dark" ? (
                      <SunMedium className="h-4 w-4" />
                    ) : (
                      <MoonStar className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              </div>

              {/* Data & Privasi */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
                  Data &amp; Privasi
                </p>
                <Link
                  href="/syarat-ketentuan"
                  onClick={onClose}
                  className="focus-ring flex items-center justify-between rounded-2xl border border-(--border) bg-(--surface-strong) p-4 text-sm transition hover:bg-(--surface)"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-(--accent)" />
                    <span className="font-medium">Syarat dan Ketentuan</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted" />
                </Link>
                <Link
                  href="/kebijakan-privasi"
                  onClick={onClose}
                  className="focus-ring flex items-center justify-between rounded-2xl border border-(--border) bg-(--surface-strong) p-4 text-sm transition hover:bg-(--surface)"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-(--accent)" />
                    <span className="font-medium">Kebijakan Privasi</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted" />
                </Link>
              </div>

              {isAuthenticated && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
