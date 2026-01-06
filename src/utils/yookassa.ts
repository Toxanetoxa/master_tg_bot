import { YooKassaWebhookHeaders } from '../types/payments.ts';

export const isYooKassaWebhookAuthorized = (
  headers: YooKassaWebhookHeaders,
  expectedAuthorization: string,
) => {
  if (!expectedAuthorization) return false;
  const authHeader = headers.authorization ?? '';
  return authHeader.trim() === expectedAuthorization.trim();
};
