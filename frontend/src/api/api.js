import { getToken } from "../auth/token";
import { Platform } from 'react-native';

const PLATFORM_DEFAULT = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
const API_URL = (process.env.REACT_APP_API_URL || PLATFORM_DEFAULT || 'http://YOUR_IP:4000').replace(/\/$/, '');

export const apiFetch = async (endpoint, options = {}) => {
  const token = await getToken();

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
};
