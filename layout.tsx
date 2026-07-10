/**
 * src/app/layout.tsx
 *
 * Server Component (default). Keeps static metadata + the Telegram WebApp
 * script server-side, and delegates the browser-only wallet provider to
 * ./providers.tsx (which does the dynamic ssr:false import).
 */

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'LEXCONV // GTM Terminal',
  description:
    'Go-To-Market Intelligence Terminal — premium B2B marketing analysis with on-chain TON checkout.',
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Telegram Mini App runtime. beforeInteractive so window.Telegram
            exists before the app hydrates. Harmless outside Telegram. */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-zinc-950 text-zinc-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
