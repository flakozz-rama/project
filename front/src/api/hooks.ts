import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type {
  PropertiesFilter,
  SignInRequest,
  CreateBookingRequest,
  ToggleFavouriteRequest,
  SendMessageRequest,
} from './types';

export const queryKeys = {
  health: ['health'] as const,
  properties: (filter?: PropertiesFilter) => ['properties', filter] as const,
  property: (id: number) => ['property', id] as const,
  favourites: ['favourites'] as const,
  bookings: ['bookings'] as const,
  conversations: ['conversations'] as const,
  messages: (conversationId: number) => ['messages', conversationId] as const,
};

// Health check
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: api.health,
  });
}

// Properties
export function useProperties(filter?: PropertiesFilter) {
  return useQuery({
    queryKey: queryKeys.properties(filter),
    queryFn: () => api.properties.getAll(filter),
  });
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: queryKeys.property(id),
    queryFn: () => api.properties.getById(id),
    enabled: id > 0,
  });
}

// Auth
export function useSignIn() {
  return useMutation({
    mutationFn: (data: SignInRequest) => api.auth.signIn(data),
  });
}

// Favourites
export function useFavourites() {
  return useQuery({
    queryKey: queryKeys.favourites,
    queryFn: api.favourites.getAll,
  });
}

export function useToggleFavourite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToggleFavouriteRequest) => api.favourites.toggle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favourites });
    },
  });
}

// Bookings
export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings,
    queryFn: api.bookings.getAll,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => api.bookings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

// Conversations
export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: api.conversations.getAll,
  });
}

// Messages
export function useMessages(conversationId: number) {
  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => api.messages.getByConversation(conversationId),
    enabled: conversationId > 0,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => api.messages.send(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages(variables.conversation_id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}
