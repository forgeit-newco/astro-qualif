import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { KanbanBoard } from '../components/kanban/KanbanBoard';

export function KanbanPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ py: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Pipeline Prospects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Suivez et gérez vos prospects qualifiés
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/form')}
          >
            Nouveau Prospect
          </Button>
        </Box>

        <KanbanBoard />
      </Box>
    </Container>
  );
}
