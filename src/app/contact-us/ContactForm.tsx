"use client";

import { useState } from "react";
import { EMAIL_DEPARTMENTS, SUPPORT_ADDRESS } from "@/lib/email/config";
import { fetchJSON } from "@/lib/client/fetchWithTimeout";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    department: SUPPORT_ADDRESS,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fallbackEmail, setFallbackEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    setFallbackEmail(null);

    try {
      const result = await fetchJSON<{ mailSent?: boolean; departmentEmail?: string; error?: string }>(
        "/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!result.mailSent && result.departmentEmail) {
        setFallbackEmail(result.departmentEmail);
      }

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "", department: form.department });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Something went wrong";
      const friendly =
        raw.match(/"error":"([^"]+)"/)?.[1] ||
        "We're having trouble sending your message right now. Please try again in a few minutes.";
      setError(friendly);
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 space-y-5"
    >
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
              : "Message sent successfully. We'll get back to you within a few minutes to one hour."}
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
  );
}
