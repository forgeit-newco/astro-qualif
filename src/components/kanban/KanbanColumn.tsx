import { Box, Paper, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Prospect, ProspectStatus } from '../../types/prospect';
import { ProspectCard } from './ProspectCard';
import { statusColors } from '../../theme/astrolabeTheme';

interface KanbanColumnProps {
  status: ProspectStatus;
  prospects: Prospect[];
  onOpenDetail: (prospect: Prospect) => void;
}

export function KanbanColumn({ status, prospects, onOpenDetail }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const color = statusColors[status] || statusColors.Nouveau;

  return (
    <Paper
      ref={setNodeRef}
      elevation={0}
      sx={{
        width: 280,
        minWidth: 280,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isOver ? 'action.hover' : 'background.default',
        borderRadius: 2,
        border: 1,
        borderColor: isOver ? 'secondary.main' : 'divider',
        transition: 'all 0.2s',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: color,
          }}
        />
        <Typography variant="subtitle1" fontWeight={600}>
          {status}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            ml: 'auto',
            bgcolor: 'action.selected',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            fontWeight: 500,
          }}
        >
          {prospects.length}
        </Typography>
      </Box>

      {/* Cards */}
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <SortableContext items={prospects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {prospects.map((prospect) => (
            <ProspectCard key={prospect.id} prospect={prospect} onOpenDetail={onOpenDetail} />
          ))}
        </SortableContext>

        {prospects.length === 0 && (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              color: 'text.disabled',
              border: 2,
              borderStyle: 'dashed',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography variant="body2">Déposez un prospect ici</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
