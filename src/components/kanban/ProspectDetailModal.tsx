import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import CloudIcon from '@mui/icons-material/Cloud';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BuildIcon from '@mui/icons-material/Build';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import FlagIcon from '@mui/icons-material/Flag';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ScienceIcon from '@mui/icons-material/Science';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Prospect } from '../../types/prospect';
import { statusColors } from '../../theme/astrolabeTheme';

interface ProspectDetailModalProps {
  prospect: Prospect | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function ProspectDetailModal({ prospect, open, onClose, onDelete }: ProspectDetailModalProps) {
  if (!prospect) return null;

  const fullName = `${prospect.identity.firstName} ${prospect.identity.lastName}`;
  const statusColor = statusColors[prospect.status] || statusColors.Nouveau;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(prospect.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {fullName}
          </Typography>
          <Chip
            label={prospect.status}
            size="small"
            sx={{
              bgcolor: statusColor,
              color: 'white',
              fontWeight: 500,
            }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Section Identité */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary.main" fontWeight={600} sx={{ mb: 1.5 }}>
            Identité
          </Typography>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">{prospect.identity.company}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">{prospect.identity.position}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">{prospect.identity.email}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">{prospect.identity.phone}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Section Écosystème Tech */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary.main" fontWeight={600} sx={{ mb: 1.5 }}>
            Écosystème Tech
          </Typography>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">Équipe : {prospect.techEcosystem.teamSize} développeurs</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <BuildIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  Forges :
                </Typography>
                {prospect.techEcosystem.forges.map((forge) => (
                  <Chip key={forge} label={forge} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CloudIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  Cloud :
                </Typography>
                {prospect.techEcosystem.clouds.map((cloud) => (
                  <Chip key={cloud} label={cloud} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <RocketLaunchIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  Déploiement :
                </Typography>
                {prospect.techEcosystem.deployments.map((deployment) => (
                  <Chip key={deployment} label={deployment} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <ConfirmationNumberIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  Gestion de tickets :
                </Typography>
                {prospect.techEcosystem.ticketManagers.map((ticketManager) => (
                  <Chip key={ticketManager} label={ticketManager} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <MonitorHeartIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  Monitoring :
                </Typography>
                {prospect.techEcosystem.monitoringTools.map((monitoringTool) => (
                  <Chip key={monitoringTool} label={monitoringTool} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Section Diagnostic */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary.main" fontWeight={600} sx={{ mb: 1.5 }}>
            Diagnostic Platform Engineering
          </Typography>
          <Chip
            label={prospect.diagnostic.maturityLevel}
            sx={{
              bgcolor: 'primary.light',
              color: 'white',
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Section Enjeux */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary.main" fontWeight={600} sx={{ mb: 1.5 }}>
            Enjeux Prioritaires
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <FlagIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
            <Chip
              label={prospect.challenges.priorities}
              size="small"
              sx={{
                bgcolor: 'secondary.main',
                color: 'primary.dark',
                fontWeight: 500,
              }}
            />
          </Box>
        </Box>

        {/* Section CTA */}
        {(prospect.cta.wantsDiagnostic || prospect.cta.wantsTrial) && (
          <>
            <Divider sx={{ my: 2 }} />
            {prospect.cta.wantsDiagnostic && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1, mb: prospect.cta.wantsTrial ? 1 : 0 }}>
                <EventNoteIcon sx={{ color: 'secondary.main' }} />
                <Typography variant="body2" fontWeight={500}>
                  Demande de diagnostic 30 min
                </Typography>
              </Box>
            )}
            {prospect.cta.wantsTrial && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                <ScienceIcon sx={{ color: 'secondary.main' }} />
                <Typography variant="body2" fontWeight={500}>
                  Demande de version d'essai d'Astrolabe
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Dates */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Créé le {new Date(prospect.createdAt).toLocaleDateString('fr-FR')} • Mis à jour le{' '}
            {new Date(prospect.updatedAt).toLocaleDateString('fr-FR')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {onDelete && (
          <Button
            onClick={handleDelete}
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ mr: 'auto' }}
          >
            Supprimer
          </Button>
        )}
        <Button onClick={onClose} variant="contained" color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
