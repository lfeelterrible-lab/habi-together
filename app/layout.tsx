import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Garden Study | IMG2THREEJS',
  description: '以程式生成的 Three.js 花園場景，從單張參考圖開始重建。',
  openGraph: {
    title: 'Garden Study | IMG2THREEJS',
    description: '從一張朦朧截圖拆出可旋轉的程序化場景。',
    type: 'website',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'Garden Study' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garden Study | IMG2THREEJS',
    description: '程序化 Three.js 花園場景。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
