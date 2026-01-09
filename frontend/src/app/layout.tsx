import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import NavDockWrapper from "@/components/NavDockWrapper";
import { Toaster } from "react-hot-toast";
import { WalletHeader } from "@/components/layout/WalletHeader";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "ChaiTrade - Community-Powered MSME Financing",
  description:
    "Privacy-preserving invoice financing platform on Avalanche. MSMEs get instant funding with ZK-proven credit scores.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>
          <WalletHeader />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#f9fafb',
                border: '1px solid rgba(61, 139, 104, 0.3)',
              },
              success: {
                iconTheme: {
                  primary: '#3d8b68',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          {children}
          <Footer />
          <NavDockWrapper />
        </Providers>
      </body>
    </html>
  );
}
