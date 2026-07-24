"use client";

import { useState } from "react";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { EMAIL_DEPARTMENTS, SUPPORT_ADDRESS, SUPPORT_PHONE, SUPPORT_WHATSAPP } from "@/lib/email/config";

export default function ContactUsPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", department: SUPPORT_ADDRESS });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fallbackEmail, setFallbackEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    setFallbackEmail(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      const result = await res.json().catch(() => ({ ok: true, mailSent: true }));

      if (!result.mailSent && result.departmentEmail) {
        setFallbackEmail(result.departmentEmail);
      }

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "", department: form.department });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

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
              <span className="text-kenya-green font-medium">Contact Us</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">Contact Us</h1>
            <p className="text-kenya-white/60 text-lg mb-8">Have a question or need help? We&apos;re here for you.</p>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-kenya-white/70 mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-kenya-white/70 mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">Department</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                    >
                      {EMAIL_DEPARTMENTS.map((dept) => (
                        <option key={dept.address} value={dept.address}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all resize-y"
                      placeholder="Tell us more..."
                    />
                  </div>

                  {status === "success" && (
                    <div className="bg-kenya-green/10 border border-kenya-green/30 rounded-xl p-4">
                      <p className="text-kenya-green text-sm">
                        {fallbackEmail
                          ? `Message received. Since automated email delivery is not configured yet, please also send this directly to ${fallbackEmail}.`
                          : "Message sent successfully. We'll get back to you within 24 hours."}
                      </p>
                    </div>
                  )}

                  {status === "error" && (
                    <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4">
                      <p className="text-kenya-red text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-kenya-green text-kenya-black font-bold text-lg py-4 rounded-xl hover:bg-kenya-green/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                  <h3 className="text-kenya-white font-semibold mb-4">Department Emails</h3>
                  <ul className="space-y-3 text-sm">
                    {EMAIL_DEPARTMENTS.map((dept) => (
                      <li key={dept.address} className="flex flex-col">
                        <span className="text-kenya-white/80 font-medium">{dept.label}</span>
                        <a href={`mailto:${dept.address}`} className="text-kenya-green hover:underline">{dept.address}</a>
                        <span className="text-kenya-white/50 text-xs">{dept.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                  <h3 className="text-kenya-white font-semibold mb-3">Direct Channels</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-kenya-white/70 block mb-1">WhatsApp</span>
                      <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-kenya-green hover:underline">Chat with us</a>
                    </div>
                    <div>
                      <span className="text-kenya-white/70 block mb-1">Phone</span>
                      <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`} className="text-kenya-green font-mono hover:underline">{SUPPORT_PHONE}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
