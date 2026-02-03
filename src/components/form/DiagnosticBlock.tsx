import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Paper,
} from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { MATURITY_LEVELS, type ProspectFormData } from '../../types/prospect';

const MATURITY_DESCRIPTIONS: Record<string, string> = {
  Industrialisation: 'Imposer des standards / Golden Paths',
  Expertise: "Maintenance d'un Backstage existant",
  Reconciliation: 'Souffrance liée à la fragmentation des outils',
  'Autre/Ne sait pas': "Besoin d'aide pour évaluer la maturité",
};

export function DiagnosticBlock() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProspectFormData>();

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        3. Diagnostic
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Où en êtes-vous sur l'enjeu de Platform Engineering ?
      </Typography>

      <Controller
        name="diagnostic.maturityLevel"
        control={control}
        rules={{ required: 'Sélectionnez un niveau de maturité' }}
        render={({ field }) => (
          <FormControl error={!!errors.diagnostic?.maturityLevel} fullWidth>
            <FormLabel>Niveau de maturité</FormLabel>
            <RadioGroup {...field}>
              {MATURITY_LEVELS.map((level) => (
                <Paper
                  key={level}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: 1,
                    borderColor: field.value === level ? 'secondary.main' : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => field.onChange(level)}
                >
                  <FormControlLabel
                    value={level}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {level}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {MATURITY_DESCRIPTIONS[level]}
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>
              ))}
            </RadioGroup>
            {errors.diagnostic?.maturityLevel && (
              <FormHelperText>{errors.diagnostic.maturityLevel.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    </Box>
  );
}
