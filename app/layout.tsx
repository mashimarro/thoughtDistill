'use client';

import './globals.css';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // 所有页面都显示侧边栏
  const showSidebar = true;

  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50 text-gray-900">
        {showSidebar ? (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
