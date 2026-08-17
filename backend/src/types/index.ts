// ─── User Types ───

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export type UserPublic = Omit<User, 'password_hash'>;

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
}

// ─── Event Types ───

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  category: string;
  capacity: number;
  organizer_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  category: string;
  capacity: number;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  location?: string;
  event_date?: string;
  event_time?: string;
  category?: string;
  capacity?: number;
}

// ─── Registration Types ───

export interface Registration {
  id: number;
  user_id: number;
  event_id: number;
  registered_at: Date;
  status: 'confirmed' | 'cancelled';
}

// ─── API Response Types ───

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

// ─── JWT Payload ───

export interface JwtPayload {
  userId: number;
  role: 'user' | 'admin';
}

// ─── Query Params ───

export interface EventQueryParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: 'date_asc' | 'date_desc' | 'title_asc' | 'title_desc';
}
