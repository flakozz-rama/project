export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Property {
  id: number;
  title: string;
  location: string;
  price_per_night: number;
  rating: number;
  reviews: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  amenities: string[];
  image: string;
  owner_id: number;
  created_at: string;
}

export interface Booking {
  id: number;
  user_id: number;
  property_id: number;
  start_date: string;
  end_date: string;
  guests: number;
  status: string;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  text: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: number;
  contact_name: string;
  contact_type: 'host' | 'guest' | 'support';
  property_name: string;
  last_message: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface CreateBookingRequest {
  property_id: number;
  start_date: string;
  end_date: string;
  guests: number;
}

export interface ToggleFavouriteRequest {
  property_id: number;
}

export interface ToggleFavouriteResponse {
  favourite: boolean;
}

export interface SendMessageRequest {
  conversation_id: number;
  text: string;
}

export interface PropertiesFilter {
  location?: string;
  type?: string;
}

export interface UpdateBookingRequest {
  status: string;
}

export interface CreatePropertyRequest {
  title: string;
  location: string;
  price_per_night: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  amenities: string[];
  image: string;
}

export interface UpdatePropertyRequest {
  title?: string;
  location?: string;
  price_per_night?: number;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  type?: string;
  amenities?: string[];
  image?: string;
}
