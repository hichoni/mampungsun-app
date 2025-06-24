import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import FontManager from '@/components/font-manager';

export const metadata: Metadata = {
  title: '맘톡톡 (MomTalkTalk)',
  description: '마음 속 풍경을 선물하는 공간, 맘톡톡입니다. 당신의 마음을 표현하고, 따뜻한 응원을 받아보세요.',
  manifest: '/manifest.json',
  themeColor: '#A0D2EB',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '맘톡톡',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,700;1,400&family=Belleza&family=Gaegu:wght@400;700&family=Gowun+Dodum&family=Nanum+Pen+Script&family=Do+Hyeon&family=Noto+Sans+KR:wght@400;700&family=Nanum+Gothic:wght@400;700&family=Black+Han+Sans&family=East+Sea+Dokdo&family=Gugi&family=IBM+Plex+Sans+KR:wght@400;700&family=Sunflower:wght@300;500;700&family=Hi+Melody&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FontManager />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
