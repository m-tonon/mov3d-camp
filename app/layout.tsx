import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from './providers';
// @ts-ignore
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'IPVO Acampa Jovens — Inscrições',
  description: 'Inscrição no IPVO Acampa Jovens.',
  icons: {
    icon: [
      {
        url: '/icon-light.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
