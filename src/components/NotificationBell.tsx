"use client";

import { useState } from "react";
import { NOTIFICATIONS } from "@/lib/data";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = 3;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-lg hover:bg-kenya-white/10 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="h-6 w-6 text-kenya-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-kenya-red text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-kenya-black border border-kenya-white/10 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-kenya-white/10">
              <h2 className="text-xl font-bold text-kenya-white">Notifications</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-kenya-white/50 hover:text-kenya-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {NOTIFICATIONS.map((notif) => (
                <a
                  key={notif.id}
                  href="https://janjez-sociol.vercel.app/updates-and-announcements"
                  className="block p-4 hover:bg-kenya-white/5 transition-colors border-b border-kenya-white/5 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                        notif.type === "promo"
                          ? "bg-kenya-red"
                          : notif.type === "success"
                          ? "bg-kenya-green"
                          : "bg-yellow-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-kenya-white text-sm">
                          {notif.title}
                        </h3>
                        <span className="text-xs text-kenya-white/40 flex-shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-sm text-kenya-white/60 mt-1">{notif.message}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div className="p-4 border-t border-kenya-white/10">
              <a
                href="https://janjez.social/updates-and-announcements"
                className="block w-full text-center py-2.5 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 transition-colors"
              >
                View All Updates
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
