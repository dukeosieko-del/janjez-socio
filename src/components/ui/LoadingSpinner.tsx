"use client";

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-kenya-white/60">Loading...</p>
      </div>
    </div>
  );
}
