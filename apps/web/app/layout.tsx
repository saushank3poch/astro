import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astro - Cosmic Insights for Financial Decisions",
  description: "Harness the power of ancient astrology and modern AI to make informed predictions about crypto, stocks, and financial markets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
