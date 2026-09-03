"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import NotificationCenter from "@/components/NotificationCenter";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function DashboardNotificationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-kenya-black">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1">
          <ErrorBoundary
            title="Couldn't load notifications"
            description="We couldn't load your notifications. Please try again."
          >
            <NotificationCenter
              audience="user"
              title="Your notifications"
              emptyMessage="You have no notifications yet. We'll let you know when something important happens."
            />
          </ErrorBoundary>
        </main>
      </div>
      <Footer />
    </div>
  );
}