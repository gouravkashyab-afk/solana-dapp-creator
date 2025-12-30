import { useEffect, useMemo, useRef } from 'react';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { transform } from 'sucrase';
import { cn } from '@/lib/utils';

interface CodePreviewProps {
  /**
   * NOTE: This prop name is legacy.
   * We pass the generated App.tsx source here (not HTML).
   */
  html: string;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
}

function preprocessAppSource(source: string) {
  return source
    // Strip all import statements (single-line and multi-line)
    .replace(/import\s+[\s\S]*?from\s*['"][^'"]*['"];?/g, '')
    .replace(/import\s*['"][^'"]*['"];?/g, '')
    // Strip named exports
    .replace(/export\s*\{[^}]*\};?/g, '')
    // Convert "export default function Name" to "function App"
    .replace(/export\s+default\s+function\s+\w+/g, 'function App')
    // Convert "export default () =>" or "export default Name" to "const App ="
    .replace(/export\s+default\s+/g, 'const App = ')
    // Remove standalone "export default ComponentName;" at end
    .replace(/^const App = \w+;?\s*$/gm, '');
}

const CodePreview = ({ html: appSource, deviceMode }: CodePreviewProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const runtimeRootRef = useRef<Root | null>(null);

  const compilation = useMemo(() => {
    const processed = preprocessAppSource(appSource ?? '');

    try {
      const js = transform(processed, {
        transforms: ['typescript', 'jsx'],
      }).code;
      return { js, error: null as string | null };
    } catch (e) {
      return {
        js: null as string | null,
        error: e instanceof Error ? e.message : 'Failed to compile preview source',
      };
    }
  }, [appSource]);

  useEffect(() => {
    if (!mountRef.current) return;

    if (!runtimeRootRef.current) {
      runtimeRootRef.current = createRoot(mountRef.current);
    }

    // Always render *something* so the user never sees a blank preview.
    if (!appSource?.trim()) {
      runtimeRootRef.current.render(
        <div className="min-h-full p-6 text-sm text-muted-foreground">
          No <code>App.tsx</code> content yet.
        </div>
      );
      return;
    }

    if (compilation.error || !compilation.js) {
      runtimeRootRef.current.render(
        <div className="min-h-full p-6 text-sm text-destructive">
          Preview compile error: {compilation.error}
        </div>
      );
      return;
    }

    try {
      const factory = new Function(
        'React',
        `"use strict";
         const { useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext, createContext, forwardRef, memo, Fragment } = React;

         // Comprehensive lucide-react icon stubs
         const createIcon = (symbol) => (props) => React.createElement('span', { 
           ...props, 
           style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1em', height: '1em', ...props?.style }
         }, symbol);
         
         const Plus = createIcon('+');
         const Minus = createIcon('−');
         const X = createIcon('✕');
         const Check = createIcon('✓');
         const ChevronRight = createIcon('›');
         const ChevronLeft = createIcon('‹');
         const ChevronUp = createIcon('∧');
         const ChevronDown = createIcon('∨');
         const ArrowRight = createIcon('→');
         const ArrowLeft = createIcon('←');
         const ArrowUp = createIcon('↑');
         const ArrowDown = createIcon('↓');
         const Search = createIcon('🔍');
         const Menu = createIcon('☰');
         const Home = createIcon('⌂');
         const Settings = createIcon('⚙');
         const User = createIcon('👤');
         const Users = createIcon('👥');
         const Mail = createIcon('✉');
         const Heart = createIcon('♥');
         const Star = createIcon('★');
         const Edit = createIcon('✎');
         const Trash = createIcon('🗑');
         const Trash2 = createIcon('🗑');
         const Save = createIcon('💾');
         const Download = createIcon('⬇');
         const Upload = createIcon('⬆');
         const Eye = createIcon('👁');
         const EyeOff = createIcon('🚫');
         const Lock = createIcon('🔒');
         const Unlock = createIcon('🔓');
         const Loader2 = createIcon('⟳');
         const RefreshCw = createIcon('↻');
         const Copy = createIcon('📋');
         const Share = createIcon('↗');
         const ExternalLink = createIcon('↗');
         const Link = createIcon('🔗');
         const Globe = createIcon('🌐');
         const Send = createIcon('➤');
         const AlertCircle = createIcon('⚠');
         const CheckCircle = createIcon('✓');
         const Info = createIcon('ℹ');
         const Zap = createIcon('⚡');
         const TrendingUp = createIcon('📈');
         const DollarSign = createIcon('$');
         const CreditCard = createIcon('💳');
         const ShoppingCart = createIcon('🛒');
         const Wallet = createIcon('👛');
         const Coins = createIcon('🪙');
         const Gem = createIcon('💎');
         const Rocket = createIcon('🚀');
         const Sparkles = createIcon('✨');
         const Image = createIcon('🖼');
         const Shield = createIcon('🛡');
         const ArrowRightLeft = createIcon('⇄');
         
         // Solana Web3 stubs for preview
         const LAMPORTS_PER_SOL = 1000000000;
         
         class PublicKey {
           constructor(key) { this._key = typeof key === 'string' ? key : 'MockPublicKey'; }
           toBase58() { return this._key; }
           toString() { return this._key; }
           static findProgramAddressSync(seeds, programId) { return [new PublicKey('MockPDA'), 255]; }
         }
         
         class Connection {
           constructor(endpoint) { this.endpoint = endpoint; }
           getBalance(pubkey) { return Promise.resolve(5000000000); }
           getLatestBlockhash() { return Promise.resolve({ blockhash: 'mock-hash', lastValidBlockHeight: 100 }); }
           confirmTransaction(sig) { return Promise.resolve({ value: { err: null } }); }
         }
         
         const clusterApiUrl = (cluster) => 'https://api.' + cluster + '.solana.com';
         
         // Wallet Adapter stubs
         const useWallet = () => ({
           publicKey: new PublicKey('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'),
           connected: true,
           connecting: false,
           disconnect: () => Promise.resolve(),
           select: () => {},
           signTransaction: async (tx) => tx,
           signAllTransactions: async (txs) => txs,
           sendTransaction: async () => 'mock-signature-12345',
         });
         
         const useConnection = () => ({ connection: new Connection('https://api.devnet.solana.com') });
         const useAnchorWallet = () => useWallet();
         
         const WalletMultiButton = (props) => React.createElement('button', {
           className: 'px-4 py-2 bg-gradient-to-r from-purple-600 to-green-400 text-white rounded-lg font-semibold',
           ...props
         }, '👛 Connected');
         
         const ConnectionProvider = ({ children }) => children;
         const WalletProvider = ({ children }) => children;
         const WalletModalProvider = ({ children }) => children;
         
         class PhantomWalletAdapter { name = 'Phantom'; }
         class SolflareWalletAdapter { name = 'Solflare'; }

         ${compilation.js}

         return typeof App !== 'undefined' ? App : null;`
      );

      const AppComponent = factory(React);

      if (!AppComponent) {
        runtimeRootRef.current.render(
          <div className="min-h-full p-6 text-sm text-muted-foreground">
            No <code>App</code> component found.
          </div>
        );
        return;
      }

      runtimeRootRef.current.render(React.createElement(AppComponent));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown runtime error';
      runtimeRootRef.current.render(
        <div className="min-h-full p-6 text-sm text-destructive">
          Preview runtime error: {message}
        </div>
      );
    }
  }, [appSource, compilation.error, compilation.js]);

  useEffect(() => {
    return () => {
      runtimeRootRef.current?.unmount();
      runtimeRootRef.current = null;
    };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div
        className={cn(
          'bg-card border border-border rounded-lg shadow-xl transition-all duration-300 overflow-hidden',
          deviceMode === 'desktop' && 'w-full h-full',
          deviceMode === 'tablet' && 'w-[768px] h-[1024px] max-h-full',
          deviceMode === 'mobile' && 'w-[375px] h-[667px]'
        )}
      >
        <div className="w-full h-full bg-background">
          <div ref={mountRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default CodePreview;
