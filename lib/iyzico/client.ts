/**
 * iyzico API Client
 *
 * Environment variables:
 *   IYZICO_API_KEY
 *   IYZICO_SECRET_KEY
 *   IYZICO_BASE_URL (sandbox: https://sandbox-api.iyzipay.com, prod: https://api.iyzipay.com)
 */

interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

function getConfig(): IyzicoConfig {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error('IYZICO_API_KEY ve IYZICO_SECRET_KEY environment variable gerekli');
  }

  return { apiKey, secretKey, baseUrl };
}

function generateAuthorizationHeader(config: IyzicoConfig, uri: string, body?: string): string {
  const crypto = require('crypto');
  const randomStr = crypto.randomBytes(8).toString('hex');
  const hashStr = `${config.apiKey}${randomStr}${config.secretKey}${body || ''}`;
  const hash = crypto.createHash('sha1').update(hashStr).digest('base64');
  const authStr = `apiKey:${config.apiKey}&randomHeaderValue:${randomStr}&signature:${hash}`;
  return `IYZWS ${Buffer.from(authStr).toString('base64')}`;
}

export async function iyzicoRequest<T = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const config = getConfig();
  const url = `${config.baseUrl}${path}`;
  const bodyStr = body ? JSON.stringify(body) : undefined;
  const authorization = generateAuthorizationHeader(config, path, bodyStr);

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'x-iyzi-rnd': Date.now().toString(),
    },
    body: bodyStr,
  });

  const data = await res.json();

  if (data.status === 'failure') {
    throw new Error(data.errorMessage || `iyzico hatası: ${data.errorCode}`);
  }

  return data as T;
}

export interface IyzicoCheckoutForm {
  token: string;
  checkoutFormContent: string;
  tokenExpireTime: number;
  paymentPageUrl: string;
}

export interface IyzicoBuyer {
  id: string;
  name: string;
  surname: string;
  email: string;
  identityNumber?: string;
  gsmNumber?: string;
  registrationAddress?: string;
  city?: string;
  country?: string;
  ip: string;
}

export interface CreateCheckoutParams {
  price: string;
  paidPrice: string;
  currency: string;
  basketId: string;
  paymentGroup: string;
  callbackUrl: string;
  buyer: IyzicoBuyer;
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: string;
  }>;
}

export async function createCheckoutForm(params: CreateCheckoutParams): Promise<IyzicoCheckoutForm> {
  return iyzicoRequest<IyzicoCheckoutForm>('POST', '/payment/iyzipos/checkoutform/initialize/auth/ecom', {
    locale: 'tr',
    conversationId: params.basketId,
    price: params.price,
    paidPrice: params.paidPrice,
    currency: params.currency || 'TRY',
    basketId: params.basketId,
    paymentGroup: params.paymentGroup || 'SUBSCRIPTION',
    callbackUrl: params.callbackUrl,
    enabledInstallments: [1],
    buyer: params.buyer,
    shippingAddress: params.billingAddress,
    billingAddress: params.billingAddress,
    basketItems: params.basketItems,
  });
}

export async function retrieveCheckoutResult(token: string) {
  return iyzicoRequest('POST', '/payment/iyzipos/checkoutform/auth/ecom/detail', {
    locale: 'tr',
    token,
  });
}
