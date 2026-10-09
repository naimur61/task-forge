import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { Providers } from '@/providers';
import { siteConfig } from '@/config/site';
import './globals.css';
import '@/styles/status-colors.css';

// Bundled Inter variable font — no network dependency at build/dev time.
const inter = localFont({
  src: '../fonts/InterVariable.woff2',
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // next-themes sets the `class` attribute on <html> before hydration.
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
