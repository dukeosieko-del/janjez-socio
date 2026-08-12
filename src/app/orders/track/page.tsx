import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

interface OrderStatus {
  order_id: string;
  service_name: string;
  quantity: number;
  amount: number;
  amount_paid: number;
  payment_status: string;
  status: string;
  fulfillment_status: string;
  fulfilled_at: string | null;
  provider_order_id: string | null;
  provider_response: Record<string, unknown> | null;
  runs: number | null;
  interval: number | null;
  phone_number: string | null;
  created_at: string;
}

async function getOrderStatus(checkoutRequestId: string): Promise<OrderStatus | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data: tx, error: txError } = await supabase
    .from("wallet_transactions")
    .select("related_order_id, status")
    .eq("reference", checkoutRequestId)
    .single();

  if (txError || !tx?.related_order_id) return null;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "order_id, service_name, quantity, amount, amount_paid, payment_status, status, fulfillment_status, fulfilled_at, provider_order_id, provider_response, runs, interval, phone_number, created_at"
    )
    .eq("id", tx.related_order_id)
    .single();

  if (orderError || !order) return null;
  return order as OrderStatus;
}

export default async function AnonymousTrackingPage({ searchParams }: { searchParams: { ref?: string } }) {
  const ref = searchParams.ref;
  if (!ref) {
    return (
      <div className="min-h-screen bg-kenya-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-kenya-white/70 mb-4">No tracking reference provided.</p>
          <Link href="/services" className="text-kenya-green hover:text-kenya-green/80">Go to Services</Link>
        </div>
      </div>
    );
  }

  const order = await getOrderStatus(ref);

  if (!order) {
    return (
      <div className="min-h-screen bg-kenya-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-kenya-white/70 mb-4">Order not found or still processing.</p>
          <Link href="/services" className="text-kenya-green hover:text-kenya-green/80">Back to Services</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kenya-black text-kenya-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Anonymous Order Status</h1>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-kenya-white/5 border border-kenya-white/10 rounded-xl">
            <span className="text-kenya-white/70">Order ID</span>
            <span className="font-mono">{order.order_id}</span>
          </div>

          <div className="flex justify-between items-center p-4 bg-kenya-white/5 border border-kenya-white/10 rounded-xl">
            <span className="text-kenya-white/70">Service</span>
            <span>{order.service_name}</span>
          </div>

          <div className="flex justify-between items-center p-4 bg-kenya-white/5 border border-kenya-white/10 rounded-xl">
            <span className="text-kenya-white/70">Quantity</span>
            <span>{order.quantity.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center p-4 bg-kenya-white/5 border border-kenya-white/10 rounded-xl">
            <span className="text-kenya-white/70">Amount</span>
            <span>KES {order.amount?.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center p-4 bg-kenya-white/5 border border-kenya-white/10 rounded-xl">
            <span className="text-kenya-white/70">Payment Status</span>
            <span className={order.payment_status === "paid" ? "text-kenya-green" : "text-kenya-white/50"}>
              {order.payment_status === "paid" ? "Paid" : "Pending Payment"}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-kenya-white/5 border border-kenya-white/10 rounded-xl">
            <span className="text-kenya-white/70">Order Status</span>
            <span className={order.status === "completed" ? "text-kenya-green" : "text-kenya-white/50"}>
              {order.status}
            </span>
          </div>

          {order.runs && order.interval && (
            <div className="flex justify-between items-center p-4 bg-kenya-white/5 border border-kenya-white/10 rounded-xl">
              <span className="text-kenya-white/70">Drip-feed</span>
              <span>{order.runs} runs every {order.interval} minutes</span>
            </div>
          )}

          {order.provider_order_id && (
            <div className="flex justify-between items-center p-4 bg-kenya-white/5 border border-kenya-white/10 rounded-xl">
              <span className="text-kenya-white/70">Provider Order ID</span>
              <span className="font-mono text-sm">{order.provider_order_id}</span>
            </div>
          )}

          <div className="pt-4">
            <Link
              href="/services"
              className="text-kenya-green hover:text-kenya-green/80 transition-colors"
            >
              ← Back to Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
