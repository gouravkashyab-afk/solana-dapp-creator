import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface Web3PreviewFrameProps {
  appSource: string;
  network: 'devnet' | 'mainnet-beta' | 'testnet';
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  projectTitle?: string;
}

const NETWORK_ENDPOINTS = {
  devnet: 'https://api.devnet.solana.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  testnet: 'https://api.testnet.solana.com',
};

export const Web3PreviewFrame: React.FC<Web3PreviewFrameProps> = ({
  appSource,
  network,
  deviceMode,
  projectTitle = 'Solana dApp',
}) => {
  const previewHtml = useMemo(() => {
    if (!appSource?.trim()) return null;

    // Process app source - strip imports/exports
    const processedAppCode = appSource
      .replace(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];\s*$/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"];\s*$/gm, '')
      .replace(/^\s*export\s+\{[\s\S]*?\};\s*$/gm, '')
      .replace(/^\s*export\s+default\s+function\s+(\w+)/m, 'function App')
      .replace(/^\s*export\s+default\s+/m, 'const App = ')
      .replace(/^\s*export\s+default\s+\w+\s*;\s*$/gm, '');

    const endpoint = NETWORK_ENDPOINTS[network];

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectTitle}</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"><\/script>
  
  <!-- React -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  
  <!-- Babel for JSX -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  
  <!-- Solana Web3.js -->
  <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js"><\/script>
  
  <!-- Buffer polyfill for Solana -->
  <script src="https://bundle.run/buffer@6.0.3"><\/script>
  <script>window.Buffer = buffer.Buffer;<\/script>
  
  <style>
    body { 
      margin: 0; 
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
    }
    #root { min-height: 100vh; }
    
    /* Wallet button styles */
    .wallet-adapter-button {
      background: linear-gradient(135deg, #9945FF 0%, #14F195 100%);
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 24px;
      transition: all 0.2s ease;
    }
    .wallet-adapter-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(153, 69, 255, 0.3);
    }
    .wallet-adapter-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Network badge */
    .network-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
    }
    .network-devnet { background: #22c55e20; color: #22c55e; }
    .network-mainnet { background: #ef444420; color: #ef4444; }
    .network-testnet { background: #eab30820; color: #eab308; }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel" data-presets="react,typescript">
    const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } = React;
    const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } = solanaWeb3;
    
    // Current network configuration
    const SOLANA_NETWORK = '${network}';
    const SOLANA_ENDPOINT = '${endpoint}';
    
    // Solana Connection singleton
    const connection = new Connection(SOLANA_ENDPOINT, 'confirmed');
    
    // Mock wallet context for preview (real wallet requires extension)
    const WalletContext = createContext(null);
    
    const useWallet = () => {
      const context = useContext(WalletContext);
      return context || {
        publicKey: null,
        connected: false,
        connecting: false,
        disconnect: () => {},
        select: () => {},
        wallet: null,
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
        sendTransaction: async () => '',
      };
    };
    
    const useConnection = () => ({ connection });
    
    // Wallet Multi Button Component
    const WalletMultiButton = ({ className = '', ...props }) => {
      const [isConnecting, setIsConnecting] = useState(false);
      const [walletAddress, setWalletAddress] = useState(null);
      const [balance, setBalance] = useState(null);
      
      const connectWallet = async () => {
        setIsConnecting(true);
        try {
          // Check for Phantom or other Solana wallets
          const provider = window.solana || window.phantom?.solana;
          if (provider?.isPhantom) {
            const response = await provider.connect();
            const pubKey = response.publicKey.toString();
            setWalletAddress(pubKey);
            
            // Fetch balance
            const bal = await connection.getBalance(new PublicKey(pubKey));
            setBalance(bal / LAMPORTS_PER_SOL);
          } else {
            alert('Please install Phantom wallet extension!\\nhttps://phantom.app/');
          }
        } catch (error) {
          console.error('Wallet connection error:', error);
        } finally {
          setIsConnecting(false);
        }
      };
      
      const disconnectWallet = async () => {
        try {
          const provider = window.solana || window.phantom?.solana;
          if (provider) {
            await provider.disconnect();
          }
        } catch (e) {}
        setWalletAddress(null);
        setBalance(null);
      };
      
      if (walletAddress) {
        return (
          <button 
            onClick={disconnectWallet}
            className={\`wallet-adapter-button \${className}\`}
            {...props}
          >
            {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)} ({balance?.toFixed(2)} SOL)
          </button>
        );
      }
      
      return (
        <button 
          onClick={connectWallet}
          disabled={isConnecting}
          className={\`wallet-adapter-button \${className}\`}
          {...props}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      );
    };
    
    // Network Badge Component
    const NetworkBadge = () => (
      <div className={\`network-badge network-\${SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet' : SOLANA_NETWORK}\`}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
        {SOLANA_NETWORK === 'mainnet-beta' ? 'Mainnet' : SOLANA_NETWORK.charAt(0).toUpperCase() + SOLANA_NETWORK.slice(1)}
      </div>
    );
    
    // Connection Provider wrapper (simplified for browser)
    const ConnectionProvider = ({ children, endpoint }) => children;
    const WalletProvider = ({ children, wallets, autoConnect }) => children;
    const WalletModalProvider = ({ children }) => children;
    
    // Wallet adapter classes (mocked for browser)
    class PhantomWalletAdapter { name = 'Phantom'; }
    class SolflareWalletAdapter { name = 'Solflare'; }
    class BackpackWalletAdapter { name = 'Backpack'; }
    
    // Icon stubs
    const createIcon = (symbol) => (props) => React.createElement('span', { 
      ...props, 
      style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1em', height: '1em', ...props?.style }
    }, symbol);
    
    const Wallet = createIcon('👛');
    const ArrowRightLeft = createIcon('⇄');
    const Coins = createIcon('🪙');
    const Send = createIcon('➤');
    const Plus = createIcon('+');
    const Minus = createIcon('−');
    const RefreshCw = createIcon('↻');
    const ExternalLink = createIcon('↗');
    const Copy = createIcon('📋');
    const Check = createIcon('✓');
    const X = createIcon('✕');
    const Loader2 = createIcon('⟳');
    const AlertCircle = createIcon('⚠');
    const CheckCircle = createIcon('✓');
    const ArrowUp = createIcon('↑');
    const ArrowDown = createIcon('↓');
    const TrendingUp = createIcon('📈');
    const Image = createIcon('🖼');
    const Sparkles = createIcon('✨');
    const Rocket = createIcon('🚀');
    const Zap = createIcon('⚡');
    const Globe = createIcon('🌐');
    const Shield = createIcon('🛡');
    const Lock = createIcon('🔒');
    const Settings = createIcon('⚙');
    const ChevronDown = createIcon('∨');
    const ChevronUp = createIcon('∧');
    const ChevronRight = createIcon('›');
    const ChevronLeft = createIcon('‹');
    const Search = createIcon('🔍');
    const Star = createIcon('★');
    const Heart = createIcon('♥');
    
    // User's app code
    ${processedAppCode}
    
    // Render
    try {
      const rootEl = document.getElementById('root');
      if (typeof App !== 'undefined') {
        ReactDOM.createRoot(rootEl).render(<App />);
      } else {
        rootEl.innerHTML = '<div style="padding: 40px; text-align: center; color: #888;">No App component found</div>';
      }
    } catch (err) {
      document.getElementById('root').innerHTML = 
        '<div style="padding: 40px; color: #ef4444; background: #1a1a2e; min-height: 100vh;">' +
        '<h2 style="margin-bottom: 16px;">Runtime Error</h2>' +
        '<pre style="background: #0f0f1a; padding: 16px; border-radius: 8px; overflow: auto;">' + 
        err.message + '</pre></div>';
    }
  <\/script>
</body>
</html>`;
  }, [appSource, network, projectTitle]);

  if (!previewHtml) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-4">🌸</div>
          <p className="text-lg font-medium">Web3 Preview</p>
          <p className="text-sm">Generate a Solana dApp to see the live preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-[#0a0a0f]">
      <div
        className={cn(
          'bg-background border border-border rounded-lg shadow-2xl overflow-hidden transition-all duration-300',
          deviceMode === 'desktop' && 'w-full h-full',
          deviceMode === 'tablet' && 'w-[768px] h-[1024px] max-h-full',
          deviceMode === 'mobile' && 'w-[375px] h-[667px]'
        )}
      >
        <iframe
          srcDoc={previewHtml}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          title="Web3 Preview"
        />
      </div>
    </div>
  );
};

export default Web3PreviewFrame;
