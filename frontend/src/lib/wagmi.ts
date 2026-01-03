import { createConfig, http } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const wagmiConfig = getDefaultConfig({
  appName: 'ChaiTrade',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'chaitrade-dev',
  chains: [avalancheFuji],
  transports: {
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
  },
});

export const avalancheFujiConfig = {
  name: 'Avalanche Fuji Testnet',
  chainId: 43113,
  rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorer: 'https://testnet.snowtrace.io/',
  faucet: 'https://faucet.avax.network/',
};
