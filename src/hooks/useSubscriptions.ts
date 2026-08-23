import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSubscriptions,
  createSubscription,
  deleteSubscription,
} from '../services/notificationApi.js';

export function useSubscriptions(userId = 'ANONYMOUS') {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['subscriptions', userId],
    queryFn: () => fetchSubscriptions(userId),
    staleTime: 30000,
  });

  const createMut = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', userId] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSubscription(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', userId] });
    },
  });

  return {
    subscriptions: query.data?.subscriptions || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createSubscription: createMut.mutateAsync,
    deleteSubscription: deleteMut.mutateAsync,
    refetch: query.refetch,
  };
}
