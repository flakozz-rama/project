import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type {
  PropertiesFilter,
  SignInRequest,
  RegisterRequest,
  CreateBookingRequest,
  UpdateBookingRequest,
  ToggleFavouriteRequest,
  SendMessageRequest,
  CreatePropertyRequest,
  UpdatePropertyRequest,
} from './types';

export const queryKeys = {
  health: ['health'] as const,
  properties: (filter?: PropertiesFilter) => ['properties', filter] as const,
  property: (id: number) => ['property', id] as const,
  favourites: ['favourites'] as const,
  bookings: ['bookings'] as const,
  conversations: ['conversations'] as const,
  messages: (conversationId: number) => ['messages', conversationId] as const,
  adminUsers: ['admin', 'users'] as const,
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

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => api.auth.register(data),
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

// Property mutations
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyRequest) => api.properties.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePropertyRequest }) =>
      api.properties.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.property(variables.id) });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.properties.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

// Booking mutations
export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBookingRequest }) =>
      api.bookings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.bookings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

// Admin
export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: api.admin.getUsers,
  });
}
