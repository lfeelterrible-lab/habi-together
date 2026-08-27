import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: '莊園角色檔案 | 第五人格角色介紹',
  description: '精選《第五人格》求生者與監管者，瀏覽角色背景、核心能力與玩法定位。',
  openGraph: {
    title: '莊園角色檔案',
    description: '推開莊園的門，讀懂每一段執念。',
    type: 'website',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: '莊園角色檔案' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '莊園角色檔案',
    description: '精選《第五人格》角色背景、能力與玩法定位。',
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
