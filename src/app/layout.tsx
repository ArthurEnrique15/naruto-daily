import type { Metadata } from "next";
import { Bangers, Noto_Sans } from "next/font/google";
import "./globals.css";

const bangers = Bangers({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  weight: ["400", "600", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Naruto Daily",
  description: "Daily Naruto character guessing game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bangers.variable} ${notoSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
