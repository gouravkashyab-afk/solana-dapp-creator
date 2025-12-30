import { useState, useCallback, useMemo } from 'react';

export type SolanaNetwork = 'devnet' | 'mainnet-beta' | 'testnet';

interface NetworkConfig {
  name: string;
  endpoint: string;
  label: string;
  color: string;
  explorerUrl: string;
}

const NETWORK_CONFIGS: Record<SolanaNetwork, NetworkConfig> = {
  devnet: {
    name: 'devnet',
    endpoint: 'https://api.devnet.solana.com',
    label: 'Devnet',
    color: 'bg-green-500',
    explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
  },
  'mainnet-beta': {
    name: 'mainnet-beta',
    endpoint: 'https://api.mainnet-beta.solana.com',
    label: 'Mainnet',
    color: 'bg-red-500',
    explorerUrl: 'https://explorer.solana.com',
  },
  testnet: {
    name: 'testnet',
    endpoint: 'https://api.testnet.solana.com',
    label: 'Testnet',
    color: 'bg-yellow-500',
    explorerUrl: 'https://explorer.solana.com/?cluster=testnet',
  },
};

export const useSolanaNetwork = (defaultNetwork: SolanaNetwork = 'devnet') => {
  const [network, setNetworkState] = useState<SolanaNetwork>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sakura-solana-network');
      if (saved && (saved === 'devnet' || saved === 'mainnet-beta' || saved === 'testnet')) {
        return saved as SolanaNetwork;
      }
    }
    return defaultNetwork;
  });

  const setNetwork = useCallback((newNetwork: SolanaNetwork) => {
    setNetworkState(newNetwork);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sakura-solana-network', newNetwork);
    }
  }, []);

  const config = useMemo(() => NETWORK_CONFIGS[network], [network]);

  const getExplorerUrl = useCallback((signature: string, type: 'tx' | 'address' = 'tx') => {
    const base = config.explorerUrl;
    if (type === 'tx') {
      return `${base.replace('?cluster=', '/tx/' + signature + '?cluster=').replace(/\/$/, '')}/tx/${signature}`;
    }
    return `${base.replace('?cluster=', '/address/' + signature + '?cluster=').replace(/\/$/, '')}/address/${signature}`;
  }, [config]);

  return {
    network,
    setNetwork,
    endpoint: config.endpoint,
    config,
    isMainnet: network === 'mainnet-beta',
    getExplorerUrl,
    allNetworks: Object.keys(NETWORK_CONFIGS) as SolanaNetwork[],
    networkConfigs: NETWORK_CONFIGS,
  };
};
