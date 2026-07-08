import React from 'react';
import './globals.css';

export const metadata = {
  title: 'AI Weekly Report Copilot',
  description: '世界最高峰の品質を目指す週報自動生成システム',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-900 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
