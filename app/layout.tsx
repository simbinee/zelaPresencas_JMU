import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "JMU Maputo Norte — Presenças",
  description:
    "Sistema de gestão de presenças dos candidatos à envergadura — Juventude Metodista Unida, Distrito de Maputo Norte.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12203D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-MZ">
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans text-navy-950 antialiased`}>
        {children}
      </body>
    </html>
  );
}
