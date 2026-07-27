"use client";

import ServiceIcon from "@/components/shared/ServiceIcon";

interface Service {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  href: string;
  status: string;
}

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onClick: () => void;
}

export default function ServiceCard({ service, isSelected, onClick }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex items-center gap-4 bg-kenya-white/5 border rounded-2xl px-5 py-4
        transition-all duration-300 cursor-pointer w-full text-left
        hover:translate-y-[-2px] hover:shadow-lg hover:border-kenya-white/20
        ${isSelected ? "border-kenya-green bg-kenya-green/10 shadow-md" : "border-kenya-white/10"}
      `}
    >
      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
        <ServiceIcon src={service.icon} alt={service.name} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-kenya-white font-semibold text-base truncate">{service.name}</h3>
      </div>

      <div className="flex-shrink-0 text-kenya-white/60">
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isSelected ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
