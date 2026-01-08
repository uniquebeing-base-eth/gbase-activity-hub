import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { fallback } from 'viem';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [farcasterMiniApp()],
  transports: {
    [base.id]: fallback([
      http('https://mainnet.base.org'),
      http('https://base.llamarpc.com'),
    ]),
  },
  ssr: true,
});
