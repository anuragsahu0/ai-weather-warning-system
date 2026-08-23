import { useRef } from 'react';
import {
  Cloud,
  CloudRain,
  CloudLightning,
  Sun,
  Sunrise,
  CloudFog,
  ChevronRight,
} from 'lucide-react';
import { useCurrentWeather } from '../../hooks/useCurrentWeather.js';

interface HourlyDataPoint {
  timeLabel: string;
  temp: number;
  iconType: 'mist' | 'cloud' | 'rain' | 'thunder' | 'sunrise' | 'sun';
  rainProb?: number;
  isSpecial?: boolean;
  specialLabel?: string;
}

export function HourlyTemperatureCurve() {
  const { weather } = useCurrentWeather();
  const scrollRef = useRef<HTMLDivElement>(null);

  const baseTempC = weather?.temperature ? Math.round(weather.temperature) : 28;
  const baseTempF = Math.round((baseTempC * 9) / 5 + 32);

  // 12-step realistic hourly progression matching screenshot in Fahrenheit (or C)
  const hourlyData: HourlyDataPoint[] = [
    { timeLabel: 'Now', temp: baseTempF, iconType: 'mist' },
    { timeLabel: '00:30', temp: baseTempF, iconType: 'cloud' },
    { timeLabel: '01:30', temp: baseTempF - 1, iconType: 'thunder', rainProb: 34 },
    { timeLabel: '02:30', temp: baseTempF - 1, iconType: 'thunder', rainProb: 62 },
    { timeLabel: '03:30', temp: baseTempF - 2, iconType: 'cloud' },
    { timeLabel: '04:30', temp: baseTempF - 2, iconType: 'cloud' },
    { timeLabel: '05:30', temp: baseTempF - 2, iconType: 'cloud' },
    { timeLabel: '05:41', temp: baseTempF - 2, iconType: 'sunrise', isSpecial: true, specialLabel: 'Sunrise' },
    { timeLabel: '06:30', temp: baseTempF - 2, iconType: 'sun' },
    { timeLabel: '07:30', temp: baseTempF - 1, iconType: 'rain', rainProb: 43 },
    { timeLabel: '08:30', temp: baseTempF + 1, iconType: 'thunder', rainProb: 41 },
    { timeLabel: '09:30', temp: baseTempF + 2, iconType: 'sun', rainProb: 36 },
    { timeLabel: '10:30', temp: baseTempF + 4, iconType: 'sun', rainProb: 32 },
  ];

  const minTemp = Math.min(...hourlyData.map((d) => d.temp)) - 2;
  const maxTemp = Math.max(...hourlyData.map((d) => d.temp)) + 2;
  const tempRange = Math.max(1, maxTemp - minTemp);

  const columnWidth = 68;
  const totalWidth = hourlyData.length * columnWidth;
  const chartHeight = 70;

  const points = hourlyData.map((d, i) => {
    const x = i * columnWidth + columnWidth / 2;
    const normalized = (d.temp - minTemp) / tempRange;
    const y = chartHeight - normalized * (chartHeight - 25) - 15;
    return { x, y, temp: d.temp };
  });

  const pathD = points.reduce((acc, p, idx, arr) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[idx - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }, '');

  const renderIcon = (type: HourlyDataPoint['iconType']) => {
    switch (type) {
      case 'mist':
        return <CloudFog className="w-5 h-5 text-slate-400 mx-auto" />;
      case 'cloud':
        return <Cloud className="w-5 h-5 text-slate-400 mx-auto" />;
      case 'thunder':
        return <CloudLightning className="w-5 h-5 text-amber-500 mx-auto" />;
      case 'rain':
        return <CloudRain className="w-5 h-5 text-blue-500 mx-auto" />;
      case 'sunrise':
        return <Sunrise className="w-5 h-5 text-amber-500 mx-auto" />;
      case 'sun':
      default:
        return <Sun className="w-5 h-5 text-amber-500 mx-auto" />;
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
  };

  return (
    <div className="space-y-2 select-none">
      {/* Title & Subtitle like Screenshot */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Today&apos;s outlook
        </h2>
        <p className="text-sm text-slate-600">
          Tonight&apos;s low temperature will be the same as last night&apos;s.
        </p>
      </div>

      {/* Clean White Card with Scrollable Hourly Chart */}
      <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 overflow-hidden">
        {/* Navigation arrows */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:block">
          <button
            type="button"
            onClick={scrollRight}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="overflow-x-auto pb-2 scrollbar-none pr-8 select-none"
        >
          <div style={{ width: `${totalWidth}px` }} className="relative">
            {/* Top Row: Time, Icons, and Rain Probability Badges */}
            <div className="flex justify-between text-center pb-2">
              {hourlyData.map((d, i) => (
                <div
                  key={i}
                  style={{ width: `${columnWidth}px` }}
                  className="flex flex-col items-center space-y-1 shrink-0"
                >
                  <span className="text-xs font-bold text-slate-800">
                    {d.timeLabel}
                  </span>

                  <div className="h-6 flex items-center justify-center">
                    {renderIcon(d.iconType)}
                  </div>

                  <div className="h-4 flex items-center justify-center">
                    {d.isSpecial ? (
                      <span className="text-[10px] font-bold text-amber-600">
                        {d.specialLabel}
                      </span>
                    ) : d.rainProb ? (
                      <span className="text-xs font-bold text-blue-600">
                        {d.rainProb}%
                      </span>
                    ) : (
                      <span className="text-xs text-transparent">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Row: Orange Spline Curve Line Graph */}
            <div className="relative h-[70px] my-1">
              <svg width={totalWidth} height={chartHeight} className="overflow-visible">
                {/* Clean Orange Temperature Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Orange Dot Markers & Temperature Text */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="#ffffff"
                      stroke="#ea580c"
                      strokeWidth="2.5"
                    />
                    <text
                      x={p.x}
                      y={p.y - 8}
                      textAnchor="middle"
                      className="text-xs font-bold font-sans fill-slate-900"
                    >
                      {p.temp}°
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
