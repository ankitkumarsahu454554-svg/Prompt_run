import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "../components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Broke But Functional — Survive the Month",
  description: "A Gen Z personal finance experience to manage ₹10,000 over 30 days.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0B0B14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased bg-bg text-text">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
