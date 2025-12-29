import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages, ChatMessage } from '@/hooks/useChatMessages';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import SakuraIcon from '@/components/SakuraIcon';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'chat' | 'preview' | 'code';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const Project = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { projects } = useProjects();
  const { messages, sendMessage, isLoading: messagesLoading } = useChatMessages(projectId ?? null);
  const { toast } = useToast();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    
    const userMessage = input.trim();
    setInput('');
    setIsSending(true);

    try {
      // Send user message
      await sendMessage.mutateAsync({ content: userMessage, role: 'user' });
      
      // TODO: Call AI edge function and stream response
      // For now, we'll add a placeholder assistant response
      await sendMessage.mutateAsync({
        content: `🌸 I received your message: "${userMessage}"\n\nI'm Sakura, your AI assistant. AI responses will be connected soon!`,
        role: 'assistant',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

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
              <span className="font-semibold">{project?.name || 'Project'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggles */}
            <div className="flex items-center border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'chat' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('chat')}
                className="h-7 px-3"
              >
                Chat
              </Button>
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

            {/* Device Mode (only in preview) */}
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
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div
          className={cn(
            'flex flex-col border-r border-border bg-background transition-all duration-300',
            viewMode === 'chat' ? 'w-full' : 'w-1/2'
          )}
        >
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="flex gap-3">
                  <div className="shrink-0 pt-1">
                    <SakuraIcon size="sm" glow />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-foreground">
                      Hi! I'm <span className="text-primary font-medium">Sakura</span>, your AI assistant for building Solana dApps.
                    </p>
                    <p className="text-muted-foreground">
                      Tell me what you'd like to build, and I'll help you create it. You can describe your dApp in plain English!
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <SuggestionChip onClick={() => setInput('Create a token swap interface')}>
                        Token Swap
                      </SuggestionChip>
                      <SuggestionChip onClick={() => setInput('Build an NFT minting page')}>
                        NFT Minting
                      </SuggestionChip>
                      <SuggestionChip onClick={() => setInput('Create a staking dashboard')}>
                        Staking Dashboard
                      </SuggestionChip>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {/* Loading indicator */}
              {isSending && (
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
                disabled={isSending}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!input.trim() || isSending}>
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview/Code Panel */}
        {viewMode !== 'chat' && (
          <div className="flex-1 flex flex-col bg-muted/20">
            {viewMode === 'preview' ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div
                  className={cn(
                    'bg-card border border-border rounded-lg shadow-xl transition-all duration-300',
                    deviceMode === 'desktop' && 'w-full h-full',
                    deviceMode === 'tablet' && 'w-[768px] h-[1024px] max-h-full',
                    deviceMode === 'mobile' && 'w-[375px] h-[667px]'
                  )}
                >
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <SakuraIcon size="lg" className="mb-4" />
                      <p>Live preview will appear here</p>
                      <p className="text-sm">Start chatting with Sakura to build your dApp</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 font-mono text-sm">
                  <div className="bg-card border border-border rounded-lg p-4 h-full overflow-auto">
                    <p className="text-muted-foreground">// Generated code will appear here</p>
                    <p className="text-muted-foreground">// Start chatting with Sakura to generate code</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';

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
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

const SuggestionChip = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 text-sm rounded-full border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-colors"
  >
    {children}
  </button>
);

export default Project;
