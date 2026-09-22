'use client';

import { useState } from 'react';

// A5c — maximum markup is 100% (reseller may not more than double the
// wholesale base price). This is enforced server-side in
// app/api/child/orders/route.ts; the UI clamps to the same bound so users
// cannot even select an out-of-range value.
const MAX_MARKUP_PERCENT = 100;

interface PriceEditorProps {
  basePrice: number;
  markupPercent: number;
  onPriceChange: (price: number) => void;
}

export default function PriceEditor({
  basePrice,
  markupPercent,
  onPriceChange,
}: PriceEditorProps) {
  const clampedInitial = Math.max(0, Math.min(markupPercent, MAX_MARKUP_PERCENT));
  const [localMarkup, setLocalMarkup] = useState(clampedInitial);
  const calculated = Math.round(basePrice * (1 + localMarkup / 100));

  function handleChange(value: number) {
    const clamped = Math.max(0, Math.min(value, MAX_MARKUP_PERCENT));
    setLocalMarkup(clamped);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Base price:</span>
        <span className="text-sm font-mono">{basePrice.toFixed(0)} KES</span>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-500 whitespace-nowrap">Markup:</label>
        <input
          type="range"
          min={0}
          max={MAX_MARKUP_PERCENT}
          step={5}
          value={localMarkup}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm font-mono w-16 text-right">{localMarkup}%</span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>0%</span>
        <span>Max {MAX_MARKUP_PERCENT}%</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
        <span className="text-sm font-medium">Child price:</span>
        <span className="text-lg font-bold text-green-700">{calculated.toFixed(0)} KES</span>
      </div>
      <button
        type="button"
        onClick={() => onPriceChange(calculated)}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
      >
        Set Price
      </button>
    </div>
  );
}
