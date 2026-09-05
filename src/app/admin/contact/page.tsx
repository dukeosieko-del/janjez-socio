"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  department: string;
  status: string;
  source: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  reply_text: string | null;
  replied_at: string | null;
  replied_by: string | null;
};

type AdminContactResponse = {
  ok: boolean;
  messages: ContactMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-kenya-green" },
  { value: "read", label: "Read", color: "bg-blue-500" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-500" },
  { value: "resolved", label: "Resolved", color: "bg-kenya-green/80" },
  { value: "spam", label: "Spam", color: "bg-kenya-red" },
];

const DEPARTMENT_OPTIONS = [
  { value: "", label: "All Departments" },
  { value: "general", label: "General Support" },
  { value: "sales", label: "Sales & Customer" },
  { value: "billing", label: "Billing" },
  { value: "affiliate", label: "Affiliate Program" },
  { value: "hr", label: "Human Resources" },
];

export default function AdminContactPage() {
  const { user, profile, loading, session } = useAuth();
  const router = require("next/navigation").useRouter();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router]);

  const getAuthHeaders = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
    return headers;
  };

  const fetchMessages = async () => {
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: "25" });
    if (statusFilter) params.set("status", statusFilter);
    if (departmentFilter) params.set("department", departmentFilter);

    const res = await fetch(`/api/admin/contact?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      setError("Failed to load contact messages");
      return;
    }
    const data: AdminContactResponse = await res.json();
    if (data.ok) {
      setMessages(data.messages);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setUnreadCount(data.messages.filter(m => m.status === "new").length);
    }
  };

  useEffect(() => {
    if (user && profile?.role === "admin") {
      fetchMessages();
    }
  }, [user, profile, page, statusFilter, departmentFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus, updated_at: new Date().toISOString() } : m));
      } else {
        setError("Failed to update status");
      }
    } catch {
      setError("Network error while updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const sendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const res = await fetch("/api/admin/contact/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ id, replyText: replyText.trim() }),
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? {
          ...m,
          reply_text: replyText.trim(),
          replied_at: new Date().toISOString(),
          status: "resolved",
        } : m));
        setReplyOpenId(null);
        setReplyText("");
      } else {
        setError("Failed to send reply");
      }
    } catch {
      setError("Network error while sending reply");
    } finally {
      setReplySubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    if (!option) return <span className="text-xs px-2 py-1 rounded bg-kenya-white/10 text-kenya-white/70">{status}</span>;
    return (
      <span className={`text-xs px-2 py-1 rounded text-kenya-white ${option.color}`}>
        {option.label}
      </span>
    );
  };

  if (loading || !user || profile?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kenya-black">
        <div className="w-12 h-12 border-4 border-kenya-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Contact Messages</h1>
                <p className="text-kenya-white/60">Manage customer inquiries and fulfillment requests</p>
              </div>
              {unreadCount > 0 && (
                <div className="inline-flex items-center gap-2 bg-kenya-green/10 border border-kenya-green/30 text-kenya-green px-4 py-2 rounded-xl text-sm font-medium">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kenya-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-kenya-green"></span>
                  </span>
                  {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4 mb-6">
                <p className="text-kenya-red text-sm">{error}</p>
              </div>
            )}

            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2 text-kenya-white focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                  >
                    <option value="" className="bg-kenya-black">All Statuses</option>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value} className="bg-kenya-black">{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">Department</label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
                    className="bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2 text-kenya-white focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                  >
                    {DEPARTMENT_OPTIONS.map(d => (
                      <option key={d.value} value={d.value} className="bg-kenya-black">{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-kenya-white/10">
                      <th className="text-left px-6 py-4 text-sm font-medium text-kenya-white/50 uppercase tracking-wider">Name</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-kenya-white/50 uppercase tracking-wider">Email</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-kenya-white/50 uppercase tracking-wider">Subject</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-kenya-white/50 uppercase tracking-wider">Department</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-kenya-white/50 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-kenya-white/50 uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-kenya-white/50 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-kenya-white/40">
                          No contact messages found
                        </td>
                      </tr>
                    ) : (
                      messages.map((msg) => (
                        <tr key={msg.id} className="border-b border-kenya-white/5 hover:bg-kenya-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm text-kenya-white font-medium">{msg.name}</td>
                          <td className="px-6 py-4 text-sm text-kenya-white/70">{msg.email}</td>
                          <td className="px-6 py-4 text-sm text-kenya-white/70 max-w-xs truncate">{msg.subject}</td>
                          <td className="px-6 py-4 text-sm text-kenya-white/70 capitalize">{msg.department}</td>
                          <td className="px-6 py-4">{getStatusBadge(msg.status)}</td>
                          <td className="px-6 py-4 text-sm text-kenya-white/50">
                            {new Date(msg.created_at).toLocaleDateString("en-KE", {
                              month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <select
                                value={msg.status}
                                onChange={(e) => updateStatus(msg.id, e.target.value)}
                                disabled={updatingId === msg.id}
                                className="bg-kenya-black border border-kenya-white/20 rounded-lg px-3 py-1.5 text-sm text-kenya-white focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all disabled:opacity-50"
                              >
                                {STATUS_OPTIONS.map(s => (
                                  <option key={s.value} value={s.value} className="bg-kenya-black">{s.label}</option>
                                ))}
                              </select>
                              {!msg.reply_text && (
                                <button
                                  onClick={() => { setReplyOpenId(msg.id); setReplyText(""); }}
                                  className="text-xs bg-kenya-green text-kenya-black font-bold px-3 py-1.5 rounded-lg hover:bg-kenya-green/90 transition-colors"
                                >
                                  Reply
                                </button>
                              )}
                              {msg.reply_text && (
                                <span className="text-xs text-kenya-green">Replied</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-kenya-white/50">
                  Showing {((page - 1) * 25) + 1} to {Math.min(page * 25, total)} of {total} messages
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 bg-kenya-white/10 text-kenya-white rounded-lg hover:bg-kenya-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-kenya-white/70 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 bg-kenya-white/10 text-kenya-white rounded-lg hover:bg-kenya-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {replyOpenId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-kenya-black border border-kenya-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-kenya-white">Reply to Message</h2>
              <button
                onClick={() => { setReplyOpenId(null); setReplyText(""); }}
                className="text-kenya-white/50 hover:text-kenya-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {(() => {
              const msg = messages.find(m => m.id === replyOpenId);
              if (!msg) return null;
              return (
                <div className="mb-4">
                  <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-4 mb-4">
                    <p className="text-sm text-kenya-white/50 mb-1">From: {msg.name} &lt;{msg.email}&gt;</p>
                    <p className="text-sm text-kenya-white/50 mb-2">Subject: {msg.subject}</p>
                    <p className="text-sm text-kenya-white/70 whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">Your Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                    className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all resize-y"
                    placeholder="Type your reply here..."
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => { setReplyOpenId(null); setReplyText(""); }}
                      className="px-4 py-2 bg-kenya-white/10 text-kenya-white rounded-lg hover:bg-kenya-white/20 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => sendReply(msg.id)}
                      disabled={replySubmitting || !replyText.trim()}
                      className="px-4 py-2 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    >
                      {replySubmitting ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
