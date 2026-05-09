import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper
        elevation={0}
        sx={{ p: { xs: 3, md: 5 }, bgcolor: 'background.paper' }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Book stuff
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          A simple way to organise places and manage reservations for the
          resources you share—whether it is a room, equipment, or anything
          people need to book.
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: 2 }}>
          Keep an overview of what is available, who can see it, and spend less
          time juggling messages and spreadsheets. Sign in to manage your own
          spaces, or explore what is already public.
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: 2 }}
        >
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/places"
          >
            View places
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/login"
          >
            Sign in
          </Button>
          <Button
            variant="text"
            size="large"
            component={RouterLink}
            to="/signup"
          >
            Create account
          </Button>
        </Stack>
      </Paper>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Less admin, fewer double bookings, clearer availability.
        </Typography>
      </Box>
    </Container>
  )
}
