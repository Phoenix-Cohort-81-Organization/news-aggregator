import axios, { type AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api';

export class ApiError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
let authToken: string | null = null;

export const setApiAuthToken = (token: string | null) => {
  authToken = token;
};

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  if (!apiBaseUrl) {
    throw new ApiError(
      'VITE_API_BASE_URL is not configured. Copy .env.example to .env and set the backend URL.',
    );
  }

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      return Promise.reject(
        new ApiError(
          error.response.data?.message || 'The request could not be completed.',
          error.response.status,
        ),
      );
    }

    if (error.request) {
      return Promise.reject(
        new ApiError('Unable to reach the news service. Check your connection and try again.'),
      );
    }

    return Promise.reject(new ApiError(error.message || 'The request could not be completed.'));
  },
);

export default api;
