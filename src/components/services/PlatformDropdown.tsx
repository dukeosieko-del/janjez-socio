"use client";

import { SERVICES, SERVICES_CATEGORIES } from "@/lib/services-data";
import ServiceIcon from "@/components/shared/ServiceIcon";

interface PlatformDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PlatformDropdown({ value, onChange }: PlatformDropdownProps) {
  const category = SERVICES_CATEGORIES.find((c) => c.value === value);
  const label = category ? `${category.label} ▼` : "Choose Platform ▼";

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 pr-10 text-kenya-white focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all cursor-pointer min-w-[200px]"
      >
        {SERVICES_CATEGORIES.map((cat) => (
          <optgroup key={cat.id} label={cat.label}>
            <option value={cat.value}>{cat.label}</option>
            {cat.children?.map((childId) => {
              const service = SERVICES.find((s) => s.id === childId);
              return service ? (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ) : null;
            })}
          </optgroup>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kenya-white/60 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
