import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prospectsApi } from '../api/prospects';
import type { ProspectFormData, ProspectStatus } from '../types/prospect';

const QUERY_KEY = ['prospects'];

interface UseProspectsOptions {
  enabled?: boolean;
}

export function useProspects(options: UseProspectsOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const {
    data: prospects = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: prospectsApi.getAll,
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: (data: ProspectFormData) => prospectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProspectStatus }) =>
      prospectsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => prospectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    prospects,
    isLoading,
    error,
    refetch,
    createProspect: createMutation.mutate,
    createProspectAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    deleteProspect: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
