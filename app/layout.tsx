import type { Metadata } from "next";
import { Barlow_Condensed, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Avoca Weather Demand Intelligence",
  description: "14-day HVAC demand forecast for your market. Know your busy season before it hits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${barlowCondensed.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-body), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
