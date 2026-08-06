export const SMM_API_URL = process.env.SMM_API_URL || "https://dripfeedpanel.com/api/v2";
export const SMM_API_KEY = process.env.SMM_API_KEY || "";

export interface ProviderService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
}

export interface ProviderOrderResponse {
  cancel?: number | { error?: string };
  order?: number;
  refill?: number | { error?: string };
  error?: string;
}

export interface ProviderStatusResponse {
  charge?: string;
  start_count?: string;
  status?: string;
  remains?: string;
  currency?: string;
  error?: string;
}

export interface ProviderBalanceResponse {
  balance?: string;
  currency?: string;
}

export async function smmPost<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(SMM_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      key: SMM_API_KEY,
      ...body,
    } as Record<string, string>).toString(),
  });

  if (!res.ok) {
    throw new Error(`Provider HTTP ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as T & { error?: string };

  if (data.error) {
    throw new Error(`Provider API error: ${data.error}`);
  }

  return data as T;
}

export async function fetchProviderServices(): Promise<ProviderService[]> {
  return smmPost<ProviderService[]>({ action: "services" });
}

export async function placeProviderOrder(params: {
  service: number;
  link: string;
  quantity: number;
  runs?: number;
  interval?: number;
}): Promise<ProviderOrderResponse> {
  return smmPost<ProviderOrderResponse>({
    action: "add",
    service: params.service,
    link: params.link,
    quantity: params.quantity,
    ...(params.runs !== undefined ? { runs: params.runs } : {}),
    ...(params.interval !== undefined ? { interval: params.interval } : {}),
  });
}

export async function getProviderStatus(orderId: number | string): Promise<ProviderStatusResponse> {
  return smmPost<ProviderStatusResponse>({ action: "status", order: String(orderId) });
}

export async function getProviderMultipleStatus(orderIds: (number | string)[]): Promise<Record<string, ProviderStatusResponse>> {
  return smmPost<Record<string, ProviderStatusResponse>>({
    action: "status",
    orders: orderIds.map(String).join(","),
  });
}

export async function createProviderRefill(orderIds: (number | string)[]): Promise<ProviderOrderResponse[]> {
  return smmPost<ProviderOrderResponse[]>({ action: "refill", orders: orderIds.map(String).join(",") });
}

export async function createProviderCancel(orderIds: (number | string)[]): Promise<ProviderOrderResponse[]> {
  return smmPost<ProviderOrderResponse[]>({ action: "cancel", orders: orderIds.map(String).join(",") });
}

export async function getProviderBalance(): Promise<ProviderBalanceResponse> {
  return smmPost<ProviderBalanceResponse>({ action: "balance" });
}
