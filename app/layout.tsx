import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/base.css";
import "../styles/components.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "한평생 바로기업",
  description: "한평생 바로기업",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "한평생 바로기업",
    description: "한평생 바로기업",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "한평생 바로기업",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "한평생 바로기업",
    description: "한평생 바로기업",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          fontFamily: 'var(--font-family-base, "Pretendard", sans-serif)',
        }}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16772639814"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16772639814');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
