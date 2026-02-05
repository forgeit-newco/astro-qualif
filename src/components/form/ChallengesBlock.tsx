import React, { useState } from 'react';
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
  TextField,
} from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { CHALLENGES, type ProspectFormData } from '../../types/prospect';

const OTHER_PREFIX = 'Autre: ';

const CHALLENGE_DESCRIPTIONS: Record<string, string> = {
  'Productivité & Delivery': 'Nos devs passent trop de temps à chercher de l\'info (Docs, APIs, Owners)',
  'Onboarding & Rétention': 'La montée en compétences des nouveaux arrivants est longue et perte de connaissance en cas de départ',
  'Qualité & Conformité': 'On n\'a peu de visibilité sur la santé réelle de nos projets (Sécu, Qualité, Tests)',
  'Standardisation': 'Chaque équipe fait à sa façon, difficile d\'imposer des pratiques communes',
  'Visibilité sur les releases': 'Difficultés à tracer ce qui est déployé, par qui, où et depuis quand',
  'Maîtrise des coûts cloud': 'Nos budgets infra explosent sans visibilité sur l\'imputation des différents projets',
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
        rules={{ required: 'Sélectionnez un enjeu' }}
        render={({ field }) => (
          <FormControl error={!!errors.challenges?.priorities} fullWidth>
            <FormLabel>Sélectionnez votre priorité</FormLabel>
            <RadioGroup {...field}>
              {CHALLENGES.map((challenge) => (
                <Paper
                  key={challenge}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: 1,
                    borderColor: field.value === challenge ? 'secondary.main' : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => {
                    field.onChange(challenge);
                    setOtherEnabled(false);
                    setOtherValue('');
                  }}
                >
                  <FormControlLabel
                    value={challenge}
                    control={<Radio />}
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
                  setOtherEnabled(true);
                  if (otherValue.trim()) {
                    field.onChange(`${OTHER_PREFIX}${otherValue}`);
                  }
                }}
              >
                <FormControlLabel
                  value={field.value?.startsWith(OTHER_PREFIX) ? field.value : ''}
                  control={
                    <Radio
                      checked={otherEnabled}
                      onChange={() => {
                        setOtherEnabled(true);
                        if (otherValue.trim()) {
                          field.onChange(`${OTHER_PREFIX}${otherValue}`);
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
                            if (newValue.trim()) {
                              field.onChange(`${OTHER_PREFIX}${newValue}`);
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
            </RadioGroup>
            {errors.challenges?.priorities && (
              <FormHelperText>{errors.challenges.priorities.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    </Box>
  );
}
