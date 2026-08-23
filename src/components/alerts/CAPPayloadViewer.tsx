import { WeatherAlert } from '@shared/types/index.js';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../ui/Dialog.js';
import { Code2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button.js';

export function CAPPayloadViewer({
  alert,
  open,
  onOpenChange,
}: {
  alert: WeatherAlert;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  const capXml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${alert.identifier}</identifier>
  <sender>${alert.sender}</sender>
  <sent>${alert.sentAt}</sent>
  <status>${alert.status}</status>
  <msgType>${alert.msgType}</msgType>
  <scope>${alert.scope}</scope>
  <info>
    <category>Met</category>
    <event>${alert.hazardType}</event>
    <urgency>${alert.urgency}</urgency>
    <severity>${alert.severity}</severity>
    <certainty>${alert.certainty}</certainty>
    <headline>${alert.headline}</headline>
    <description>${alert.description}</description>
    <instruction>${alert.instruction || 'N/A'}</instruction>
    <effective>${alert.effectiveAt}</effective>
    <expires>${alert.expiresAt}</expires>
    <senderName>${alert.issuedByAuthority}</senderName>
  </info>
</alert>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(capXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClick={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          Common Alerting Protocol (CAP v1.2) Payload
        </DialogTitle>
        <DialogDescription>
          Standardized ITU/OASIS CAP exchange payload for emergency broadcast gateways.
        </DialogDescription>
      </DialogHeader>

      <div className="relative mt-2">
        <div className="absolute right-2 top-2 z-10">
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-7 text-xs gap-1 bg-card/80">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy CAP XML'}
          </Button>
        </div>

        <pre className="p-4 rounded-lg bg-mission-950 border border-border/70 text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
          {capXml}
        </pre>
      </div>
    </Dialog>
  );
}
