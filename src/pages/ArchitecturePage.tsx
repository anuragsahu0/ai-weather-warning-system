import { PageHeader } from '../components/layout/PageHeader.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { ArchitectureVisualizer } from '../components/architecture/ArchitectureVisualizer.js';
import { Layers, Server, Cpu, Database, Bell, Activity } from 'lucide-react';

export function ArchitecturePage() {
  const techStack = [
    {
      category: 'Frontend & UI Shell',
      icon: Layers,
      items: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Lucide React', 'TanStack Query', 'Chart.js / React-Chartjs-2'],
    },
    {
      category: 'Backend & APIs',
      icon: Server,
      items: ['Node.js (v20+)', 'Express.js', 'TypeScript', 'Zod Runtime Validation', 'Prisma ORM', 'Axios'],
    },
    {
      category: 'Database & Spatial Storage',
      icon: Database,
      items: ['PostgreSQL 16', 'PostGIS Geospatial Engine', 'Prisma Client Extension', 'In-Memory State Cache'],
    },
    {
      category: 'Deep Learning & ML Inference',
      icon: Cpu,
      items: ['PyTorch 2.4', 'Apple Silicon MPS (Metal)', 'NVIDIA CUDA', 'FastAPI Microservice', 'Scikit-Learn', 'NumPy', 'Pandas'],
    },
    {
      category: 'Notification & Message Delivery',
      icon: Bell,
      items: ['SHA-256 Deduplication', 'Web Push (VAPID / web-push)', 'Nodemailer (SMTP)', 'In-App Audit Stream'],
    },
    {
      category: 'Observability & Testing',
      icon: Activity,
      items: ['Kubernetes Health Probes', 'Vitest / TSX Test Runner', 'Pytest Suite', 'Population Stability Index (PSI)'],
    },
  ];

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      <PageHeader
        title="SYSTEM ARCHITECTURE & PRODUCTION TECH STACK"
        subtitle="Comprehensive architectural layers, data pipelines, hardware execution nodes, and verified technology stack."
        badge={
          <Badge variant="operational" dot>
            PRODUCTION ARCHITECTURE
          </Badge>
        }
      />

      {/* 1. Visual Pipeline */}
      <Card className="p-5 bg-card/60 backdrop-blur-sm border-border/70 space-y-3">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-foreground text-sm">End-to-End System Pipeline</h3>
        </div>
        <ArchitectureVisualizer />
      </Card>

      {/* 2. Technology Stack Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          Verified Production Technology Stack
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {techStack.map((tech) => {
            const Icon = tech.icon;
            return (
              <Card key={tech.category} className="p-4 bg-card/60 backdrop-blur-sm border-border/70 space-y-2">
                <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-bold text-foreground text-xs">{tech.category}</h4>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tech.items.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 rounded bg-background/50 border border-border/40 text-[10px] text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
