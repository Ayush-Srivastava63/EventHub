import api from './client';
import type { ApiResponse, Event, PaginatedEvents, CreateEventData, UpdateEventData, AdminStats } from '../types';

export async function getEvents(params?: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<PaginatedEvents> {
  const { data } = await api.get<ApiResponse<PaginatedEvents>>('/events', { params });
  return data.data!;
}

export async function getEventById(id: number): Promise<Event> {
  const { data } = await api.get<ApiResponse<Event>>(`/events/${id}`);
  return data.data!;
}

export async function createEvent(eventData: CreateEventData): Promise<Event> {
  const { data } = await api.post<ApiResponse<Event>>('/events', eventData);
  return data.data!;
}

export async function updateEvent(id: number, eventData: UpdateEventData): Promise<Event> {
  const { data } = await api.put<ApiResponse<Event>>(`/events/${id}`, eventData);
  return data.data!;
}

export async function deleteEvent(id: number): Promise<void> {
  await api.delete(`/events/${id}`);
}

export async function getCategories(): Promise<string[]> {
  const { data } = await api.get<ApiResponse<string[]>>('/events/categories');
  return data.data!;
}

export async function getAdminEvents(): Promise<Event[]> {
  const { data } = await api.get<ApiResponse<Event[]>>('/admin/events');
  return data.data!;
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<ApiResponse<AdminStats>>('/admin/stats');
  return data.data!;
}
