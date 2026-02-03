import { Box, Typography, FormControlLabel, Checkbox, Paper } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import type { ProspectFormData } from '../../types/prospect';

export function CTABlock() {
  const { control } = useFormContext<ProspectFormData>();

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        5. Prochaine Étape
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Transformez votre essai en opportunité
      </Typography>

      <Controller
        name="cta.wantsDiagnostic"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: 2,
              borderColor: field.value ? 'secondary.main' : 'divider',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              bgcolor: field.value ? 'rgba(103, 224, 131, 0.08)' : 'background.paper',
              '&:hover': {
                borderColor: 'secondary.main',
                bgcolor: field.value ? 'rgba(103, 224, 131, 0.12)' : 'action.hover',
              },
            }}
            onClick={() => field.onChange(!field.value)}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  sx={{
                    color: 'secondary.main',
                    '&.Mui-checked': {
                      color: 'secondary.main',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Souhaitez-vous un diagnostic de maturité GRATUIT (30 min) avec nos experts ?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Un expert Forge IT vous accompagne pour cadrer votre projet et identifier les
                    quick wins.
                  </Typography>
                </Box>
              }
              sx={{ m: 0, alignItems: 'flex-start' }}
            />
          </Paper>
        )}
      />

      <Controller
        name="cta.wantsTrial"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mt: 2,
              border: 2,
              borderColor: field.value ? 'secondary.main' : 'divider',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              bgcolor: field.value ? 'rgba(103, 224, 131, 0.08)' : 'background.paper',
              '&:hover': {
                borderColor: 'secondary.main',
                bgcolor: field.value ? 'rgba(103, 224, 131, 0.12)' : 'action.hover',
              },
            }}
            onClick={() => field.onChange(!field.value)}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  sx={{
                    color: 'secondary.main',
                    '&.Mui-checked': {
                      color: 'secondary.main',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Souhaitez-vous une version d'essai d'Astrolabe ?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Testez Astrolabe gratuitement et découvrez comment il peut transformer votre
                    plateforme d'engineering.
                  </Typography>
                </Box>
              }
              sx={{ m: 0, alignItems: 'flex-start' }}
            />
          </Paper>
        )}
      />
    </Box>
  );
}
