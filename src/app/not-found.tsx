import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-6xl font-bold text-kenya-white mb-4">404</h1>
            <p className="text-kenya-white/60 text-lg mb-8">This page could not be found.</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors"
            >
              Go Home
            </a>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
