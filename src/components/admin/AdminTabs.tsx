"use client";

import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/components/AuthContext";

function authHeaders(session: { access_token?: string } | null): Record<string, string> {
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

interface ProfileShape {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  wallet_balance: number | string;
  role: string | null;
  email_verified: boolean | null;
  created_at: string;
}

interface OrderShape {
  id: string;
  user_id: string;
  service_name?: string;
  service_id?: string;
  link?: string;
  quantity?: number;
  amount?: number | string;
  comments?: string | null;
  status?: string;
  payment_status?: string;
  created_at?: string;
  updated_at?: string;
  profiles?: { email?: string; full_name?: string | null } | null;
}

interface LogShape {
  id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  details?: unknown;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
}

interface LedgerShape {
  id: string;
  type: string;
  category: string;
  amount: number | string;
  currency: string;
  user_email?: string;
  user_name?: string;
  description?: string;
  created_at?: string;
}

type TableRow = (string | number | ReactNode)[];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
      <p className="text-kenya-white/70 text-sm">{label}</p>
      <p className="text-3xl font-bold text-kenya-white mt-2">{value}</p>
      {sub && <p className="text-kenya-white/50 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export function OverviewTab() {
  const { session } = useAuth();
  const [stats, setStats] = useState<{
    stats: { totalUsers?: number; totalOrders?: number; pendingOrders?: number };
    recentUsers?: ProfileShape[];
    recentOrders?: OrderShape[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { headers: authHeaders(session) })
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-kenya-white/60 text-sm">Loading overview...</div>;
  }

  if (!stats) {
    return <div className="text-kenya-red text-sm">Failed to load stats.</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Users" value={stats.stats?.totalUsers ?? 0} />
      <StatCard label="Total Orders" value={stats.stats?.totalOrders ?? 0} />
      <StatCard label="Pending Orders" value={stats.stats?.pendingOrders ?? 0} sub="Requires action" />
      <StatCard label="Recent Signups" value={stats.recentUsers?.length ?? 0} sub="Last 10 users" />
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: TableRow[] }) {
  return (
    <div className="overflow-x-auto border border-kenya-white/10 rounded-2xl">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-kenya-white/5 text-kenya-white/70">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-t border-kenya-white/5 text-kenya-white/80">
              {row.map((cell, i) => (
                <td key={i} className="px-4 py-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UsersTab() {
  const { session } = useAuth();
  const [users, setUsers] = useState<ProfileShape[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users?limit=50", { headers: authHeaders(session) })
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-kenya-white/60 text-sm">Loading users...</div>;

  const rows: TableRow[] = (users || []).map((u) => [
    u.email,
    u.full_name || "—",
    u.phone || "—",
    `KES ${Number(u.wallet_balance || 0).toFixed(2)}`,
    u.role || "user",
    u.email_verified ? "Yes" : "No",
    new Date(u.created_at).toLocaleDateString(),
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold text-kenya-white mb-4">Users</h2>
      <DataTable
        headers={["Email", "Name", "Phone", "Wallet", "Role", "Verified", "Joined"]}
        rows={rows}
      />
      {users.length === 0 && <p className="text-kenya-white/50 text-sm mt-4">No users found.</p>}
    </div>
  );
}

export function OrdersTab() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<OrderShape[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders?limit=50", { headers: authHeaders(session) })
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-kenya-white/60 text-sm">Loading orders...</div>;

  const rows: TableRow[] = (orders || []).map((o) => [
    o.id?.slice(0, 8) || "—",
    o.profiles?.email || "—",
    o.service_name || "—",
    `KES ${Number(o.amount || 0).toFixed(2)}`,
    o.status || "—",
    o.created_at ? new Date(o.created_at).toLocaleString() : "—",
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold text-kenya-white mb-4">Orders</h2>
      <DataTable
        headers={["Order ID", "User", "Service", "Amount", "Status", "Created"]}
        rows={rows}
      />
      {orders.length === 0 && <p className="text-kenya-white/50 text-sm mt-4">No orders found.</p>}
    </div>
  );
}

export function LogsTab() {
  const { session } = useAuth();
  const [logs, setLogs] = useState<LogShape[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/logs?limit=100", { headers: authHeaders(session) })
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-kenya-white/60 text-sm">Loading logs...</div>;

  const rows: TableRow[] = (logs || []).map((l) => [
    l.id?.slice(0, 8) || "—",
    l.actor_email || "system",
    l.action,
    l.target_type || "—",
    l.target_id || "—",
    l.created_at ? new Date(l.created_at).toLocaleString() : "—",
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold text-kenya-white mb-4">Activity Logs</h2>
      <DataTable
        headers={["ID", "Actor", "Action", "Target Type", "Target ID", "Timestamp"]}
        rows={rows}
      />
      {logs.length === 0 && <p className="text-kenya-white/50 text-sm mt-4">No logs found.</p>}
    </div>
  );
}

export function LedgerTab() {
  const { session } = useAuth();
  const [ledger, setLedger] = useState<LedgerShape[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ledger?limit=100", { headers: authHeaders(session) })
      .then((r) => r.json())
      .then((data) => {
        setLedger(data.ledger || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-kenya-white/60 text-sm">Loading ledger...</div>;

  const rows: TableRow[] = (ledger || []).map((l) => [
    l.id?.slice(0, 8) || "—",
    l.type,
    l.category,
    l.currency === "KES" ? `KES ${Number(l.amount || 0).toFixed(2)}` : "—",
    l.user_email || "—",
    l.description,
    l.created_at ? new Date(l.created_at).toLocaleString() : "—",
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold text-kenya-white mb-4">Ledger</h2>
      <DataTable
        headers={["ID", "Type", "Category", "Amount", "User", "Description", "Timestamp"]}
        rows={rows}
      />
      {ledger.length === 0 && <p className="text-kenya-white/50 text-sm mt-4">No ledger entries found.</p>}
    </div>
  );
}
