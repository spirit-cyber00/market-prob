import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketProb",
  description: "Quantitative Market Bias Analyzer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}