import { useRef } from 'react';
import { Box, Card, CardContent, Typography, Chip, IconButton } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import EventNoteIcon from '@mui/icons-material/EventNote';
import type { Prospect } from '../../types/prospect';

interface ProspectCardProps {
  prospect: Prospect;
  onOpenDetail?: (prospect: Prospect) => void;
}

export function ProspectCard({ prospect, onOpenDetail }: ProspectCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: prospect.id,
  });
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fullName = `${prospect.identity.firstName} ${prospect.identity.lastName}`;

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!dragStartPos.current) return;

    const dx = Math.abs(e.clientX - dragStartPos.current.x);
    const dy = Math.abs(e.clientY - dragStartPos.current.y);

    // Only trigger click if mouse hasn't moved more than 5px (not a drag)
    if (dx < 5 && dy < 5 && onOpenDetail) {
      onOpenDetail(prospect);
    }

    dragStartPos.current = null;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      sx={{
        cursor: isDragging ? 'grabbing' : 'pointer',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary' }}>
            {fullName}
          </Typography>
          {prospect.cta.wantsDiagnostic && (
            <IconButton size="small" color="secondary" sx={{ p: 0.5 }}>
              <EventNoteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {prospect.identity.company}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {prospect.techEcosystem.teamSize} devs
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            label={prospect.identity.position}
            size="small"
            sx={{
              bgcolor: prospect.identity.position === 'CTO' ? 'secondary.main' : 'primary.light',
              color: prospect.identity.position === 'CTO' ? 'primary.dark' : 'white',
              fontWeight: 500,
              fontSize: '0.7rem',
            }}
          />
          {prospect.techEcosystem.clouds.slice(0, 2).map((cloud) => (
            <Chip
              key={cloud}
              label={cloud}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
