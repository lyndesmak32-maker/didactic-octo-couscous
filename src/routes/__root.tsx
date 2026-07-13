import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NOVARA | Move Different." },
      {
        name: "description",
        content:
          "Premium everyday apparel designed for comfort, confidence, and wherever life takes you.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/images/novara-logo.png" },
    ],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-brand-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img
              src="/images/novara-logo-horizontal.png"
              alt="NOVARA"
              className="h-8 w-auto"
            />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#collections" className="nav-link">
            Collections
          </a>
          <a href="#everyday" className="nav-link">
            Everyday
          </a>
          <a href="#motion" className="nav-link">
            Motion
          </a>
          <a href="#street" className="nav-link">
            Street
          </a>
          <a href="#cozy" className="nav-link">
            Cozy
          </a>
          <a href="#accessories" className="nav-link">
            Accessories
          </a>
        </nav>

        {/* CTA */}
        <a href="#collections" className="btn-primary hidden md:inline-flex">
          Shop Now
        </a>

        {/* Mobile menu button */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Menu"
          type="button"
        >
          <span className="block h-[2px] w-6 bg-brand-black" />
          <span className="block h-[2px] w-6 bg-brand-black" />
          <span className="block h-[2px] w-6 bg-brand-black" />
        </button>
      </div>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-gray-200 bg-brand-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <img
              src="/images/novara-logo-horizontal.png"
              alt="NOVARA"
              className="mb-4 h-8 w-auto"
            />
            <p className="max-w-xs text-sm leading-relaxed text-brand-gray-500">
              Premium everyday apparel designed for comfort, confidence, and
              wherever life takes you.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.15em] text-brand-black">
              Shop
            </h4>
            <ul className="space-y-3">
              {["Everyday", "Motion", "Street", "Cozy", "Accessories"].map(
                (col) => (
                  <li key={col}>
                    <a
                      href={`#${col.toLowerCase()}`}
                      className="text-sm text-brand-gray-500 transition-colors hover:text-brand-black"
                    >
                      {col}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.15em] text-brand-black">
              Support
            </h4>
            <ul className="space-y-3">
              {[
                "Shipping & Returns",
                "Size Guide",
                "FAQ",
              ].map((item) => (
                <li key={item}>
                  <span className="cursor-pointer text-sm text-brand-gray-500 transition-colors hover:text-brand-black">
                    {item}
                  </span>
                </li>
              ))}
              <li>
                <a
                  href="mailto:DMandMDoggyDaycare1@gmail.com"
                  className="text-sm text-brand-gray-500 transition-colors hover:text-brand-black"
                >
                  Contact Us
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="mailto:DMandMDoggyDaycare1@gmail.com"
                  className="text-xs text-brand-gray-400 transition-colors hover:text-brand-black"
                >
                  DMandMDoggyDaycare1@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.15em] text-brand-black">
              Connect
            </h4>
            <ul className="space-y-3">
              {["Instagram", "TikTok", "Twitter / X", "YouTube"].map(
                (item) => (
                  <li key={item}>
                    <span className="cursor-pointer text-sm text-brand-gray-500 transition-colors hover:text-brand-black">
                      {item}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-brand-gray-200 pt-8 sm:flex-row">
          <p className="text-xs text-brand-gray-400">
            &copy; {year} NOVARA. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="cursor-pointer text-xs text-brand-gray-400 transition-colors hover:text-brand-black">
              Privacy Policy
            </span>
            <span className="cursor-pointer text-xs text-brand-gray-400 transition-colors hover:text-brand-black">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}