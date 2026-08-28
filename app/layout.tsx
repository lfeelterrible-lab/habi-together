import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './habi-together.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const siteUrl = 'https://identity-v-character-archive.smoky-mint-8739.chatgpt.site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'HabiTogether — 一起，把日子种好',
  description: '给两个人的共同习惯花园：一起打卡、浇水、同步成长。',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'HabiTogether — 一起，把日子种好',
    description: '给两个人的共同习惯花园：一起打卡、浇水、同步成长。',
    type: 'website',
    images: [{ url: '/share-card.svg', width: 1200, height: 630, type: 'image/svg+xml', alt: 'HabiTogether 一起，把日子种好' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HabiTogether — 一起，把日子种好',
    description: '给两个人的共同习惯花园：一起打卡、浇水、同步成长。',
    images: ['/share-card.svg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
