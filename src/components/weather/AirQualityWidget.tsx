import { useState } from 'react';
import { Info, CheckCircle2, Wind, Activity, ShieldCheck, Sparkles, SunMedium } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../ui/Dialog.js';
import { useAirQuality } from '../../hooks/useAirQuality.js';

export function AirQualityWidget() {
  const { airQuality, currentLocation, isLoading } = useAirQuality();
  const [showModal, setShowModal] = useState(false);

  const {
    aqi,
    category,
    categoryColor,
    glowColor,
    advisory,
    pm25,
    pm10,
    no2,
    o3,
    so2,
    co,
    dust,
    uvIndex,
  } = airQuality;

  // 3D SVG Circular Gauge Calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  // Progress fraction (max 300 scale)
  const normalizedProgress = Math.min(Math.max(aqi / 300, 0.05), 1);
  const strokeDashoffset = circumference - normalizedProgress * (circumference * 0.75);

  return (
    <>
      <div className="space-y-2 select-none">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wind className="w-4 h-4 text-blue-600" />
            Air Quality Index
          </h3>
          <span className="text-[11px] font-mono text-slate-500 font-semibold">
            {currentLocation.district}
          </span>
        </div>

        {/* 3D Glassmorphism Card */}
        <div className="relative overflow-hidden bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-6 space-y-4 group">
          {/* Subtle 3D background ambient light matching current AQI status */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700"
            style={{ backgroundColor: categoryColor }}
          />

          <div className="flex items-center gap-5">
            {/* 3D Spherical Gauge with Ambient Ring & Glowing Arc */}
            <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
              {/* Outer 3D Glow Filter */}
              <div
                className="absolute inset-0 rounded-full blur-md opacity-30 transition-all duration-700 scale-95"
                style={{ backgroundColor: categoryColor }}
              />

              <svg className="w-20 h-20 transform -rotate-90 drop-shadow-sm overflow-visible" viewBox="0 0 100 100">
                <defs>
                  {/* Dynamic 3D Linear Gradient */}
                  <linearGradient id={`aqiGradient-${aqi}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={categoryColor} stopOpacity="1" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                  </linearGradient>
                  {/* 3D Drop Shadow filter */}
                  <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={categoryColor} floodOpacity="0.4" />
                  </filter>
                </defs>

                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#f1f5f9"
                  strokeWidth="8"
                  fill="transparent"
                />

                {/* 3D Progress Arc with Glow */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={`url(#aqiGradient-${aqi})`}
                  strokeWidth="8.5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  filter="url(#gaugeShadow)"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* 3D Inner Orb Value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold font-sans text-slate-900 tracking-tight leading-none drop-shadow-xs">
                  {isLoading ? '...' : aqi}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                  AQI
                </span>
              </div>
            </div>

            {/* Category & Status Description */}
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
                  style={{ backgroundColor: categoryColor, boxShadow: `0 0 8px ${glowColor}` }}
                />
                <span className="text-base font-extrabold text-slate-900 block">
                  {category}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {advisory}
              </p>
            </div>
          </div>

          {/* Quick 3D Metrics Bar: PM2.5 & PM10 */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 font-sans">
            <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">PM2.5</span>
              <strong className="text-xs font-bold text-slate-900">{pm25} µg/m³</strong>
            </div>
            <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">PM10</span>
              <strong className="text-xs font-bold text-slate-900">{pm10} µg/m³</strong>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Live Sensor Feed</span>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              See details
            </button>
          </div>
        </div>
      </div>

      {/* 3D AQI Pollutants Detail Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogClose onClick={() => setShowModal(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 text-lg">
            <Wind className="h-5 w-5 text-blue-600" />
            3D Air Quality Intelligence • {currentLocation.district}
          </DialogTitle>
          <DialogDescription>
            Real-time multi-pollutant telemetry analyzed at {currentLocation.coordinates.latitude.toFixed(4)}°N, {currentLocation.coordinates.longitude.toFixed(4)}°E.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          {/* Main 3D Banner */}
          <div
            className="p-5 rounded-3xl border flex items-center justify-between shadow-sm relative overflow-hidden"
            style={{
              borderColor: categoryColor,
              backgroundColor: '#f8fafc',
            }}
          >
            <div
              className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none"
              style={{ backgroundColor: categoryColor }}
            />

            <div className="relative z-10 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Current Environmental Assessment
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-3xl font-extrabold text-slate-900">
                  {aqi}
                </span>
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full text-white shadow-xs"
                  style={{ backgroundColor: categoryColor }}
                >
                  {category}
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-md pt-0.5">{advisory}</p>
            </div>

            <div className="hidden sm:flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <Activity className="w-6 h-6 text-blue-600 mb-1" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Live Sensor</span>
              <span className="text-xs font-bold text-emerald-600">Active</span>
            </div>
          </div>

          {/* 3D 6-Pollutant Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* PM2.5 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>PM2.5 (Fine)</span>
                <span className="text-[10px] text-blue-600 font-mono">µg/m³</span>
              </div>
              <span className="text-2xl font-extrabold text-slate-900 block mt-1.5">{pm25}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Combustion & Smoke</span>
            </div>

            {/* PM10 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>PM10 (Coarse)</span>
                <span className="text-[10px] text-blue-600 font-mono">µg/m³</span>
              </div>
              <span className="text-2xl font-extrabold text-slate-900 block mt-1.5">{pm10}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Dust & Pollen</span>
            </div>

            {/* NO2 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>Nitrogen (NO₂)</span>
                <span className="text-[10px] text-blue-600 font-mono">µg/m³</span>
              </div>
              <span className="text-2xl font-extrabold text-slate-900 block mt-1.5">{no2}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Vehicular Traffic</span>
            </div>

            {/* Ozone */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>Ozone (O₃)</span>
                <span className="text-[10px] text-blue-600 font-mono">µg/m³</span>
              </div>
              <span className="text-2xl font-extrabold text-slate-900 block mt-1.5">{o3}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Photochemical smog</span>
            </div>

            {/* SO2 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>Sulphur (SO₂)</span>
                <span className="text-[10px] text-blue-600 font-mono">µg/m³</span>
              </div>
              <span className="text-2xl font-extrabold text-slate-900 block mt-1.5">{so2}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Industrial Emission</span>
            </div>

            {/* Carbon Monoxide */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
              <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>Carbon (CO)</span>
                <span className="text-[10px] text-blue-600 font-mono">µg/m³</span>
              </div>
              <span className="text-2xl font-extrabold text-slate-900 block mt-1.5">{co}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Combustion Index</span>
            </div>
          </div>

          {/* Environmental Radiation & Dust Bar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SunMedium className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-700">UV Solar Index</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{uvIndex} UV</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-slate-700">Atmospheric Dust</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{dust} µg/m³</span>
            </div>
          </div>

          {/* Health Standard Verification */}
          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200/90 flex items-center gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Real-time atmospheric telemetry calibrated against WMO & National Air Quality Standards.
            </span>
          </div>
        </div>
      </Dialog>
    </>
  );
}
