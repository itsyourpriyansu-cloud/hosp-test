import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careChatService } from '../services/careChatService';
import { CreateConversationPayload, Attachment } from '../types/careChat';

export const careChatKeys = {
  all: ['careChat'] as const,
  departments: () => [...careChatKeys.all, 'departments'] as const,
  conversations: () => [...careChatKeys.all, 'conversations'] as const,
  unreadCount: () => [...careChatKeys.all, 'unreadCount'] as const,
  conversation: (id: string) => [...careChatKeys.all, 'conversation', id] as const,
  messages: (id: string) => [...careChatKeys.all, 'messages', id] as const,
};

export function useCareChatDepartments() {
  return useQuery({
    queryKey: careChatKeys.departments(),
    queryFn: () => careChatService.getDepartments(),
  });
}

export function useCareChatConversations() {
  return useQuery({
    queryKey: careChatKeys.conversations(),
    queryFn: () => careChatService.getConversations(),
    refetchInterval: 10000, // Safe controlled polling when socket is idle
  });
}

export function useCareChatUnreadCount() {
  return useQuery({
    queryKey: careChatKeys.unreadCount(),
    queryFn: () => careChatService.getUnreadCount(),
    refetchInterval: 8000,
  });
}

export function useCareChatConversation(id: string | undefined) {
  return useQuery({
    queryKey: careChatKeys.conversation(id || ''),
    queryFn: () => (id ? careChatService.getConversation(id) : null),
    enabled: Boolean(id),
  });
}

export function useCareChatMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: careChatKeys.messages(conversationId || ''),
    queryFn: () => (conversationId ? careChatService.getMessages(conversationId) : []),
    enabled: Boolean(conversationId),
    refetchInterval: 3000, // Controlled polling for active conversation view
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateConversationPayload) =>
      careChatService.createConversation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careChatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: careChatKeys.unreadCount() });
    },
  });
}

export function useSendMessageMutation(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      body,
      attachments,
      senderName,
    }: {
      body: string;
      attachments?: Attachment[];
      senderName?: string;
    }) => careChatService.sendMessage(conversationId, body, attachments, senderName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careChatKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: careChatKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: careChatKeys.conversations() });
    },
  });
}

export function useResolveConversationMutation(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rating, note }: { rating?: number; note?: string }) =>
      careChatService.resolveConversation(conversationId, rating, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careChatKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: careChatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: careChatKeys.messages(conversationId) });
    },
  });
}

export function useReopenConversationMutation(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      careChatService.reopenConversation(conversationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careChatKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: careChatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: careChatKeys.messages(conversationId) });
    },
  });
}
