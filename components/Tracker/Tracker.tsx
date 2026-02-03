'use client';

import { useState } from 'react';

interface TrackerBlock {
  value: number; // 0-100 arası değer
  tooltip: string;
}

interface TrackerProps {
  data: TrackerBlock[];
  className?: string;
}

// Değere göre renk hesapla (0-100)
const getColorFromValue = (value: number): string => {
  if (value >= 70) {
    // Yüksek talep: Kırmızı tonları (70-100)
    const intensity = Math.min(100, ((value - 70) / 30) * 100);
    return `rgb(${220 + intensity * 0.15}, ${40 - intensity * 0.2}, ${40 - intensity * 0.2})`;
  } else if (value >= 30) {
    // Orta talep: Turuncu tonları (30-70)
    const progress = (value - 30) / 40; // 0 to 1
    const r = 255;
    const g = Math.round(165 - progress * 125); // 165 → 40
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Düşük talep: Sarı tonları (0-30)
    const intensity = value / 30;
    const r = 255;
    const g = Math.round(200 + intensity * 55); // 200 → 255
    const b = Math.round(50 * (1 - intensity)); // 50 → 0
    return `rgb(${r}, ${g}, ${b})`;
  }
};

// Tooltip metni
const getTooltipText = (value: number): string => {
  if (value >= 80) return 'Çok Yüksek';
  if (value >= 70) return 'Yüksek';
  if (value >= 50) return 'Orta-Yüksek';
  if (value >= 30) return 'Orta';
  return 'Düşük';
};

export default function Tracker({ data, className = '' }: TrackerProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-[2px] w-full">
        {data.map((block, index) => (
          <div
            key={index}
            className="flex-1 min-w-0 relative group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className={`
                w-full h-8 rounded-[3px] transition-all duration-200
                ${hoveredIndex === index ? 'transform -translate-y-1 opacity-90' : ''}
              `}
              style={{ backgroundColor: getColorFromValue(block.value) }}
            />
            
            {/* Tooltip */}
            {hoveredIndex === index && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                <div className="bg-black/90 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                  <div className="font-semibold">{getTooltipText(block.value)}</div>
                  <div className="text-white/70">Skor: {block.value}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
