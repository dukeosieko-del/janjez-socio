import type { JanjezService } from "@/lib/janjez-services";

export interface BusinessService extends JanjezService {
  price: number;
}

export interface BusinessOrderInput {
  janjezServiceId?: string | null;
  serviceId?: string | null;
  skuId?: string | null;
  catalogCategoryId?: string | null;
  quantity: number;
  link: string;
  runs?: number | null;
  interval?: number | null;
}

export interface BusinessOrder {
  id: string;
  order_id: string | null;
  status: string;
  fulfillment_status: string | null;
  provider_status: string | null;
  provider_order_id: string | null;
  quantity: number;
  amount: number | null;
  link: string | null;
  link_submitted: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BusinessApiResponse<T> {
  success: true;
  data: T;
  error: null;
  request_id: string;
  timestamp: string;
}

export interface BusinessApiFailure {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
  };
  request_id: string;
  timestamp: string;
}
