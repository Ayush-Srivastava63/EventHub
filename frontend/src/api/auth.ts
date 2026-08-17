import api from './client';
import type { ApiResponse, AuthResponse, User } from '../types';

export async function registerUser(name: string, email: string, password: string, role?: string): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password, role });
  return data.data!;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
  return data.data!;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>('/auth/me');
  return data.data!;
}

export async function updateProfile(updates: { name?: string; email?: string }): Promise<User> {
  const { data } = await api.put<ApiResponse<User>>('/users/me', updates);
  return data.data!;
}
