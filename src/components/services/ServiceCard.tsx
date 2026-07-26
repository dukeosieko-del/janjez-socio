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
          relative bg-kenya-white/5 border rounded-2xl p-6 text-center
          transition-all duration-300 cursor-pointer
          hover:translate-y-[-4px] hover:shadow-lg hover:border-kenya-white/20
          ${isSelected ? "border-kenya-green bg-kenya-green/10 shadow-md" : "border-kenya-white/10"}
        `}
      >
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 flex items-center justify-center">
            <ServiceIcon src={service.icon} alt={service.name} />
          </div>
        </div>

        <h3 className="text-kenya-white font-bold text-lg mb-2">{service.name}</h3>
        <p className="text-kenya-white/60 text-sm">{service.description}</p>

        {isSelected && (
          <div className="absolute top-3 right-3 w-5 h-5 bg-kenya-green rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-kenya-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </Link>
  );
}
