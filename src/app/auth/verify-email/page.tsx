import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-kenya-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-kenya-green" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Verify Your Email</h1>
              <p className="text-kenya-white/60">We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to activate your account.</p>
            </div>
            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 sm:p-8 text-center">
              <p className="text-kenya-white/70 text-sm mb-6">Didn&apos;t receive the email? Check your spam folder or try signing up again.</p>
              <div className="flex flex-col gap-3">
                <Link href="/auth/sign-in" className="inline-flex items-center justify-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors">
                  Go to Sign In
                </Link>
                <Link href="/order" className="inline-flex items-center justify-center gap-2 bg-kenya-white/10 text-kenya-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-white/20 transition-colors border border-kenya-white/10">
                  Browse Services
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
