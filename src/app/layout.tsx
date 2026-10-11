import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Broke But Functional — Survive the Month",
  description: "A Gen Z personal finance experience to manage ₹10,000 over 30 days.",
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
        {children}
      </body>
    </html>
  );
}
