'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';

export function WalletHeader() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  
  // Avalanche Fuji testnet chain ID is 43113
  const isWrongNetwork = isConnected && chainId !== 43113;

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      {isWrongNetwork && (
        <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium animate-pulse">
          Wrong Network - Switch to Fuji
        </div>
      )}
      <div className="backdrop-blur-md bg-charcoal/80 rounded-xl border border-medium-gray/30 p-1 shadow-lg">
        <ConnectButton
          chainStatus="icon"
          accountStatus="address"
          showBalance={false}
        />
      </div>
    </div>
  );
}
