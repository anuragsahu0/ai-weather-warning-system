import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';

export function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 select-none">
      {/* Radar Reticle Graphic with 404 Emblem */}
      <div className="relative flex items-center justify-center w-48 h-48 mb-6">
        <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-20" />
        <div className="absolute inset-4 rounded-full border border-cyan-500/30" />
        <div className="absolute inset-10 rounded-full border border-cyan-500/40" />

        {/* Azimuth crosshair */}
        <div className="absolute w-full h-[1px] bg-cyan-500/20" />
        <div className="absolute h-full w-[1px] bg-cyan-500/20" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="text-4xl font-extrabold font-mono tracking-widest text-foreground">
            ERROR <span className="text-cyan-400">404</span>
          </div>
          <Badge variant="radar" className="mt-1 font-mono text-[9px]">
            SECTOR NOT FOUND
          </Badge>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-md space-y-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">
          Atmospheric Telemetry Coordinate Undefined
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The requested meteorological route or sensor sector does not exist in the ERROR 404 nowcast grid repository.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6">
        <Link to="/">
          <Button variant="default" size="sm" className="gap-2 text-xs">
            <Home className="w-3.5 h-3.5" />
            Return to Mission Control
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Previous Vector
        </Button>
      </div>

      <div className="mt-10 font-mono text-[10px] text-muted-foreground/60">
        ERROR 404 • AI-Driven Hyper-Local Severe Weather Nowcasting Platform
      </div>
    </div>
  );
}
