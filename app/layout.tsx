import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RateMyDorm Italia",
    template: "%s · RateMyDorm Italia",
  },
  description:
    "Crowdsourced student residence reviews for Italy. Compare public/DSU housing and private residences in Milan, Turin, and beyond.",
  metadataBase: new URL("https://ratemydorm-italia.com"),
  openGraph: {
    title: "RateMyDorm Italia",
    description:
      "Find, compare, and review student residences across Italy.",
    type: "website",
    locale: "en_US",
    siteName: "RateMyDorm Italia",
  },
  twitter: {
    card: "summary_large_image",
    title: "RateMyDorm Italia",
    description:
      "Find, compare, and review student residences across Italy.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur">
            <div className="mx-auto flex h-16 w-full items-center justify-between">
              <Link
                href="/"
                className="text-lg font-semibold tracking-tight text-slate-900 no-underline"
              >
                RateMyDorm <span className="text-brand-600">Italia</span>
              </Link>

              <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                <Link href="/" className="text-slate-700 no-underline hover:text-slate-900">
                  Discover
                </Link>
                <Link href="/residences" className="text-slate-700 no-underline hover:text-slate-900">
                  Residences
                </Link>
                <Link href="/add-residence" className="text-slate-700 no-underline hover:text-slate-900">
                  Add a Residence
                </Link>
                <Link href="/admin" className="text-slate-700 no-underline hover:text-slate-900">
                  Admin
                </Link>
              </nav>

              <div className="flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:bg-slate-100"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-brand-700"
                >
                  Join
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 py-6 md:py-8">{children}</main>

          <footer className="border-t border-slate-200 py-6 text-xs text-slate-500">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
              <p>© {new Date().getFullYear()} RateMyDorm Italia</p>
              <p>Built for students in Milan, Turin, and all across Italy.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}