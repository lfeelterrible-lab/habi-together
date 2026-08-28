import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './habi-together.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HabiTogether — 一起，把日子种好',
  description: 'A shared habit garden for two people who want to grow together.',
  openGraph: {
    title: 'HabiTogether — 一起，把日子种好',
    description: 'A shared habit garden for two people who want to grow together.',
    type: 'website',
    images: [{ url: '/garden-reference.png', width: 1920, height: 1080, alt: 'A shared garden' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
