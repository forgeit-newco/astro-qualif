import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Paper,
  TextField,
} from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { CHALLENGES, type ProspectFormData, type Challenge } from '../../types/prospect';

const OTHER_PREFIX = 'Autre: ';

const CHALLENGE_DESCRIPTIONS: Record<string, string> = {
  'Onboarding/Delivery': 'Accélérer l\'intégration des nouveaux développeurs et la livraison',
  'Conformite/Scoring': 'Assurer la conformité, la sécurité, la compliance ou la qualité du code',
  'FinOps': 'Optimiser et piloter les coûts cloud',
};

export function ChallengesBlock() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProspectFormData>();

  const [otherEnabled, setOtherEnabled] = useState(false);
  const [otherValue, setOtherValue] = useState('');

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        4. Enjeux Prioritaires
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Quel défi cette année ?
      </Typography>

      <Controller
        name="challenges.priorities"
        control={control}
        defaultValue={[]}
        rules={{ validate: (v) => v.length > 0 || 'Sélectionnez au moins un enjeu' }}
        render={({ field }) => (
          <FormControl error={!!errors.challenges?.priorities} fullWidth>
            <FormLabel>Sélectionnez vos priorités</FormLabel>
            <FormGroup>
              {CHALLENGES.map((challenge) => (
                <Paper
                  key={challenge}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: 1,
                    borderColor: field.value.includes(challenge) ? 'secondary.main' : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => {
                    if (field.value.includes(challenge)) {
                      field.onChange(field.value.filter((v: Challenge) => v !== challenge));
                    } else {
                      field.onChange([...field.value, challenge]);
                    }
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value.includes(challenge)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...field.value, challenge]);
                          } else {
                            field.onChange(field.value.filter((v: Challenge) => v !== challenge));
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {challenge}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {CHALLENGE_DESCRIPTIONS[challenge]}
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>
              ))}

              {/* Option Autre */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 1,
                  border: 1,
                  borderColor: otherEnabled ? 'secondary.main' : 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'secondary.main',
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  // Prevent click when clicking on the TextField
                  if ((e.target as HTMLElement).tagName === 'INPUT') {
                    return;
                  }
                  const newEnabled = !otherEnabled;
                  setOtherEnabled(newEnabled);
                  if (!newEnabled) {
                    field.onChange(field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX)));
                    setOtherValue('');
                  }
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={otherEnabled}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = e.target.checked;
                        setOtherEnabled(checked);
                        if (!checked) {
                          field.onChange(field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX)));
                          setOtherValue('');
                        }
                      }}
                    />
                  }
                  label={
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        Autre
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: otherEnabled ? 1.5 : 0 }}>
                        Précisez votre enjeu prioritaire
                      </Typography>
                      {otherEnabled && (
                        <TextField
                          size="small"
                          placeholder="Décrivez votre enjeu..."
                          value={otherValue}
                          fullWidth
                          multiline
                          rows={2}
                          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newValue = e.target.value;
                            setOtherValue(newValue);
                            const filtered = field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX));
                            if (newValue.trim()) {
                              field.onChange([...filtered, `${OTHER_PREFIX}${newValue}`]);
                            } else {
                              field.onChange(filtered);
                            }
                          }}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  }
                  sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                />
              </Paper>
            </FormGroup>
            {errors.challenges?.priorities && (
              <FormHelperText>{errors.challenges.priorities.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    </Box>
  );
}
