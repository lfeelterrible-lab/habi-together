import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BioRush · 高中生物刷到会',
  description: '把高中生物拆成一张张知识卡，边回忆边反馈，刷到真正掌握。',
  openGraph: {
    title: 'BioRush · 高中生物刷到会',
    description: '一题一题刷，掌握 ATP、细胞呼吸、遗传、调节与生态。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BioRush · 高中生物刷到会',
    description: '一题一题刷，掌握 ATP、细胞呼吸、遗传、调节与生态。',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN"><body>{children}</body></html>
  );
}
