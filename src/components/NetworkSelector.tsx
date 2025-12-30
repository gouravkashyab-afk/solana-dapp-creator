import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, ChevronDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SolanaNetwork = 'devnet' | 'mainnet-beta' | 'testnet';

interface NetworkConfig {
  label: string;
  color: string;
  description: string;
}

const NETWORKS: Record<SolanaNetwork, NetworkConfig> = {
  devnet: {
    label: 'Devnet',
    color: 'bg-green-500',
    description: 'Testing network (free SOL)',
  },
  'mainnet-beta': {
    label: 'Mainnet',
    color: 'bg-red-500',
    description: 'Real transactions',
  },
  testnet: {
    label: 'Testnet',
    color: 'bg-yellow-500',
    description: 'Validator testing',
  },
};

interface NetworkSelectorProps {
  network: SolanaNetwork;
  onNetworkChange: (network: SolanaNetwork) => void;
  className?: string;
  showWarning?: boolean;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  network,
  onNetworkChange,
  className,
  showWarning = true,
}) => {
  const currentNetwork = NETWORKS[network];
  const isMainnet = network === 'mainnet-beta';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("gap-2 h-8", className)}
        >
          <span className={cn("w-2 h-2 rounded-full", currentNetwork.color)} />
          <Globe className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{currentNetwork.label}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(Object.keys(NETWORKS) as SolanaNetwork[]).map((net) => {
          const config = NETWORKS[net];
          const isActive = network === net;
          const isMainnetOption = net === 'mainnet-beta';

          return (
            <DropdownMenuItem
              key={net}
              onClick={() => onNetworkChange(net)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                isActive && "bg-accent"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", config.color)} />
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{config.label}</span>
                  {isMainnetOption && showWarning && (
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {config.description}
                </span>
              </div>
              {isActive && (
                <span className="text-xs text-primary">Active</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NetworkSelector;
