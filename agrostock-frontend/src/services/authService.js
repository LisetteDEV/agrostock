import { API_URL } from './config';
async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || 'Une erreur est survenue.';
    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

export async function login(credentials) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  return parseResponse(response);
}

export async function register(payload) {
  const isFormData = payload instanceof FormData;

  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: isFormData
      ? { Accept: 'application/json' }
      : {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
    body: isFormData ? payload : JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function logout(token) {
  const response = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  return parseResponse(response);
}
