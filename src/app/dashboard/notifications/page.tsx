"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import NotificationCenter from "@/components/NotificationCenter";

export default function DashboardNotificationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-kenya-black">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1">
          <NotificationCenter
            audience="user"
            title="Your notifications"
            emptyMessage="You have no notifications yet. We'll let you know when something important happens."
          />
        </main>
      </div>
      <Footer />
    </div>
  );
}