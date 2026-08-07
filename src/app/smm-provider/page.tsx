import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface FulfillmentLog {
  id: string;
  order_id: string;
  action: string;
  status: string;
  error?: string;
  created_at: string;
}

interface FulfillmentLogsResponse {
  logs: FulfillmentLog[];
  total: number;
}

export const dynamic = "force-dynamic";

async function getProviderBalance() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/smm/balance`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRecentLogs() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/admin/fulfillment-logs?limit=20`, { cache: "no-store" });
  if (!res.ok) return { logs: [], total: 0 };
  return res.json() as Promise<FulfillmentLogsResponse>;
}

export default async function SMMProviderPage() {
  const [balance, logs] = await Promise.all([getProviderBalance(), getRecentLogs()]);

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
              <span className="text-kenya-green font-medium">SMM Provider</span>
            </nav>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">SMM Provider</h1>
                <p className="text-kenya-white/60 text-lg">Auto-fulfillment, catalog sync, and provider status.</p>
              </div>
              <div className="flex gap-3">
                <form action="/api/smm/catalog" method="POST" className="inline">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-5 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors"
                  >
                    Sync Catalog
                  </button>
                </form>
                <form action="/api/cron/smm-sync" method="POST" className="inline">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-kenya-white/10 text-kenya-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-kenya-white/20 transition-colors"
                  >
                    Sync Statuses
                  </button>
                </form>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <p className="text-kenya-white/60 text-sm mb-2">Provider Balance</p>
                <p className="text-2xl font-bold text-kenya-white">
                  {balance?.balance ? `${balance.currency} ${balance.balance}` : "Unavailable"}
                </p>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <p className="text-kenya-white/60 text-sm mb-2">Provider API</p>
                <p className="text-2xl font-bold text-kenya-white">dripfeedpanel.com</p>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <p className="text-kenya-white/60 text-sm mb-2">Auto-fulfillment</p>
                <p className="text-2xl font-bold text-kenya-green">Enabled</p>
              </div>
            </div>

            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-kenya-white/10">
                <h2 className="text-lg font-bold text-kenya-white">Recent Fulfillment Logs</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-kenya-white/5 text-kenya-white/60">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Error</th>
                      <th className="px-4 py-3 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kenya-white/10">
                    {(logs.logs || []).map((log: FulfillmentLog) => (
                      <tr key={log.id} className="hover:bg-kenya-white/5 transition-colors">
                        <td className="px-4 py-3 text-kenya-white">{log.order_id?.slice(0, 8) || "—"}</td>
                        <td className="px-4 py-3 text-kenya-white/80">{log.action}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                              log.status === "fulfilled" || log.status === "processing" || log.status === "synced"
                                ? "bg-kenya-green/10 text-kenya-green border border-kenya-green/20"
                                : "bg-kenya-red/10 text-kenya-red border border-kenya-red/20"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-kenya-red/80">{log.error || "—"}</td>
                        <td className="px-4 py-3 text-kenya-white/60 whitespace-nowrap">
                          {log.created_at ? new Date(log.created_at).toISOString().slice(0, 19).replace("T", " ") : "—"}
                        </td>
                      </tr>
                    ))}
                    {(!logs.logs || logs.logs.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-kenya-white/60">
                          No logs yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
