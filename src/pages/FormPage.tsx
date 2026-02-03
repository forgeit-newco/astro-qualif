import { Box, Container, Typography, Paper, Alert, Snackbar } from '@mui/material';
import { useState } from 'react';
import { QualificationForm } from '../components/form/QualificationForm';
import { useProspects } from '../hooks/useProspects';
import type { ProspectFormData } from '../types/prospect';

export function FormPage() {
  const { createProspectAsync, isCreating } = useProspects({ enabled: false });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ProspectFormData) => {
    try {
      await createProspectAsync(data);
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          Sommes nous la bonne solution pour vous ?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Aidez nous à mieux vous connaitre pour répondre au mieux à vos besoins.
        </Typography>

        <Paper sx={{ p: 4 }}>
          <QualificationForm onSubmit={handleSubmit} isSubmitting={isCreating} />
        </Paper>

        <Snackbar
          open={success}
          autoHideDuration={4000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess(false)} sx={{ width: '100%' }}>
            Demande enregistrée avec succès ! Bienvenue chez Forge It.
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}
