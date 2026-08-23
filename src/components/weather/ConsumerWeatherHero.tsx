import { useState } from 'react';
import {
  MapPin,
  CloudFog,
  CloudRain,
  CloudLightning,
  Sun,
  Cloud,
  ChevronDown,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext.js';
import { useCurrentWeather } from '../../hooks/useCurrentWeather.js';
import { formatIstTime } from '../../lib/utils.js';

interface ConsumerWeatherHeroProps {
  activeTab: 'today' | 'hourly' | 'radar' | 'risk' | 'tenday';
  onTabChange: (tab: 'today' | 'hourly' | 'radar' | 'risk' | 'tenday') => void;
  onOpenLocationModal: () => void;
}

export function ConsumerWeatherHero({
  activeTab,
  onTabChange,
  onOpenLocationModal,
}: ConsumerWeatherHeroProps) {
  const { currentLocation } = useLocation();
  const { weather } = useCurrentWeather();
  const [unit, setUnit] = useState<'F' | 'C'>('F');

  const tempC = weather?.temperature ? Math.round(weather.temperature) : 28;
  const tempF = Math.round((tempC * 9) / 5 + 32);
  const feelsC = weather?.feelsLike ? Math.round(weather.feelsLike) : tempC + 4;
  const feelsF = Math.round((feelsC * 9) / 5 + 32);
  const highC = tempC + 3;
  const highF = Math.round((highC * 9) / 5 + 32);
  const lowC = tempC - 3;
  const lowF = Math.round((lowC * 9) / 5 + 32);

  const displayTemp = unit === 'C' ? tempC : tempF;
  const displayFeels = unit === 'C' ? feelsC : feelsF;
  const displayHigh = unit === 'C' ? highC : highF;
  const displayLow = unit === 'C' ? lowC : lowF;

  const condition = weather?.weatherCondition || 'Mist';
  const precipRate = weather?.precipitationRate ?? weather?.rainfall ?? 0;
  const rainChance = Math.min(100, Math.round((weather?.humidity ?? 60) * 0.2 + (precipRate > 0 ? 40 : 8)));

  const renderWeatherHeroIcon = () => {
    const cond = condition.toLowerCase();
    if (cond.includes('thunder') || cond.includes('storm')) {
      return <CloudLightning className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500 drop-shadow-sm" />;
    }
    if (cond.includes('rain') || cond.includes('shower') || cond.includes('drizzle')) {
      return <CloudRain className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500 drop-shadow-sm" />;
    }
    if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze')) {
      return <CloudFog className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400 drop-shadow-sm" />;
    }
    if (cond.includes('cloud') || cond.includes('overcast')) {
      return <Cloud className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400 drop-shadow-sm" />;
    }
    return <Sun className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500 drop-shadow-sm" />;
  };

  return (
    <div className="space-y-6 select-none">
      {/* 1. Top Controls Bar: Location Pill & View Switcher Pills */}
      <div className="flex flex-wrap items-center gap-3">
        {/* White Location Dropdown Pill */}
        <button
          type="button"
          onClick={onOpenLocationModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-semibold text-sm shadow-sm transition-all group shrink-0"
        >
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>{currentLocation.district}</span>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
        </button>

        {/* View Selection Pill Container */}
        <div className="flex items-center p-1 rounded-full bg-slate-100/90 text-xs font-semibold text-slate-600 overflow-x-auto border border-slate-200">
          <button
            type="button"
            onClick={() => onTabChange('today')}
            className={`px-5 py-1.5 rounded-full transition-all ${
              activeTab === 'today'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onTabChange('hourly')}
            className={`px-5 py-1.5 rounded-full transition-all ${
              activeTab === 'hourly'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            Hourly
          </button>
          <button
            type="button"
            onClick={() => onTabChange('tenday')}
            className={`px-5 py-1.5 rounded-full transition-all ${
              activeTab === 'tenday'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            10 Day
          </button>
          <button
            type="button"
            onClick={() => onTabChange('radar')}
            className={`px-5 py-1.5 rounded-full transition-all ${
              activeTab === 'radar'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            1.1km Radar
          </button>
          <button
            type="button"
            onClick={() => onTabChange('risk')}
            className={`px-5 py-1.5 rounded-full transition-all ${
              activeTab === 'risk'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            Risk Intelligence
          </button>
        </div>
      </div>

      {/* 2. City Title & Subtitle */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {currentLocation.district} Weather
          </h1>

          {/* Unit Toggle Pill */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold font-mono">
            <button
              type="button"
              onClick={() => setUnit('F')}
              className={`px-2 py-0.5 rounded ${unit === 'F' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              °F
            </button>
            <button
              type="button"
              onClick={() => setUnit('C')}
              className={`px-2 py-0.5 rounded ${unit === 'C' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              °C
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>{currentLocation.district}, {currentLocation.state}</span>
          <span>•</span>
          <span>As of {formatIstTime(new Date())}</span>
        </div>
      </div>

      {/* 3. Hero Weather Card — Clean Pure White / Sky Atmospheric Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-sky-50/60 text-slate-900 p-7 sm:p-9 shadow-sm border border-slate-200/90">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Huge Temp & Metrics */}
          <div className="space-y-4">
            <div className="text-7xl sm:text-8xl md:text-9xl font-extrabold font-sans tracking-tight text-slate-900 leading-none">
              {displayTemp}°
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5 text-sm sm:text-base text-slate-700 font-semibold">
                <span>
                  Feels Like <strong className="text-slate-950 font-bold">{displayFeels}°</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  High <strong className="text-slate-950 font-bold">{displayHigh}°</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  Low <strong className="text-slate-950 font-bold">{displayLow}°</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-slate-600 font-medium">
                <span>
                  Chance of Rain <strong className="text-blue-600 font-bold">{rainChance}%</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  {precipRate > 0 ? `${precipRate.toFixed(1)} mm` : '0 in'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Weather Icon & Condition */}
          <div className="flex flex-col items-center md:items-end justify-center space-y-2 text-center md:text-right shrink-0">
            {renderWeatherHeroIcon()}
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 capitalize">
              {condition}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
