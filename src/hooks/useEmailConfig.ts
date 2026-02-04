import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailConfigApi, type EmailTemplateConfig, type ChallengeTemplate } from '../api/emailConfig';

export function useEmailConfig() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<EmailTemplateConfig>({
    queryKey: ['emailConfig'],
    queryFn: emailConfigApi.get,
  });

  const updateMutation = useMutation({
    mutationFn: (templates: Record<string, ChallengeTemplate>) =>
      emailConfigApi.update(templates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailConfig'] });
    },
  });

  return {
    config: data,
    isLoading,
    error,
    updateConfig: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
