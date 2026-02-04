import { Box, Container, Typography, Paper, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useState } from 'react';
import { QualificationForm } from '../components/form/QualificationForm';
import { useProspects } from '../hooks/useProspects';
import type { ProspectFormData } from '../types/prospect';

export function FormPage() {
  const { createProspectAsync, isCreating } = useProspects({ enabled: false });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<ProspectFormData | null>(null);

  const handleSubmit = async (data: ProspectFormData) => {
    try {
      await createProspectAsync(data);
      setSubmittedData(data);
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError('Oops une erreur s\'est glissée dans le processus');
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

        <Dialog
          open={success}
          onClose={() => setSuccess(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'primary.main', fontWeight: 600 }}>
            Bienvenue {submittedData?.identity.firstName} chez Forge It
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Merci pour votre sollicitation
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Un email vous a été envoyé avec les prochaines étapes.
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Pensez à vérifier votre dossier spam si vous ne recevez pas l'email dans les prochaines minutes.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setSuccess(false)}
              variant="contained"
              color="secondary"
              fullWidth
            >
              Fermer
            </Button>
          </DialogActions>
        </Dialog>

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
