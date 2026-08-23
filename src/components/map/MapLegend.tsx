export function MapLegend() {
  const levels = [
    { label: '10', color: '#06b6d4', desc: 'Light' },
    { label: '25', color: '#10b981', desc: 'Moderate' },
    { label: '40', color: '#eab308', desc: 'Heavy' },
    { label: '50', color: '#f97316', desc: 'Severe' },
    { label: '65+', color: '#ef4444', desc: 'Hail / Cloudburst' },
  ];

  return (
    <div className="flex flex-col gap-1 p-2 rounded-lg bg-mission-900/90 border border-border/70 backdrop-blur-md text-[10px] font-mono shadow-md">
      <span className="text-muted-foreground font-sans font-semibold text-[9px] uppercase tracking-wider">
        Reflectivity (dBZ)
      </span>
      <div className="flex items-center gap-1">
        {levels.map((lvl) => (
          <div key={lvl.label} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: lvl.color }} />
            <span className="text-slate-300">{lvl.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
