// Solana Protocol Integration Helpers
// Pre-configured endpoints and helpers for popular Solana protocols

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

// Common Solana Token Addresses
export const TOKENS = {
  SOL: {
    mint: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Wrapped SOL',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  USDC: {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
  USDT: {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
  },
  BONK: {
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
  },
  JUP: {
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    symbol: 'JUP',
    name: 'Jupiter',
    decimals: 6,
    logoURI: 'https://static.jup.ag/jup/icon.png',
  },
  RAY: {
    mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    symbol: 'RAY',
    name: 'Raydium',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  },
  MSOL: {
    mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    symbol: 'mSOL',
    name: 'Marinade Staked SOL',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
  },
} as const;

// Jupiter API Integration
export const JupiterAPI = {
  baseUrl: 'https://quote-api.jup.ag/v6',

  async getQuote(params: {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippageBps?: number;
  }) {
    const { inputMint, outputMint, amount, slippageBps = 50 } = params;
    const url = `${this.baseUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
    const response = await fetch(url);
    return response.json();
  },

  async getSwapTransaction(params: {
    quoteResponse: unknown;
    userPublicKey: string;
    wrapAndUnwrapSol?: boolean;
  }) {
    const { quoteResponse, userPublicKey, wrapAndUnwrapSol = true } = params;
    const response = await fetch(`${this.baseUrl}/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol,
      }),
    });
    return response.json();
  },

  async getTokenList() {
    const response = await fetch('https://token.jup.ag/strict');
    return response.json();
  },
};

// Raydium Protocol Integration
export const RaydiumAPI = {
  baseUrl: 'https://api.raydium.io/v2',

  async getPools() {
    const response = await fetch(`${this.baseUrl}/main/pairs`);
    return response.json();
  },

  async getPoolInfo(poolId: string) {
    const response = await fetch(`${this.baseUrl}/main/pool/${poolId}`);
    return response.json();
  },
};

// Helius RPC (for enhanced APIs)
export const HeliusAPI = {
  getEndpoint: (apiKey: string, cluster: 'mainnet' | 'devnet' = 'mainnet') => {
    return `https://${cluster}.helius-rpc.com/?api-key=${apiKey}`;
  },

  async getAssetsByOwner(apiKey: string, ownerAddress: string) {
    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'helius-assets',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress,
          page: 1,
          limit: 1000,
        },
      }),
    });
    return response.json();
  },
};

// Bonding Curve Helpers (for token launchpads)
export const BondingCurve = {
  // Linear bonding curve: price = basePrice + (supply * slope)
  calculateLinearPrice(supply: number, basePrice: number = 0.00001, slope: number = 0.0000001): number {
    return basePrice + supply * slope;
  },

  // Exponential bonding curve: price = basePrice * (1 + rate)^supply
  calculateExponentialPrice(supply: number, basePrice: number = 0.00001, rate: number = 0.0001): number {
    return basePrice * Math.pow(1 + rate, supply);
  },

  // Calculate cost to buy tokens
  calculateBuyCost(currentSupply: number, amount: number, curveType: 'linear' | 'exponential' = 'linear'): number {
    let totalCost = 0;
    for (let i = 0; i < amount; i++) {
      const price = curveType === 'linear'
        ? this.calculateLinearPrice(currentSupply + i)
        : this.calculateExponentialPrice(currentSupply + i);
      totalCost += price;
    }
    return totalCost;
  },

  // Calculate return from selling tokens
  calculateSellReturn(currentSupply: number, amount: number, curveType: 'linear' | 'exponential' = 'linear'): number {
    let totalReturn = 0;
    for (let i = 0; i < amount; i++) {
      const price = curveType === 'linear'
        ? this.calculateLinearPrice(currentSupply - i - 1)
        : this.calculateExponentialPrice(currentSupply - i - 1);
      totalReturn += price;
    }
    return totalReturn;
  },
};

// NFT Metadata Standards
export const NFTMetadata = {
  createMetadata(params: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
    externalUrl?: string;
    animationUrl?: string;
  }) {
    return {
      name: params.name,
      symbol: params.symbol,
      description: params.description,
      image: params.image,
      external_url: params.externalUrl,
      animation_url: params.animationUrl,
      attributes: params.attributes || [],
      properties: {
        files: [{ uri: params.image, type: 'image/png' }],
        category: 'image',
      },
    };
  },
};

// Utility functions
export const SolanaUtils = {
  // Format lamports to SOL
  lamportsToSol(lamports: number): number {
    return lamports / 1_000_000_000;
  },

  // Format SOL to lamports
  solToLamports(sol: number): number {
    return Math.floor(sol * 1_000_000_000);
  },

  // Shorten address for display
  shortenAddress(address: string, chars: number = 4): string {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  },

  // Get explorer URL
  getExplorerUrl(signature: string, cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'mainnet-beta'): string {
    const baseUrl = 'https://explorer.solana.com';
    const clusterParam = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`;
    return `${baseUrl}/tx/${signature}${clusterParam}`;
  },

  // Get address explorer URL
  getAddressExplorerUrl(address: string, cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'mainnet-beta'): string {
    const baseUrl = 'https://explorer.solana.com';
    const clusterParam = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`;
    return `${baseUrl}/address/${address}${clusterParam}`;
  },

  // Format token amount with decimals
  formatTokenAmount(amount: number, decimals: number): string {
    const value = amount / Math.pow(10, decimals);
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(2)}K`;
    }
    return value.toFixed(decimals > 4 ? 4 : decimals);
  },
};
