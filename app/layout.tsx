import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amendra — Change the record. Keep the trace.",
  description:
    "A public provenance interface for statements, semantic retractions, and immutable revision history on GenLayer.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
