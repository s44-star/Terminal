'use client';

/**
 * src/app/providers.tsx
 *
 * Client boundary that owns the TonConnect provider.
 *
 * TonConnectUIProvider initializes the wallet SDK against browser APIs
 * (window, localStorage), so it must never execute during SSR. We load it
 * via next/dynamic with { ssr: false } from INSIDE a Client Component —
 * doing this in a Server Component (e.g. layout.tsx directly) throws
 * "ssr: false is not allowed in Server Components" in the App Router.
 *
 * Because the provider is ssr:false, its children (the whole dashboard) only
 * render on the client, which is exactly why the wallet hooks in page.tsx
 * never run on the server.
 */

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

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

export function Providers({ children }: { children: ReactNode }) {
  /**
   * Auto-resolves to the current deployment origin, so it works on localhost,
   * Vercel preview URLs, and production without editing anything. The manifest
   * file is served from /public/tonconnect-manifest.json.
   *
   * Prefer this over a hardcoded URL. If you must hardcode (e.g. a custom CDN),
   * replace the expression below with your absolute https URL.
   */
  const manifestUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/tonconnect-manifest.json`
      : '/tonconnect-manifest.json';

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      // Match the terminal aesthetic. 'DARK' is the string value of THEME.DARK;
      // passed as a literal here to avoid a static import from the package
      // (which would pull it into the SSR bundle).
      uiPreferences={{ theme: 'DARK' as any }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
