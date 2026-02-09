import { Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://property-website-git-main-forge-fox.vercel.app'),
  title: {
    default: "Property Portal | 183 Housing Solutions",
    template: "%s | Property Portal"
  },
  description: "Advanced Property Management and Listing Platform. Find your dream home with ease.",
  openGraph: {
    title: "Property Portal | 183 Housing Solutions",
    description: "Advanced Property Management and Listing Platform. Find your dream home with ease.",
    url: "/",
    siteName: "Property Portal",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Property Portal - Find Your Dream Home",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Property Portal | 183 Housing Solutions",
    description: "Advanced Property Management and Listing Platform. Find your dream home with ease.",
    images: ["/og.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
