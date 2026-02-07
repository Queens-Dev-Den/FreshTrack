import { useEffect, useState } from 'react';

interface AnalogGaugeProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  size?: number;
  lowLabel?: string;
  highLabel?: string;
  formatValue?: (v: number) => string;
}

const AnalogGauge = ({
  value,
  max,
  label,
  sublabel,
  size = 200,
  lowLabel,
  highLabel,
  formatValue,
}: AnalogGaugeProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = Math.min(animatedValue / max, 1);
  const angle = -135 + percentage * 270; // Sweep from -135° to +135°
  const r = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;

  // Tick marks
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const tickAngle = (-135 + i * 27) * (Math.PI / 180);
    const x1 = cx + (r - 8) * Math.cos(tickAngle);
    const y1 = cy + (r - 8) * Math.sin(tickAngle);
    const x2 = cx + (r - (i % 5 === 0 ? 20 : 14)) * Math.cos(tickAngle);
    const y2 = cy + (r - (i % 5 === 0 ? 20 : 14)) * Math.sin(tickAngle);
    return { x1, y1, x2, y2, major: i % 5 === 0 };
  });

  // Needle
  const needleAngle = angle * (Math.PI / 180);
  const needleLen = r - 30;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy + needleLen * Math.sin(needleAngle);

  const displayValue = formatValue ? formatValue(animatedValue) : `${Math.round(animatedValue)}`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.75}`}>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--gold))" strokeWidth="2" opacity="0.5" />
        <circle cx={cx} cy={cy} r={r - 5} fill="none" stroke="hsl(var(--gold))" strokeWidth="0.5" opacity="0.3" />

        {/* Arc background */}
        <path
          d={describeArc(cx, cy, r - 12, -135, 135)}
          fill="none"
          stroke="hsl(var(--gold) / 0.15)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Arc filled */}
        <path
          d={describeArc(cx, cy, r - 12, -135, angle)}
          fill="none"
          stroke="hsl(var(--gold))"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ transition: 'all 1.5s ease-out' }}
        />

        {/* Ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke="hsl(var(--gold))"
            strokeWidth={t.major ? 2 : 1}
            opacity={t.major ? 0.8 : 0.4}
          />
        ))}

        {/* Needle */}
        <line
          x1={cx} y1={cy} x2={nx} y2={ny}
          stroke="hsl(var(--burgundy))"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transition: 'all 1.5s ease-out' }}
        />
        <circle cx={cx} cy={cy} r="5" fill="hsl(var(--gold))" />
        <circle cx={cx} cy={cy} r="2.5" fill="hsl(var(--mahogany))" />

        {/* Value */}
        <text x={cx} y={cy + 28} textAnchor="middle" fill="hsl(var(--gold))" fontSize="18" fontFamily="Playfair Display" fontWeight="700">
          {displayValue}
        </text>

        {/* Low/High labels */}
        {lowLabel && (
          <text x={cx - r + 30} y={cy + 10} textAnchor="middle" fill="hsl(var(--sepia))" fontSize="8" fontFamily="Lora" opacity="0.7">
            {lowLabel}
          </text>
        )}
        {highLabel && (
          <text x={cx + r - 30} y={cy + 10} textAnchor="middle" fill="hsl(var(--sepia))" fontSize="8" fontFamily="Lora" opacity="0.7">
            {highLabel}
          </text>
        )}
      </svg>

      <p className="font-heading text-gold text-sm tracking-wider uppercase mt-1">{label}</p>
      {sublabel && <p className="font-body text-sepia text-xs mt-0.5">{sublabel}</p>}
    </div>
  );
};

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default AnalogGauge;
