import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCatalog from "@/components/ServiceCatalog";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import HomeRedirect from "@/components/HomeRedirect";

export default function Home() {
  return (
    <>
      <HomeRedirect />
      <div className="min-h-screen flex bg-kenya-black">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <AnnouncementBanner />
          <LiveTicker />
          <Header />

          <main className="flex-1">
            <Hero />
            <ServiceCatalog />
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
