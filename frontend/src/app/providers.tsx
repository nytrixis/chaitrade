"use client";

import { ReactNode } from "react";
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { avalancheFuji } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "ChaiTrade",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6", // Fallback ID for demo
  chains: [avalancheFuji],
  ssr: true,
});

const queryClient = new QueryClient();

// Custom ChaiTrade theme with sage green colors
const chaiTradeTheme = darkTheme({
  accentColor: "#2ea573", // emerald-500 (balanced middle shade)
  accentColorForeground: "#ffffff", // white text
  borderRadius: "large",
  fontStack: "system",
  overlayBlur: "small",
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={chaiTradeTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
