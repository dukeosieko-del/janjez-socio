import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { listJanjezServices } from "@/lib/janjez-services";
import ServiceDenseList from "@/components/ServiceDenseList";

export const revalidate = 0;

export default async function ServicesPage() {
  const services = await listJanjezServices(true, "show_catalogue");

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Services</h1>
              <p className="text-kenya-white/60 text-sm sm:text-base">
                Browse all services across platforms. Select a category to filter.
              </p>
            </div>
            <ServiceDenseList services={services} />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
