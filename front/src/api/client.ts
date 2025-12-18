import { getStoredToken } from '../context/AuthContext';
import type {
  Property,
  Booking,
  Message,
  Conversation,
  SignInRequest,
  SignInResponse,
  RegisterRequest,
  RegisterResponse,
  CreateBookingRequest,
  UpdateBookingRequest,
  ToggleFavouriteRequest,
  ToggleFavouriteResponse,
  SendMessageRequest,
  PropertiesFilter,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  User,
} from './types';

const API_BASE = 'http://localhost:8080/api';

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options || {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions?.headers as Record<string, string>),
  };

  // Add Authorization header if token exists and not skipping auth
  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
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
        skipAuth: true,
      }),

    register: (data: RegisterRequest) =>
      fetchApi<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        skipAuth: true,
      }),
  },

  properties: {
    getAll: (filter?: PropertiesFilter) => {
      const params = new URLSearchParams();
      if (filter?.location) params.set('location', filter.location);
      if (filter?.type) params.set('type', filter.type);
      const query = params.toString();
      return fetchApi<Property[]>(`/properties${query ? `?${query}` : ''}`, { skipAuth: true });
    },

    getById: (id: number) => fetchApi<Property>(`/properties/${id}`, { skipAuth: true }),

    create: (data: CreatePropertyRequest) =>
      fetchApi<Property>('/properties', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: number, data: UpdatePropertyRequest) =>
      fetchApi<Property>(`/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      fetchApi<{ message: string }>(`/properties/${id}`, {
        method: 'DELETE',
      }),
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

    update: (id: number, data: UpdateBookingRequest) =>
      fetchApi<Booking>(`/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      fetchApi<{ message: string }>(`/bookings/${id}`, {
        method: 'DELETE',
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

  admin: {
    getUsers: () => fetchApi<User[]>('/admin/users'),
  },
};
