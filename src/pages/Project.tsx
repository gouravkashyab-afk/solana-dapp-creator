import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useAuth } from '@/hooks/useAuth';
import { useAIChat, AIChatMessage } from '@/hooks/useAIChat';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { useArtifactParser } from '@/hooks/useArtifactParser';
import { useVirtualFileSystem } from '@/hooks/useVirtualFileSystem';
import SakuraIcon from '@/components/SakuraIcon';
import CodePreview from '@/components/CodePreview';
import CodeDisplay from '@/components/CodeDisplay';
import { FileExplorer } from '@/components/FileExplorer';
import { ShellPanel } from '@/components/ShellPanel';
import {
  ArrowLeft,
  Send,
  Loader2,
  Code,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'preview' | 'code';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const Project = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { projects } = useProjects();
  const { messages, sendMessage, isLoading } = useAIChat();
  const { toast } = useToast();
  const { artifact, parseFullContent, reset: resetParser } = useArtifactParser();
  const vfs = useVirtualFileSystem();

  const [input, setInput] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const project = projects.find((p) => p.id === projectId);

  // Sync artifact to VFS
  useEffect(() => {
    if (artifact) {
      vfs.setProjectTitle(artifact.title);
      artifact.files.forEach((file, path) => {
        vfs.updateFileContent(path, file.content, file.isComplete);
      });
      // Process shell commands for dependencies
      artifact.shellCommands.forEach(cmd => {
        if (cmd.includes('npm install')) {
          vfs.addDependency(cmd);
        }
      });
    }
  }, [artifact]);

  // Parse artifact from latest assistant message
  useEffect(() => {
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMessage?.content) {
      parseFullContent(lastAssistantMessage.content);
    }
  }, [messages, parseFullContent]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    resetParser();
    vfs.reset();

    try {
      await sendMessage(userMessage);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = useCallback((path: string) => {
    vfs.setActiveFile(path);
    setViewMode('code');
  }, [vfs]);

  const handleDependencyInstalled = useCallback((cmd: string) => {
    vfs.addDependency(cmd);
  }, [vfs]);

  // Get files array - this creates a new reference when VFS updates
  const allFiles = vfs.getAllFiles();
  const filesKey = allFiles.map(f => `${f.path}:${f.content?.length || 0}`).join('|');

  // Generate preview HTML from VFS
  const previewHtml = useMemo(() => {
    if (allFiles.length === 0) return null;

    const appFile = allFiles.find((f) => f.path.endsWith('App.tsx') || f.path.endsWith('App.jsx'));
    if (!appFile || !appFile.content) return null;

    // Strip imports/exports for inline Babel execution
    const processedAppCode = appFile.content
      .replace(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];\s*$/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"];\s*$/gm, '')
      .replace(/^\s*export\s+\{[\s\S]*?\};\s*$/gm, '')
      .replace(/^\s*export\s+default\s+function\s+(\w+)/m, 'function $1')
      .replace(/^\s*export\s+default\s+/m, 'const App = ')
      .replace(/^\s*export\s+default\s+\w+\s*;\s*$/gm, '');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${vfs.projectTitle || 'Preview'}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react,typescript">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    
    // Icon stubs
    const Plus = (props) => <span {...props}>+</span>;
    const Minus = (props) => <span {...props}>−</span>;

    ${processedAppCode}

    try {
      const rootEl = document.getElementById('root');
      if (typeof App !== 'undefined') {
        ReactDOM.createRoot(rootEl).render(<App />);
      } else {
        rootEl.innerHTML = '<div style="padding:20px;color:#888">No App component found</div>';
      }
    } catch (err) {
      document.getElementById('root').innerHTML = '<div style="padding:20px;color:red">' + err.message + '</div>';
    }
  <\/script>
</body>
</html>`;
  }, [filesKey, vfs.projectTitle]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const hasFiles = allFiles.length > 0;

  const appCode =
    allFiles.find((f) => f.path.endsWith('App.tsx') || f.path.endsWith('App.jsx'))?.content ?? null;

  const hasRenderablePreview = Boolean(appCode && appCode.trim().length > 0);

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <SakuraIcon size="sm" />
              <span className="font-semibold">{artifact?.title || project?.name || 'Project'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* File Explorer Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFileExplorer(!showFileExplorer)}
              className="h-8 w-8"
            >
              {showFileExplorer ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeft className="w-4 h-4" />
              )}
            </Button>

            {/* View Mode Toggles */}
            <div className="flex items-center border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('preview')}
                className="h-7 px-3"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button
                variant={viewMode === 'code' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('code')}
                className="h-7 px-3"
              >
                <Code className="w-4 h-4 mr-1" />
                Code
              </Button>
            </div>

            {/* Device Mode */}
            {viewMode === 'preview' && (
              <div className="flex items-center border border-border rounded-lg p-1">
                <Button
                  variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setDeviceMode('desktop')}
                  className="h-7 w-7"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={deviceMode === 'tablet' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setDeviceMode('tablet')}
                  className="h-7 w-7"
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setDeviceMode('mobile')}
                  className="h-7 w-7"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
            )}

            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Chat Panel */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="flex flex-col h-full border-r border-border bg-background">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}

                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="shrink-0 pt-1">
                        <SakuraIcon size="sm" glow />
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sakura is thinking...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="max-w-3xl mx-auto flex gap-2">
                  <Input
                    placeholder="Describe what you want to build..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel */}
          <ResizablePanel defaultSize={60}>
            <div className="flex h-full">
              {/* File Explorer */}
              {showFileExplorer && (
                <FileExplorer
                  fileTree={vfs.getFileTree()}
                  activeFile={vfs.activeFile}
                  currentlyWriting={artifact?.currentFile || null}
                  onFileSelect={handleFileSelect}
                  projectTitle={vfs.projectTitle}
                  className="w-56 shrink-0"
                />
              )}

              {/* Preview/Code Panel */}
              <div className="flex-1 flex flex-col bg-[#011627]">
                {viewMode === 'preview' ? (
                  hasRenderablePreview ? (
                    <CodePreview html={appCode!} deviceMode={deviceMode} />
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-8">
                      <div className="text-center text-muted-foreground">
                        <SakuraIcon size="lg" className="mb-4 mx-auto" />
                        <p className="text-lg font-medium">Live preview will appear here</p>
                        <p className="text-sm">Start chatting with Sakura to build your app</p>
                      </div>
                    </div>
                  )
                ) : (
                  <CodeDisplay
                    files={allFiles}
                    activeFile={vfs.activeFile}
                    currentlyWriting={artifact?.currentFile || null}
                    onFileSelect={handleFileSelect}
                  />
                )}

                {/* Shell Panel */}
                {artifact && artifact.shellCommands.length > 0 && (
                  <ShellPanel
                    commands={artifact.shellCommands}
                    onDependencyInstalled={handleDependencyInstalled}
                  />
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }: { message: AIChatMessage }) => {
  const isUser = message.role === 'user';

  // For assistant messages, hide the raw XML artifacts from display
  const displayContent = isUser 
    ? message.content 
    : message.content.replace(/<boltArtifact[\s\S]*?<\/boltArtifact>/g, '').trim() || 'Building your app...';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {!isUser && (
        <div className="shrink-0 pt-1">
          <SakuraIcon size="sm" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border border-border'
        )}
      >
        <p className="whitespace-pre-wrap">{displayContent}</p>
      </div>
    </div>
  );
};

export default Project;
