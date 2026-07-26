import ServicesGrid from "@/components/services/ServicesGrid";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-kenya-black">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-kenya-white mb-4">Services</h1>
          <p className="text-kenya-white/60 text-lg max-w-2xl mx-auto">
            Choose a platform to boost your social media presence
          </p>
        </div>

        <ServicesGrid />
      </main>
    </div>
  );
}
