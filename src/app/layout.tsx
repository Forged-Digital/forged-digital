import type { Metadata } from "next";
import "./globals.css";
import "./hero-video.css";

export const metadata: Metadata = {
  title: "Forged Digital",
  description: "Custom web design, development, e-commerce, integrations, and digital systems.",
  metadataBase: new URL("https://forged-digital.com"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
