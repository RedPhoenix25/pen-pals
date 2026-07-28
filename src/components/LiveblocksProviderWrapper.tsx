"use client";

import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { ReactNode } from "react";

export function LiveblocksProviderWrapper({ children }: { children: ReactNode }) {
  // We use a public API key for development, or a secret key/auth endpoint for production.
  // The public key allows us to prototype without setting up custom auth immediately.
  const apiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "pk_dummy_placeholder_for_build_purposes";

  return (
    <LiveblocksProvider publicApiKey={apiKey}>
      {children}
    </LiveblocksProvider>
  );
}
