import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../config/index.js';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization Bearer token from localStorage
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('snapcut_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Format standard API responses and errors
apiClient.interceptors.response.use(
  response => {
    // If backend sent { success: true, data: ... }, unwrap data
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response;
  },
  (error: AxiosError<any>) => {
    const errorData = error.response?.data?.error;
    const errorMessage =
      errorData?.message ||
      error.message ||
      'Something went wrong while connecting to SnapCut AI. Please check your connection and try again.';
    const errorCode = errorData?.code || 'NETWORK_ERROR';

    return Promise.reject({
      code: errorCode,
      message: errorMessage,
      details: errorData?.details
    });
  }
);
