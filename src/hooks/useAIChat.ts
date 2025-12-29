import { useState, useCallback } from 'react';
import { supabaseConfig } from '@/integrations/supabase/client';

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
};

const getSupabaseUrl = () =>
  import.meta.env.VITE_SUPABASE_URL ?? readStorage(supabaseConfig.storageKeys.url);

const getSupabaseAnonKey = () =>
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  readStorage(supabaseConfig.storageKeys.anonKey);

export function useAIChat() {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `🌸 Welcome! I'm **Sakura**, your AI-powered web app builder.

Tell me what you'd like to build, and I'll generate a complete working application for you. Just describe your idea in plain English!

**I can help you build:**
- React components and full applications
- Interactive UIs with Tailwind CSS
- Forms, dashboards, and data displays
- Any web app you can imagine

What would you like to build today?`,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: AIChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();

      const updateAssistant = (chunk: string) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.id === assistantId) {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [
            ...prev,
            {
              id: assistantId,
              role: 'assistant' as const,
              content: assistantContent,
              timestamp: new Date(),
            },
          ];
        });
      };

      try {
        const supabaseUrl = getSupabaseUrl();
        const anonKey = getSupabaseAnonKey();

        if (!supabaseUrl || !anonKey) {
          updateAssistant(
            '🌸 Your Supabase connection is not configured. Please go to /auth and fill in your Supabase URL + anon key, then reload this page.'
          );
          return;
        }

        const chatUrl = `${supabaseUrl}/functions/v1/sakura-chat`;

        const allMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch(chatUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ messages: allMessages }),
        });

        if (!response.ok) {
          updateAssistant(
            `🌸 I couldn't reach the Sakura chat function (HTTP ${response.status}). Make sure your Supabase project has an edge function named "sakura-chat" deployed.`
          );
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse Anthropic SSE events (line-by-line)
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6).trim();
            if (!data) continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                updateAssistant(parsed.delta.text);
              }
            } catch {
              // ignore partial JSON
            }
          }
        }
      } catch (error) {
        console.error('Chat error:', error);
        updateAssistant(
          '🌸 I ran into an error sending that. If this keeps happening, double-check your Supabase URL and that the "sakura-chat" edge function is deployed.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  return {
    messages,
    isLoading,
    sendMessage,
  };
}

