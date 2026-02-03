import { useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { PROSPECT_STATUSES, type Prospect, type ProspectStatus, type ProspectsByStatus } from '../../types/prospect';
import { useProspects } from '../../hooks/useProspects';
import { KanbanColumn } from './KanbanColumn';
import { ProspectCard } from './ProspectCard';
import { ProspectDetailModal } from './ProspectDetailModal';

export function KanbanBoard() {
  const { prospects, isLoading, error, updateStatus, deleteProspect } = useProspects();
  const [activeProspect, setActiveProspect] = useState<Prospect | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProspect(null);
  };

  const handleDeleteProspect = (id: string) => {
    deleteProspect(id);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const prospectsByStatus = useMemo(() => {
    const grouped: ProspectsByStatus = {} as ProspectsByStatus;
    PROSPECT_STATUSES.forEach((status) => {
      grouped[status] = [];
    });
    prospects.forEach((prospect) => {
      if (grouped[prospect.status]) {
        grouped[prospect.status].push(prospect);
      }
    });
    return grouped;
  }, [prospects]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const prospect = prospects.find((p) => p.id === active.id);
    if (prospect) {
      setActiveProspect(prospect);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: handle drag over for visual feedback
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProspect(null);

    if (!over) return;

    const prospectId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column (status)
    const isDroppedOnColumn = PROSPECT_STATUSES.includes(overId as ProspectStatus);

    if (isDroppedOnColumn) {
      const newStatus = overId as ProspectStatus;
      const prospect = prospects.find((p) => p.id === prospectId);

      if (prospect && prospect.status !== newStatus) {
        updateStatus({ id: prospectId, status: newStatus });
      }
    } else {
      // Dropped on another card - find the column of that card
      const targetProspect = prospects.find((p) => p.id === overId);
      if (targetProspect) {
        const newStatus = targetProspect.status;
        const prospect = prospects.find((p) => p.id === prospectId);

        if (prospect && prospect.status !== newStatus) {
          updateStatus({ id: prospectId, status: newStatus });
        }
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Erreur lors du chargement des prospects. Vérifiez que le serveur JSON est démarré.
      </Alert>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
          px: 1,
        }}
      >
        {PROSPECT_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            prospects={prospectsByStatus[status] || []}
            onOpenDetail={handleOpenDetail}
          />
        ))}
      </Box>

      <DragOverlay>
        {activeProspect ? <ProspectCard prospect={activeProspect} /> : null}
      </DragOverlay>

      <ProspectDetailModal
        prospect={selectedProspect}
        open={isModalOpen}
        onClose={handleCloseModal}
        onDelete={handleDeleteProspect}
      />
    </DndContext>
  );
}
