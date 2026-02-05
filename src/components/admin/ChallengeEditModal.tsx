import { useState } from 'react';
import { Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { MATURITY_LEVELS } from '../../types/prospect';

interface ChallengeEditModalProps {
  challenge: string | null;
  open: boolean;
  onClose: () => void;
}

const MAX_LENGTH = 2000;

export function ChallengeEditModal({ challenge, open, onClose }: ChallengeEditModalProps) {
  const { control, watch, getValues, setValue } = useFormContext();
  const [selectedTab, setSelectedTab] = useState(0);

  if (!challenge) return null;

  const constatValue = watch(`templates.${challenge}.constat`) || '';
  const solutionValue = watch(`templates.${challenge}.solution`) || '';

  // Watch the entire nextSteps object, then access properties directly
  // This avoids issues with special characters (apostrophes) in key names
  const nextStepsObject = watch(`templates.${challenge}.nextSteps`) || {};
  const nextStepsValues = MATURITY_LEVELS.map(level => nextStepsObject[level] || '');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ color: 'primary.main', fontWeight: 600 }}>
        {challenge}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {/* Constat Field */}
          <Controller
            name={`templates.${challenge}.constat`}
            control={control}
            defaultValue=""
            render={({ field }) => (
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
            )}
          />

          {/* Solution Field */}
          <Controller
            name={`templates.${challenge}.solution`}
            control={control}
            defaultValue=""
            render={({ field }) => (
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
            )}
          />

          {/* Next Steps by Maturity Level */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
              Prochaines étapes (par niveau de maturité)
            </Typography>
            <Tabs
              value={selectedTab}
              onChange={(_, newValue) => setSelectedTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 2,
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minHeight: 48,
                },
                '& .Mui-selected': {
                  color: 'secondary.main',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'secondary.main',
                },
              }}
            >
              {MATURITY_LEVELS.map((level) => (
                <Tab key={level} label={level} />
              ))}
            </Tabs>
            {MATURITY_LEVELS.map((level, index) => (
              <Box key={level} hidden={selectedTab !== index} sx={{ pt: 2 }}>
                {selectedTab === index && (
                  <TextField
                    value={nextStepsValues[index]}
                    onChange={(e) => {
                      // Manually update the form value using setValue
                      // This avoids issues with special characters in key names
                      const currentNextSteps = getValues(`templates.${challenge}.nextSteps`) || {};
                      currentNextSteps[level] = e.target.value;
                      setValue(`templates.${challenge}.nextSteps`, currentNextSteps, { shouldDirty: true });
                    }}
                    label={`Prochaines étapes pour "${level}"`}
                    multiline
                    rows={6}
                    fullWidth
                    placeholder="Décrivez les prochaines étapes recommandées pour ce niveau de maturité..."
                    helperText={`${nextStepsValues[index].length}/${MAX_LENGTH} caractères`}
                    error={nextStepsValues[index].length > MAX_LENGTH}
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
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} variant="contained" color="secondary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
