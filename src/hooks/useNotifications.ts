import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  fetchNotificationMetrics,
} from '../services/notificationApi.js';

export function useNotifications(userId = 'ANONYMOUS') {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications(userId),
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const unreadCount =
    query.data?.notifications.filter(
      (n) => n.status === 'DELIVERED' || n.status === 'SENT' || n.status === 'QUEUED'
    ).length || 0;

  return {
    notifications: query.data?.notifications || [],
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    markAsRead: readMutation.mutate,
    markAllAsRead: readAllMutation.mutate,
    refetch: query.refetch,
  };
}

export function useNotificationMetrics() {
  const query = useQuery({
    queryKey: ['notification-metrics'],
    queryFn: fetchNotificationMetrics,
    refetchInterval: 15000,
    staleTime: 10000,
  });

  return {
    metrics: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
