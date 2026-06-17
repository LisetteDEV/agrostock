import { API_URL } from './config';
async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const firstValidationError = data?.errors
      ? Object.values(data.errors).flat()[0]
      : null;
    const message = firstValidationError || data?.message || 'Impossible de traiter le paiement.';
    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

export async function processPayment(payload, token) {
  const response = await fetch(`${API_URL}/paiements/simuler`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

