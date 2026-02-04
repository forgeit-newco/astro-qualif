import { Container, Box } from '@mui/material';
import { EmailConfigEditor } from '../components/admin/EmailConfigEditor';

export function EmailConfigPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <EmailConfigEditor />
      </Box>
    </Container>
  );
}
