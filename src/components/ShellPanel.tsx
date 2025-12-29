import React, { useState, useEffect } from 'react';
import { Terminal, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CommandStatus {
  command: string;
  status: 'pending' | 'running' | 'complete';
}

interface ShellPanelProps {
  commands: string[];
  onDependencyInstalled?: (packageName: string) => void;
  className?: string;
}

export const ShellPanel: React.FC<ShellPanelProps> = ({
  commands,
  onDependencyInstalled,
  className,
}) => {
  const [commandStatuses, setCommandStatuses] = useState<CommandStatus[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Process new commands
    const existingCommands = new Set(commandStatuses.map(c => c.command));
    const newCommands = commands.filter(cmd => !existingCommands.has(cmd));

    if (newCommands.length === 0) return;

    // Add new commands with pending status
    setCommandStatuses(prev => [
      ...prev,
      ...newCommands.map(cmd => ({ command: cmd, status: 'pending' as const })),
    ]);

    // Simulate command execution
    newCommands.forEach((cmd, index) => {
      const delay = index * 500;
      
      // Set to running
      setTimeout(() => {
        setCommandStatuses(prev =>
          prev.map(c => c.command === cmd ? { ...c, status: 'running' } : c)
        );
      }, delay);

      // Set to complete after "execution"
      setTimeout(() => {
        setCommandStatuses(prev =>
          prev.map(c => c.command === cmd ? { ...c, status: 'complete' } : c)
        );
        
        // Notify about installed dependencies
        if (cmd.includes('npm install') && onDependencyInstalled) {
          onDependencyInstalled(cmd);
        }
      }, delay + 1500);
    });
  }, [commands, onDependencyInstalled]);

  if (commands.length === 0) return null;

  return (
    <div className={cn('border-t border-border bg-[#1a1a1a]', className)}>
      <div 
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#252525]"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-green-500" />
          <span className="text-xs font-medium text-muted-foreground">
            Preview Environment
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          {isCollapsed ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <ScrollArea className="h-32">
          <div className="p-3 font-mono text-sm space-y-1">
            {commandStatuses.map((cmd, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-green-500">$</span>
                <span className="text-gray-300">{cmd.command}</span>
                {cmd.status === 'running' && (
                  <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
                )}
                {cmd.status === 'complete' && (
                  <Check className="h-3 w-3 text-green-500" />
                )}
              </div>
            ))}
            {commandStatuses.some(c => c.status === 'running') && (
              <div className="text-gray-500 animate-pulse">
                Processing...
              </div>
            )}
            {commandStatuses.length > 0 && commandStatuses.every(c => c.status === 'complete') && (
              <div className="text-green-400 mt-2">
                ✓ Ready at localhost:5173
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
