import type { Metadata, Viewport } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';

const APP_NAME = '맘풍선';
const APP_DEFAULT_TITLE = '맘풍선';
const APP_TITLE_TEMPLATE = '%s | 맘풍선';
const APP_DESCRIPTION = '마음 속 풍경을 선물하는 공간, 맘풍선입니다. 당신의 마음을 표현하고, 따뜻한 응원을 받아보세요.';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#A0D2EB',
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
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
