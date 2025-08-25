import type { Metadata } from "next";
import { Comic_Neue, Nunito } from "next/font/google";
import "./globals.css";

const comicNeue = Comic_Neue({
  variable: "--font-comic-neue",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Solar System Explorer - Interactive 3D Learning",
  description: "Explore the solar system in 3D! An interactive educational app for children to discover planets, learn amazing facts, and journey through space.",
  keywords: ["solar system", "planets", "education", "children", "3D", "interactive", "space", "astronomy"],
  authors: [{ name: "Solar System Explorer" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${comicNeue.variable} ${nunito.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
