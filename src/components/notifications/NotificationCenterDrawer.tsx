import { useState } from 'react';
import { Bell, CheckCheck, Clock, ShieldAlert, X } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { NotificationRecord, AlertEvent } from '@shared/types/index.js';
import { AlertDetailModal } from '../alerts/AlertDetailModal.js';
import { fetchAlertById } from '../../services/notificationApi.js';

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenterDrawer({
  isOpen,
  onClose,
}: NotificationCenterDrawerProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'delivered'>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertEvent | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread') return n.status !== 'READ';
    if (activeTab === 'delivered') return n.status === 'DELIVERED';
    return true;
  });

  const handleNotificationClick = async (notif: NotificationRecord) => {
    markAsRead(notif.notificationId);
    try {
      const alert = await fetchAlertById(notif.alertId);
      setSelectedAlert(alert);
      setIsAlertModalOpen(true);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm animate-in fade-in-0">
        <div className="relative w-full max-w-md h-full bg-card border-l border-border/80 shadow-2xl p-4 flex flex-col font-mono text-xs animate-in slide-in-from-right-8 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-cyan-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-card animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Early-Warning Message Center
                </h3>
                <span className="text-[10px] text-muted-foreground">
                  {unreadCount} Unread Early Warning Broadcasts
                </span>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div className="flex items-center gap-1">
              <Button
                variant={activeTab === 'all' ? 'default' : 'ghost'}
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => setActiveTab('all')}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={activeTab === 'unread' ? 'default' : 'ghost'}
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => setActiveTab('unread')}
              >
                Unread ({unreadCount})
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2 gap-1 text-muted-foreground"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="w-3 h-3 text-cyan-400" /> Mark Read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-1">
                <ShieldAlert className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p>No early-warning broadcasts in this view.</p>
                <span className="text-[10px]">All monitored sectors currently within nominal baseline.</span>
              </div>
            ) : (
              filtered.map((n) => {
                const isUnread = n.status !== 'READ';
                return (
                  <div
                    key={n.notificationId}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isUnread
                        ? 'bg-mission-950/80 border-cyan-500/40 shadow-sm'
                        : 'bg-card/40 border-border/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="font-bold text-foreground text-[11px] block">
                          {n.title}
                        </span>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">
                          {n.body}
                        </p>
                      </div>

                      <Badge
                        variant={n.riskLevel === 'SEVERE' || n.riskLevel === 'HIGH' ? 'high' : 'standby'}
                        className="text-[9px] px-1.5 py-0 shrink-0 font-bold"
                      >
                        {n.riskLevel}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-muted-foreground border-t border-border/30 pt-1.5 mt-2">
                      <span>Channel: {n.channel}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Disclaimer */}
          <div className="border-t border-border/40 pt-2 text-[9px] text-muted-foreground text-center">
            ERROR 404 AI Nowcasting • Automated Advisory System
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </>
  );
}
