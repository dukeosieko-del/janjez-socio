import { mpesaConfig } from './config';

interface AuthTokenResponse {
  access_token: string;
  expires_in: string;
}

let cachedToken: { token: string; expiry: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiry > Date.now()) {
    return cachedToken.token;
  }

  const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
  
  const response = await fetch(`${mpesaConfig.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error(`M-Pesa auth failed: ${response.status}`);
  }

  const data: AuthTokenResponse = await response.json();
  cachedToken = {
    token: data.access_token,
    expiry: Date.now() + (parseInt(data.expires_in) - 60) * 1000,
  };
  
  return cachedToken.token;
}

function generatePassword(): string {
  const timestamp = getTimestamp();
  const password = Buffer.from(`${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`).toString('base64');
  return { password, timestamp } as any;
}

function getTimestamp(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export async function initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = Buffer.from(`${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`).toString('base64');

  const response = await fetch(`${mpesaConfig.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: mpesaConfig.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: request.amount,
      PartyA: request.phoneNumber,
      PartyB: mpesaConfig.shortcode,
      PhoneNumber: request.phoneNumber,
      CallBackURL: mpesaConfig.callbackUrl,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`STK push failed: ${error}`);
  }

  return response.json();
}

export interface B2CRequest {
  phoneNumber: string;
  amount: number;
  remarks: string;
  occasion?: string;
}

export interface B2CResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export async function initiateB2CPayment(request: B2CRequest): Promise<B2CResponse> {
  const token = await getAccessToken();

  const response = await fetch(`${mpesaConfig.baseUrl}/mpesa/b2c/v1/paymentrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      InitiatorName: process.env.MPESA_INITIATOR_NAME || 'testapi',
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL || '',
      CommandID: 'BusinessPayment',
      Amount: request.amount,
      PartyA: mpesaConfig.shortcode,
      PartyB: request.phoneNumber,
      Remarks: request.remarks,
      QueueTimeOutURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/partner/mpesa/b2c/timeout`,
      ResultURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/partner/mpesa/b2c/result`,
      Occasion: request.occasion || 'Payout',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`B2C payment failed: ${error}`);
  }

  return response.json();
}

export async function querySTKPushStatus(checkoutRequestId: string) {
  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = Buffer.from(`${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`).toString('base64');

  const response = await fetch(`${mpesaConfig.baseUrl}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: mpesaConfig.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  if (!response.ok) {
    throw new Error(`STK query failed: ${response.status}`);
  }

  return response.json();
}
