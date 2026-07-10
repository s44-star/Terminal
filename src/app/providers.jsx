'use client';

/* src/app/providers.jsx
 * Loads the TON wallet provider in the browser only (ssr:false),
 * which prevents the Next.js hydration error. */

import dynamic from 'next/dynamic';

const TonConnectUIProvider = dynamic(
  () => import('@tonconnect/ui-react').then((m) => m.TonConnectUIProvider),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="font-mono text-xs tracking-widest text-emerald-400/70">
          INITIALIZING WALLET LAYER…
        </div>
      </div>
    ),
  },
);

export function Providers({ children }) {
  const manifestUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/tonconnect-manifest.json`
      : '/tonconnect-manifest.json';

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl} uiPreferences={{ theme: 'DARK' }}>
      {children}
    </TonConnectUIProvider>
  );
}
