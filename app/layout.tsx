import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import WeatherTicker from "@/components/ui/WeatherTicker";
import ForecastModal from "@/components/ui/ForecastModal";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Tenerife Weather Forum",
    default: "Tenerife Weather Forum - Daily Forecasts, Microclimates & Travel Info",
  },
  description:
    "Your trusted guide to Tenerife weather. Daily forecasts, microclimate breakdowns, monthly climate guides and travel tips for UK visitors and Tenerife residents.",
  keywords: ["Tenerife weather", "Tenerife forecast", "Canary Islands weather", "Tenerife travel", "UK Tenerife"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Tenerife Weather Forum",
    description: "Daily forecasts, microclimates and travel info - all in one place.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans antialiased">
        <WeatherTicker />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ForecastModal />
      </body>
    </html>
  );
}
