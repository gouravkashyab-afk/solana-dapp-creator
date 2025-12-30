import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type SolanaNetwork = 'devnet' | 'mainnet-beta' | 'testnet';

interface NetworkConfig {
  name: string;
  endpoint: string;
  label: string;
  color: string;
}

export const NETWORK_CONFIGS: Record<SolanaNetwork, NetworkConfig> = {
  devnet: {
    name: 'devnet',
    endpoint: 'https://api.devnet.solana.com',
    label: 'Devnet',
    color: 'bg-green-500',
  },
  'mainnet-beta': {
    name: 'mainnet-beta',
    endpoint: 'https://api.mainnet-beta.solana.com',
    label: 'Mainnet',
    color: 'bg-red-500',
  },
  testnet: {
    name: 'testnet',
    endpoint: 'https://api.testnet.solana.com',
    label: 'Testnet',
    color: 'bg-yellow-500',
  },
};

interface SolanaNetworkContextType {
  network: SolanaNetwork;
  setNetwork: (network: SolanaNetwork) => void;
  endpoint: string;
  config: NetworkConfig;
  isMainnet: boolean;
}

const SolanaNetworkContext = createContext<SolanaNetworkContextType | null>(null);

export const useSolanaNetwork = () => {
  const context = useContext(SolanaNetworkContext);
  if (!context) {
    throw new Error('useSolanaNetwork must be used within a SolanaNetworkProvider');
  }
  return context;
};

interface SolanaNetworkProviderProps {
  children: ReactNode;
  defaultNetwork?: SolanaNetwork;
}

export const SolanaNetworkProvider: React.FC<SolanaNetworkProviderProps> = ({ 
  children, 
  defaultNetwork = 'devnet' 
}) => {
  const [network, setNetworkState] = useState<SolanaNetwork>(() => {
    // Try to restore from localStorage
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

  const config = NETWORK_CONFIGS[network];

  return (
    <SolanaNetworkContext.Provider
      value={{
        network,
        setNetwork,
        endpoint: config.endpoint,
        config,
        isMainnet: network === 'mainnet-beta',
      }}
    >
      {children}
    </SolanaNetworkContext.Provider>
  );
};
