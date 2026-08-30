import Link from "next/link";

export default function AnonymousOrderCreatedPage() {
  return (
    <div className="min-h-screen bg-kenwa-black flex items-center justify-center py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-kenya-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-10 w-10 text-kenya-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-kenya-white mb-4">Order Placed!</h1>
        <p className="text-kenya-white/60 mb-8">
          Your anonymous order has been received. Check your phone for the M-Pesa STK push
          to complete payment.
        </p>
        <Link
          href="/services"
          className="inline-block bg-kenya-green text-kenya-black font-bold py-3 px-6 rounded-xl hover:bg-kenya-green/90 transition-all"
        >
          Back to Services
        </Link>
      </div>
    </div>
  );
}
