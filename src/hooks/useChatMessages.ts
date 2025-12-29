import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  project_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export function useChatMessages(projectId: string | null) {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ['chat_messages', projectId],
    queryFn: async () => {
      if (!supabase || !projectId) return [];
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!projectId,
  });

  const sendMessage = useMutation({
    mutationFn: async ({ content, role }: { content: string; role: 'user' | 'assistant' }) => {
      if (!supabase || !projectId) throw new Error('Supabase not configured or no project selected');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({ project_id: projectId, user_id: user.id, role, content })
        .select()
        .single();
      if (error) throw error;
      return data as ChatMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_messages', projectId] });
    },
  });

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    sendMessage,
  };
}
