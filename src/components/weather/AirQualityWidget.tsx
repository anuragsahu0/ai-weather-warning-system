import { useState } from 'react';
import { Info, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../ui/Dialog.js';
import { useLocation } from '../../context/LocationContext.js';

interface AirQualityWidgetProps {
  aqi?: number;
  pm25?: number;
  pm10?: number;
}

export function AirQualityWidget({
  aqi = 61,
  pm25 = 34.2,
  pm10 = 58.6,
}: AirQualityWidgetProps) {
  const { currentLocation } = useLocation();
  const [showModal, setShowModal] = useState(false);

  // SVG Circular Gauge calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  // Green partial arc like screenshot
  const strokeDashoffset = circumference - (Math.min(aqi, 300) / 300) * (circumference * 0.7);

  return (
    <>
      <div className="space-y-2 select-none">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Air Quality Index
        </h3>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-5">
            {/* Circular Gauge Ring matching screenshot */}
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#22c55e"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center text-center">
                <span className="text-2xl font-bold font-sans text-slate-900">
                  {aqi}
                </span>
              </div>
            </div>

            {/* Category Description */}
            <div className="space-y-1">
              <span className="text-base font-bold text-slate-900 block">
                Satisfactory
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                May cause minor breathing discomfort to sensitive people.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Air Quality Index</span>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              See details
            </button>
          </div>
        </div>
      </div>

      {/* AQI Breakdown Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogClose onClick={() => setShowModal(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            Air Quality Breakdown • {currentLocation.district}
          </DialogTitle>
          <DialogDescription>
            Continuous ambient air quality telemetry synchronized with local atmospheric conditions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Composite Air Quality Index</span>
              <span className="text-3xl font-extrabold text-slate-900 block mt-1">{aqi} — Satisfactory</span>
              <p className="text-xs text-slate-600 mt-0.5">May cause minor breathing discomfort to sensitive people.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">PM2.5 Fine Particles</span>
              <span className="text-xl font-bold text-blue-600 block mt-1">{pm25} µg/m³</span>
              <span className="text-[10px] text-slate-400">Within standard guideline</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">PM10 Coarse Particles</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">{pm10} µg/m³</span>
              <span className="text-[10px] text-slate-400">Standard atmospheric dust</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Nitrogen Dioxide (NO₂)</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">18.4 ppb</span>
              <span className="text-[10px] text-slate-400">Vehicular emission index</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Surface Ozone (O₃)</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">24.1 ppb</span>
              <span className="text-[10px] text-slate-400">Photochemical layer</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Telemetry calibrated with surface atmospheric humidity and barometric pressure.</span>
          </div>
        </div>
      </Dialog>
    </>
  );
}
