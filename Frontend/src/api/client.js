import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  // Session is carried by an httpOnly cookie, so credentials must be sent
  withCredentials: true,
  timeout: 20000,
});

// Normalize errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Something went wrong. Please try again.';
    return Promise.reject({ ...err, message });
  }
);
