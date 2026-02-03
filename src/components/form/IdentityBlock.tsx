import { Box, TextField, MenuItem, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { POSITIONS, type ProspectFormData } from '../../types/prospect';

export function IdentityBlock() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProspectFormData>();

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        1. Identité
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Mieux vous connaître
      </Typography>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        <TextField
          label="Prénom"
          {...register('identity.firstName', { required: 'Le prénom est requis' })}
          error={!!errors.identity?.firstName}
          helperText={errors.identity?.firstName?.message}
          fullWidth
        />

        <TextField
          label="Nom"
          {...register('identity.lastName', { required: 'Le nom est requis' })}
          error={!!errors.identity?.lastName}
          helperText={errors.identity?.lastName?.message}
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          {...register('identity.email', {
            required: "L'email est requis",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Format email invalide',
            },
          })}
          error={!!errors.identity?.email}
          helperText={errors.identity?.email?.message}
          fullWidth
        />

        <TextField
          label="Téléphone"
          {...register('identity.phone', {
            pattern: {
              value: /^(\+33|0)[1-9](\d{2}){4}$/,
              message: 'Format téléphone invalide (ex: 0612345678)',
            },
          })}
          error={!!errors.identity?.phone}
          helperText={errors.identity?.phone?.message}
          fullWidth
        />

        <TextField
          label="Entreprise"
          {...register('identity.company', { required: "L'entreprise est requise" })}
          error={!!errors.identity?.company}
          helperText={errors.identity?.company?.message}
          fullWidth
        />

        <TextField
          select
          label="Poste"
          defaultValue=""
          {...register('identity.position', { required: 'Le poste est requis' })}
          error={!!errors.identity?.position}
          helperText={errors.identity?.position?.message}
          fullWidth
        >
          {POSITIONS.map((position) => (
            <MenuItem key={position} value={position}>
              {position}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>
  );
}
