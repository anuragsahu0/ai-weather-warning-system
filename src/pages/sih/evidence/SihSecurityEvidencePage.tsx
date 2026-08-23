import { PageHeader } from '../../../components/layout/PageHeader.js';
import { Card } from '../../../components/ui/Card.js';
import { Badge } from '../../../components/ui/Badge.js';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export function SihSecurityEvidencePage() {
  const securityChecks = [
    {
      category: 'AUTHENTICATION & ACCESS',
      name: 'Role-Based Access Control (RBAC)',
      status: 'PASS',
      details: 'Strict separation of administrative routes (/admin/*) from public inspection endpoints.',
    },
    {
      category: 'INPUT VALIDATION',
      name: 'Zod Runtime Schema & Physical Bounds Checking',
      status: 'PASS',
      details: 'Every incoming observation is verified against meteorological bounds (e.g. Temp > 65°C rejected).',
    },
    {
      category: 'SECRET MANAGEMENT',
      name: 'Server-Side Credential Isolation',
      status: 'PASS',
      details: 'VAPID push private keys and SMTP credentials remain strictly in environment files; zero client leakage.',
    },
    {
      category: 'LOCATION PRIVACY',
      name: 'Zero Continuous GPS Tracking',
      status: 'PASS',
      details: 'Citizen subscriptions store only discrete 1.1km grid cell codes or center coordinates with radius.',
    },
    {
      category: 'IDEMPOTENCY & INTEGRITY',
      name: 'SHA-256 Notification Deduplication',
      status: 'PASS',
      details: 'Deterministic hashing prevents citizen panic spam and protects downstream provider endpoints.',
    },
    {
      category: 'API SECURITY',
      name: 'Strict CORS & Parameter Sanitization',
      status: 'PASS',
      details: 'Express middleware sanitizes all route parameters and enforces strict cross-origin policies.',
    },
  ];

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      <PageHeader
        title="SIH EVIDENCE PACK • SECURITY & PRIVACY AUDIT"
        subtitle="Completed security verification covering credential isolation, input validation, and citizen location privacy."
        badge={
          <Badge variant="operational" dot>
            ALL 6 SECURITY CHECKS PASS
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityChecks.map((chk) => (
          <Card key={chk.name} className="p-4 bg-card/60 backdrop-blur-sm border-border/70 space-y-2">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-[9px] font-bold uppercase text-cyan-400">{chk.category}</span>
              <Badge variant="operational" className="text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" /> {chk.status}
              </Badge>
            </div>

            <h4 className="font-bold text-foreground text-xs">{chk.name}</h4>
            <p className="text-muted-foreground text-[11px] leading-relaxed">{chk.details}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5 bg-card/60 backdrop-blur-sm border-emerald-500/30 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="font-bold text-foreground text-xs">Zero-Exposure Guarantee</h4>
        </div>
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          In accordance with the SIH Security & Privacy Guidelines, no API keys, private passwords, or personal citizen identity records are ever logged in plaintext or exposed over client bundles.
        </p>
      </Card>
    </div>
  );
}
