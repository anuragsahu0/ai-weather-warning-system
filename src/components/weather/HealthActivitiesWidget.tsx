import { ChevronRight, Sparkles } from 'lucide-react';

export function HealthActivitiesWidget() {
  return (
    <div className="space-y-2 select-none">
      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
        Health & Activities
      </h3>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 hover:border-slate-300 transition-all cursor-pointer">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Circular icon container matching screenshot */}
            <div className="relative w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 border border-slate-200/60">
              <Sparkles className="w-5 h-5 text-slate-600" />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                Seasonal Allergies and Pollen Count Forecast
              </span>
              <span className="text-xs text-slate-500 block">
                No pollen detected in your area
              </span>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
        </div>
      </div>
    </div>
  );
}
