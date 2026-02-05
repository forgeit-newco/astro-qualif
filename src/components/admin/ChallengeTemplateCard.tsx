import { Box, TextField, Typography, Paper } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface ChallengeTemplateCardProps {
  challenge: string;
}

const MAX_LENGTH = 2000;

export function ChallengeTemplateCard({ challenge }: ChallengeTemplateCardProps) {
  const {
    control,
    watch,
  } = useFormContext();

  const constatValue = watch(`templates.${challenge}.constat`) || '';
  const solutionValue = watch(`templates.${challenge}.solution`) || '';
  const nextStepsValue = watch(`templates.${challenge}.nextSteps`) || '';

  return (
    <Paper
      sx={{
        p: 3,
        mb: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: 'primary.main',
          fontWeight: 600,
          mb: 2,
        }}
      >
        {challenge}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Constat Field */}
        <Controller
          name={`templates.${challenge}.constat`}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Box>
              <TextField
                {...field}
                label="Le constat"
                multiline
                rows={4}
                fullWidth
                placeholder="Décrivez le problème ou l'observation pour ce défi..."
                helperText={`${constatValue.length}/${MAX_LENGTH} caractères`}
                error={constatValue.length > MAX_LENGTH}
                inputProps={{ maxLength: MAX_LENGTH }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'secondary.main',
                    },
                  },
                }}
              />
            </Box>
          )}
        />

        {/* Solution Field */}
        <Controller
          name={`templates.${challenge}.solution`}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Box>
              <TextField
                {...field}
                label="Ce qu'Astrolabe apporte"
                multiline
                rows={4}
                fullWidth
                placeholder="Décrivez la solution apportée par Astrolabe..."
                helperText={`${solutionValue.length}/${MAX_LENGTH} caractères`}
                error={solutionValue.length > MAX_LENGTH}
                inputProps={{ maxLength: MAX_LENGTH }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'secondary.main',
                    },
                  },
                }}
              />
            </Box>
          )}
        />

        {/* Next Steps Field */}
        <Controller
          name={`templates.${challenge}.nextSteps`}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Box>
              <TextField
                {...field}
                label="Prochaines étapes"
                multiline
                rows={4}
                fullWidth
                placeholder="Décrivez les prochaines étapes recommandées..."
                helperText={`${nextStepsValue.length}/${MAX_LENGTH} caractères`}
                error={nextStepsValue.length > MAX_LENGTH}
                inputProps={{ maxLength: MAX_LENGTH }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'secondary.main',
                    },
                  },
                }}
              />
            </Box>
          )}
        />
      </Box>
    </Paper>
  );
}
