// ─── User Types ───

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
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
  organizer_name?: string;
  registration_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  category: string;
  capacity: number;
}

export interface UpdateEventData extends Partial<CreateEventData> {}

// ─── Registration Types ───

export interface Registration {
  id: number;
  user_id: number;
  event_id: number;
  registered_at: string;
  status: 'confirmed' | 'cancelled';
  // Joined event fields
  title?: string;
  description?: string;
  location?: string;
  event_date?: string;
  event_time?: string;
  category?: string;
  capacity?: number;
  organizer_name?: string;
  // Joined user fields (for admin view)
  name?: string;
  email?: string;
}

// ─── API Response Types ───

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedEvents {
  events: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Admin Stats ───

export interface AdminStats {
  totalEvents: number;
  totalRegistrations: number;
  upcomingEvents: number;
  totalCapacity: number;
  availableSeats: number;
}
