import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, FileCode } from 'lucide-react';
import { ExtractedCode } from '@/hooks/useCodeExtractor';
import { cn } from '@/lib/utils';

interface CodeDisplayProps {
  codeBlocks: ExtractedCode[];
}

const CodeDisplay = ({ codeBlocks }: CodeDisplayProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleCopy = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (codeBlocks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FileCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No code generated yet</p>
          <p className="text-sm">Ask Sakura to build something!</p>
        </div>
      </div>
    );
  }

  const currentBlock = codeBlocks[selectedIndex];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* File tabs */}
      {codeBlocks.length > 1 && (
        <div className="flex gap-1 p-2 border-b border-border bg-muted/30 overflow-x-auto">
          {codeBlocks.map((block, index) => (
            <Button
              key={index}
              variant={selectedIndex === index ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedIndex(index)}
              className="h-7 px-3 shrink-0"
            >
              {block.fileName || `${block.language} #${index + 1}`}
            </Button>
          ))}
        </div>
      )}

      {/* Code content */}
      <div className="flex-1 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCopy(currentBlock.code, selectedIndex)}
          className="absolute top-2 right-2 z-10"
        >
          {copiedIndex === selectedIndex ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
        
        <ScrollArea className="h-full">
          <pre className="p-4 text-sm font-mono">
            <code className={cn(
              'block whitespace-pre-wrap break-words',
              'text-foreground'
            )}>
              {currentBlock.code}
            </code>
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CodeDisplay;
