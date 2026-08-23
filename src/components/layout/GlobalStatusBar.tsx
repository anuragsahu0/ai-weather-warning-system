import { useSystemHealth } from '../../hooks/useMonitoring.js';

export function GlobalStatusBar() {
  const { health } = useSystemHealth();

  const dataStatus = health?.services?.weatherIngestion?.status || 'HEALTHY';
  const modelStatus = health?.services?.nowcastingEngine?.status || 'HEALTHY';
  const fusionStatus = health?.services?.fusionEngine?.status || 'HEALTHY';
  const riskStatus = health?.services?.riskEngine?.status || 'HEALTHY';
  const alertStatus = health?.services?.notificationWorker?.status || 'HEALTHY';

  const getDotColor = (status: string) => {
    if (status === 'HEALTHY') return 'bg-emerald-500';
    if (status === 'DEGRADED') return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="w-full bg-white/90 border-t border-slate-200/80 py-1.5 px-6 text-[10px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-3 select-none backdrop-blur-md">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="font-bold text-slate-800 tracking-wider">ERROR 404 STATUS:</span>

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${getDotColor(dataStatus)} animate-pulse`} />
          <span>DATA: <strong className="text-slate-800">{dataStatus}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${getDotColor(modelStatus)} animate-pulse`} />
          <span>MODEL: <strong className="text-slate-800">{modelStatus === 'HEALTHY' ? 'READY' : modelStatus}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${getDotColor(fusionStatus)} animate-pulse`} />
          <span>FUSION: <strong className="text-slate-800">{fusionStatus === 'HEALTHY' ? 'ACTIVE' : fusionStatus}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${getDotColor(riskStatus)} animate-pulse`} />
          <span>RISK: <strong className="text-slate-800">{riskStatus === 'HEALTHY' ? 'ACTIVE' : riskStatus}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${getDotColor(alertStatus)} animate-pulse`} />
          <span>ALERTS: <strong className="text-slate-800">{alertStatus === 'HEALTHY' ? 'READY' : alertStatus}</strong></span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-slate-500">
        <span>Smart India Hackathon • Severe Weather Nowcasting</span>
      </div>
    </div>
  );
}
