import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Three.js Studio / Live Phone',
  description: 'A low-latency iPhone screen bridge mapped to a Three.js phone surface.',
  openGraph: {
    title: 'Three.js Studio / Live Phone',
    description: 'A low-latency iPhone screen bridge mapped to a Three.js phone surface.',
    type: 'website',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'Three.js Studio live phone bridge' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Three.js Studio / Live Phone',
    description: 'A low-latency iPhone screen bridge mapped to a Three.js phone surface.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
