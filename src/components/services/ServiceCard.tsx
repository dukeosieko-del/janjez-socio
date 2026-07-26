"use client";

import Image from "next/image";
import Link from "next/link";
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
    <Link href={service.href} onClick={onClick}>
      <div
        className={`
          relative flex items-center gap-4 bg-kenya-white/5 border rounded-2xl px-5 py-4
          transition-all duration-300 cursor-pointer
          hover:translate-y-[-2px] hover:shadow-lg hover:border-kenya-white/20
          ${isSelected ? "border-kenya-green bg-kenya-green/10 shadow-md" : "border-kenya-white/10"}
        `}
      >
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
          <ServiceIcon src={service.icon} alt={service.name} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-kenya-white font-semibold text-base truncate">{service.name}</h3>
          <p className="text-kenya-white/50 text-xs truncate">Click to view services</p>
        </div>

        {isSelected && (
          <div className="w-5 h-5 flex-shrink-0 bg-kenya-green rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-kenya-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </Link>
  );
}
