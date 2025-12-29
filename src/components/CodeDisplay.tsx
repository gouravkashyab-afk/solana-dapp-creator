import React, { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Copy, Check, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { VirtualFile } from '@/hooks/useVirtualFileSystem';

interface CodeDisplayProps {
  files: VirtualFile[];
  activeFile: string | null;
  currentlyWriting: string | null;
  onFileSelect: (path: string) => void;
}

const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'ts':
      return 'typescript';
    case 'jsx':
    case 'js':
      return 'javascript';
    case 'json':
      return 'json';
    case 'html':
      return 'markup';
    case 'css':
      return 'css';
    default:
      return 'typescript';
  }
};

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  files,
  activeFile,
  currentlyWriting,
  onFileSelect,
}) => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const activeFileContent = files.find(f => f.path === activeFile);

  const handleCopy = async (content: string, path: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <FileCode className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No code generated yet</p>
        <p className="text-sm">Start chatting with Sakura to generate code</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-muted/30 overflow-x-auto">
        {files.map((file) => (
          <button
            key={file.path}
            onClick={() => onFileSelect(file.path)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap',
              file.path === activeFile
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
              file.path === currentlyWriting && 'ring-1 ring-primary animate-pulse'
            )}
          >
            {file.path.split('/').pop()}
          </button>
        ))}
      </div>

      {activeFileContent && (
        <div className="flex-1 relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 h-8"
            onClick={() => handleCopy(activeFileContent.content, activeFileContent.path)}
          >
            {copiedPath === activeFileContent.path ? (
              <><Check className="w-4 h-4 mr-1" />Copied</>
            ) : (
              <><Copy className="w-4 h-4 mr-1" />Copy</>
            )}
          </Button>

          <ScrollArea className="h-full">
            <Highlight
              theme={themes.nightOwl}
              code={activeFileContent.content || '// Loading...'}
              language={getLanguageFromPath(activeFileContent.path)}
            >
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={cn(className, 'p-4 text-sm')} style={{ ...style, background: 'transparent', margin: 0 }}>
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      <span className="inline-block w-8 text-right mr-4 text-muted-foreground/50 select-none">{i + 1}</span>
                      {line.map((token, key) => <span key={key} {...getTokenProps({ token })} />)}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default CodeDisplay;
