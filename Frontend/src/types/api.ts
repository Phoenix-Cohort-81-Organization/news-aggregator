export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
}

export interface ApiErrorResponse {
  success?: false;
  message?: string;
}
