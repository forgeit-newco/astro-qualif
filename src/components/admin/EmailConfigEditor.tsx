import { useState, useEffect } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import SaveIcon from '@mui/icons-material/Save';
import { useEmailConfig } from '../../hooks/useEmailConfig';
import { ChallengeTemplateCard } from './ChallengeTemplateCard';
import { CHALLENGES } from '../../types/prospect';
import type { ChallengeTemplate } from '../../api/emailConfig';

export function EmailConfigEditor() {
  const { config, isLoading, updateConfig, isUpdating } = useEmailConfig();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm({
    defaultValues: {
      templates: {},
    },
  });

  // Initialize form with config data
  useEffect(() => {
    if (config?.templates) {
      methods.reset({ templates: config.templates });
    }
  }, [config, methods]);

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await updateConfig(data.templates as Record<string, ChallengeTemplate>);
      setSuccess(true);
      setError(null);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError('Erreur lors de la sauvegarde de la configuration');
      setSuccess(false);
    }
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>
            Configuration des Emails Personnalisés
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Définissez le contenu des blocs "Le constat" et "Ce qu'Astrolabe apporte" qui seront
            insérés dans l'email de bienvenue en fonction de l'enjeu prioritaire sélectionné par le
            prospect.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Note : Les enjeux personnalisés (commençant par "Autre:") ne recevront pas de contenu
            personnalisé automatique.
          </Alert>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Configuration sauvegardée avec succès !
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          {CHALLENGES.map((challenge) => (
            <ChallengeTemplateCard key={challenge} challenge={challenge} />
          ))}
        </Box>

        <Paper
          elevation={3}
          sx={{
            position: 'sticky',
            bottom: 0,
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </Paper>
      </Box>
    </FormProvider>
  );
}
