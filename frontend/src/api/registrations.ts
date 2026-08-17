import api from './client';
import type { ApiResponse, Registration } from '../types';

export async function registerForEvent(eventId: number): Promise<Registration> {
  const { data } = await api.post<ApiResponse<Registration>>(`/events/${eventId}/register`);
  return data.data!;
}

export async function cancelRegistration(eventId: number): Promise<Registration> {
  const { data } = await api.delete<ApiResponse<Registration>>(`/events/${eventId}/register`);
  return data.data!;
}

export async function getUserRegistrations(): Promise<Registration[]> {
  const { data } = await api.get<ApiResponse<Registration[]>>('/users/me/registrations');
  return data.data!;
}

export async function getEventRegistrations(eventId: number): Promise<Registration[]> {
  const { data } = await api.get<ApiResponse<Registration[]>>(`/events/${eventId}/registrations`);
  return data.data!;
}

export async function checkRegistration(eventId: number): Promise<boolean> {
  const { data } = await api.get<ApiResponse<{ isRegistered: boolean }>>(`/events/${eventId}/check-registration`);
  return data.data!.isRegistered;
}
