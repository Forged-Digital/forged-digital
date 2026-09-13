import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./logo-visibility.css";
import "./hero-video.css";
import "./mobile-stability.css";

export const metadata: Metadata = {
  title: "Forged Digital",
  description: "Custom web design, development, e-commerce, integrations, and digital systems.",
  metadataBase: new URL("https://forged-digital.com"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
