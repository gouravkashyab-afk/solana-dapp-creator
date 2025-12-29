import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder,
  FileCode,
  FileJson,
  FileText,
  Download
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileTreeNode, VirtualFile } from '@/hooks/useVirtualFileSystem';

interface FileExplorerProps {
  fileTree: FileTreeNode[];
  activeFile: string | null;
  currentlyWriting: string | null;
  onFileSelect: (path: string) => void;
  onDownloadProject?: () => void;
  projectTitle?: string;
  className?: string;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return <FileCode className="h-4 w-4 text-blue-400" />;
    case 'json':
      return <FileJson className="h-4 w-4 text-yellow-400" />;
    case 'html':
      return <FileCode className="h-4 w-4 text-orange-400" />;
    case 'css':
      return <FileText className="h-4 w-4 text-purple-400" />;
    case 'md':
      return <FileText className="h-4 w-4 text-gray-400" />;
    default:
      return <File className="h-4 w-4 text-muted-foreground" />;
  }
};

interface TreeNodeProps {
  node: FileTreeNode;
  depth: number;
  activeFile: string | null;
  currentlyWriting: string | null;
  onFileSelect: (path: string) => void;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  depth,
  activeFile,
  currentlyWriting,
  onFileSelect,
  expandedFolders,
  toggleFolder,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isExpanded = expandedFolders.has(node.path);
  const isActive = node.path === activeFile;
  const isWriting = node.path === currentlyWriting;

  // Auto-scroll to active file
  useEffect(() => {
    if (isActive && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive]);

  if (node.type === 'folder') {
    return (
      <div>
        <div
          ref={nodeRef}
          className={cn(
            'flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-accent/50 rounded-sm',
            'transition-colors duration-150'
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => toggleFolder(node.path)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Folder className={cn(
            'h-4 w-4',
            isExpanded ? 'text-yellow-500' : 'text-yellow-600'
          )} />
          <span className="text-sm text-foreground">{node.name}</span>
        </div>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                currentlyWriting={currentlyWriting}
                onFileSelect={onFileSelect}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={nodeRef}
      className={cn(
        'flex items-center gap-2 py-1 px-2 cursor-pointer rounded-sm',
        'transition-all duration-150',
        isActive && 'bg-accent text-accent-foreground',
        !isActive && 'hover:bg-accent/50',
        isWriting && 'ring-1 ring-primary animate-pulse'
      )}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
      onClick={() => onFileSelect(node.path)}
    >
      {getFileIcon(node.name)}
      <span className="text-sm truncate">{node.name}</span>
      {isWriting && (
        <span className="ml-auto text-xs text-primary">writing...</span>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
  fileTree,
  activeFile,
  currentlyWriting,
  onFileSelect,
  onDownloadProject,
  projectTitle,
  className,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Auto-expand folders containing the currently writing file
  useEffect(() => {
    if (currentlyWriting) {
      const parts = currentlyWriting.split('/');
      const foldersToExpand = new Set(expandedFolders);
      let currentPath = '';
      
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
        foldersToExpand.add(currentPath);
      }
      
      setExpandedFolders(foldersToExpand);
    }
  }, [currentlyWriting]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className={cn('flex flex-col h-full bg-card border-r border-border', className)}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm font-medium text-foreground truncate">
          {projectTitle || 'Files'}
        </span>
        {onDownloadProject && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onDownloadProject}
            title="Download Project"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="py-2">
          {fileTree.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No files yet
            </div>
          ) : (
            fileTree.map((node) => (
              <TreeNode
                key={node.path}
                node={node}
                depth={0}
                activeFile={activeFile}
                currentlyWriting={currentlyWriting}
                onFileSelect={onFileSelect}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
