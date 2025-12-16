import type {
  Property,
  Booking,
  Message,
  Conversation,
  SignInRequest,
  SignInResponse,
  CreateBookingRequest,
  ToggleFavouriteRequest,
  ToggleFavouriteResponse,
  SendMessageRequest,
  PropertiesFilter,
} from './types';

const API_BASE = 'http://localhost:8080/api';

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  health: () => fetchApi<{ status: string }>('/health'),

  auth: {
    signIn: (data: SignInRequest) =>
      fetchApi<SignInResponse>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  properties: {
    getAll: (filter?: PropertiesFilter) => {
      const params = new URLSearchParams();
      if (filter?.location) params.set('location', filter.location);
      if (filter?.type) params.set('type', filter.type);
      const query = params.toString();
      return fetchApi<Property[]>(`/properties${query ? `?${query}` : ''}`);
    },

    getById: (id: number) => fetchApi<Property>(`/properties/${id}`),
  },

  favourites: {
    getAll: () => fetchApi<Property[]>('/favourites'),

    toggle: (data: ToggleFavouriteRequest) =>
      fetchApi<ToggleFavouriteResponse>('/favourites', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  bookings: {
    getAll: () => fetchApi<Booking[]>('/bookings'),

    create: (data: CreateBookingRequest) =>
      fetchApi<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  conversations: {
    getAll: () => fetchApi<Conversation[]>('/conversations'),
  },

  messages: {
    getByConversation: (conversationId: number) =>
      fetchApi<Message[]>(`/messages?conversationId=${conversationId}`),

    send: (data: SendMessageRequest) =>
      fetchApi<Message>('/messages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
