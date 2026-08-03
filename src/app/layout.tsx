import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { SiteShell } from "@/components/site-shell";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iStock | Investment Stock",
  description:
    "Liquid glass investment dashboard for home, news, explore, all tools, and swing trade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("istock-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <SiteShell>{children}</SiteShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
