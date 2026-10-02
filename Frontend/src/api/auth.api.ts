import type { ApiSuccess } from '../types/api';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';
import api from './axios';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<ApiSuccess<AuthResponse>>('/auth/login', credentials);
  return response.data.data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await api.post<ApiSuccess<AuthResponse>>('/auth/register', credentials);
  return response.data.data;
};
