"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

interface Order {
  service_name?: string;
  service_id?: string;
  payment_reference?: string;
  amount_paid?: number;

  id: string;
  order_id?: string;
  category?: string;
  subcategory?: string;
  sku_id?: string;
  link_submitted?: string;
  quantity?: number;
  amount?: number;
  status?: string;
  payment_status?: string;
  fulfillment_status?: string;
  provider_status?: string;
  provider_order_id?: string;
  fulfillment_error?: string;
  fulfilled_at?: string;
  refill_guarantee?: string | null;
  quantity_source?: string;
  created_at?: string;
  updated_at?: string;
}

export default function MyOrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadOrders() {
      setFetching(true);
      setError(null);

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const client = createClient();
        if (!client) {
          throw new Error("Supabase client not configured");
        }

        const { data: sessionData } = await client.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
          throw new Error("No session token");
        }

        const res = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Failed to load orders");
        }

        const data = await res.json();
        const list = Array.isArray(data?.orders) ? data.orders : [];
        if (!cancelled) {
          setOrders(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-kenya-black">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <AnnouncementBanner />
          <LiveTicker />
          <Header />
          <main className="flex-1">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <p className="text-kenya-white/70 text-sm">Loading orders…</p>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex bg-kenya-black">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <AnnouncementBanner />
          <LiveTicker />
          <Header />
          <main className="flex-1">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
                <Link href="/" className="hover:text-kenya-green transition-colors">Home</Link>
                <span>/</span>
                <span className="text-kenya-green font-medium">My Orders</span>
              </nav>
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">My Orders</h1>
              <p className="text-kenya-white/60 text-lg mb-8">View and track your order history.</p>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-8 text-center">
                <p className="text-kenya-white/70 text-sm mb-4">Sign in to view your orders.</p>
                <Link href="/order" className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors">🛒 Start Order</Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
              <Link href="/" className="hover:text-kenya-green transition-colors">Home</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">My Orders</span>
            </nav>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">My Orders</h1>
                <p className="text-kenya-white/60 text-lg">Track your orders, links, and delivery status.</p>
              </div>
              <Link href="/order" className="hidden sm:inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-5 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors">
                🛒 New Order
              </Link>
            </div>

            {error && (
              <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4 mb-6">
                <p className="text-kenya-red text-sm">{error}</p>
              </div>
            )}

            {fetching && (
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-8 text-center">
                <p className="text-kenya-white/70 text-sm">Loading your orders…</p>
              </div>
            )}

            {!fetching && orders.length === 0 && !error && (
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-8 text-center">
                <p className="text-kenya-white/70 text-sm mb-4">No orders yet.</p>
                <Link href="/order" className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors">🛒 Place your first order</Link>
              </div>
            )}

            {!fetching && orders.length > 0 && (
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-kenya-white/5 text-kenya-white/60">
                      <tr>
                        <th className="px-4 py-3 font-medium">Order</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Service</th>
                        <th className="px-4 py-3 font-medium">Link</th>
                        <th className="px-4 py-3 font-medium">SKU</th>
                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                        <th className="px-4 py-3 font-medium text-center">Status</th>
                        <th className="px-4 py-3 font-medium text-center">Payment</th>
                        <th className="px-4 py-3 font-medium text-center">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-kenya-white/10">
                      {orders.map((order) => {
                        const status = order.status || "pending";
                        const paymentStatus = order.payment_status || "unpaid";
                        const created = order.created_at ? new Date(order.created_at).toISOString().slice(0, 19).replace("T", " ") : "—";

                        const statusStyles: Record<string, string> = {
                          pending: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20",
                          processing: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
                          completed: "bg-kenya-green/10 text-kenya-green border border-kenya-green/20",
                          cancelled: "bg-kenya-red/10 text-kenya-red border border-kenya-red/20",
                          failed: "bg-kenya-red/10 text-kenya-red border border-kenya-red/20",
                        };

                        const fulfillmentStatus = order.fulfillment_status || "pending";

                        const fulfillmentStyles: Record<string, string> = {
                          pending: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20",
                          processing: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
                          fulfilled: "bg-kenya-green/10 text-kenya-green border border-kenya-green/20",
                          cancelled: "bg-kenya-red/10 text-kenya-red border border-kenya-red/20",
                          failed: "bg-kenya-red/10 text-kenya-red border border-kenya-red/20",
                          refunded: "bg-kenya-white/10 text-kenya-white/70 border border-kenya-white/20",
                        };

                        const paymentStyles: Record<string, string> = {
                          paid: "bg-kenya-green/10 text-kenya-green border border-kenya-green/20",
                          unpaid: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20",
                          refunded: "bg-kenya-white/10 text-kenya-white/70 border border-kenya-white/20",
                        };

                        return (
                          <tr key={order.id} className="hover:bg-kenya-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-kenya-white">{order.order_id || order.id.slice(0, 8)}</div>
                              <div className="text-kenya-white/50 text-xs">{order.category || "—"} / {order.subcategory || "—"}</div>
                            </td>
                            <td className="px-4 py-3 text-kenya-white/70 whitespace-nowrap">{created}</td>
                            <td className="px-4 py-3 text-kenya-white/80">{order.service_name || order.sku_id || "—"}</td>
                            <td className="px-4 py-3">
                              {order.link_submitted ? (
                                <a href={order.link_submitted} target="_blank" rel="noreferrer" className="text-kenya-green hover:underline break-all">
                                  {order.link_submitted}
                                </a>
                              ) : (
                                <span className="text-kenya-white/40">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-kenya-white/70">{order.sku_id || "—"}</td>
                            <td className="px-4 py-3 text-right text-kenya-white font-medium">
                              KES {typeof order.amount === "number" ? order.amount.toFixed(2) : "0.00"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${paymentStyles[paymentStatus] || paymentStyles.unpaid}`}>
                                {paymentStatus}
                            </span>
                             </td>
                             <td className="px-4 py-3 text-center">
                               <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${fulfillmentStyles[fulfillmentStatus] || fulfillmentStyles.pending}`}>
                                 {fulfillmentStatus}
                               </span>
                               {order.provider_order_id && (
                                 <div className="text-kenya-white/40 text-xs mt-1 font-mono">{order.provider_order_id.slice(0, 8)}</div>
                               )}
                             </td>
                           </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
