/* src/app/layout.jsx
 * Loads Tailwind (via CDN, so there are no style config files to set up)
 * and the Telegram Mini App script, then wraps the app in the wallet provider. */

import Script from 'next/script';
import { Providers } from './providers';

export const metadata = {
  title: 'LEXCONV // GTM Terminal',
  description: 'Go-To-Market Intelligence Terminal with on-chain TON checkout.',
};

export const viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Tailwind CSS — no build config needed */}
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        {/* Telegram Mini App runtime (harmless outside Telegram) */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body style={{ backgroundColor: '#09090b' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
