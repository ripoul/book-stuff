import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { createResource, updateResource } from '../api/resources.ts'
import { useAuth } from '../context/useAuth.ts'
import type { Resource } from '../types/booking.ts'

type Props = {
  open: boolean
  placeId: string
  resource: Resource | null
  onClose: () => void
  onSaved: () => void
}

export function ResourceFormDialog({
  open,
  placeId,
  resource,
  onClose,
  onSaved,
}: Props) {
  const { accessToken } = useAuth()
  const [name, setName] = useState(() => resource?.name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isEdit = resource !== null

  const handleClose = () => {
    if (!loading) onClose()
  }

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (!accessToken) {
      setError('You must be signed in.')
      return
    }
    setLoading(true)
    try {
      if (isEdit && resource) {
        await updateResource(resource.id, { name: name.trim() })
      } else {
        await createResource({ place: placeId, name: name.trim() })
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit resource' : 'Add resource'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
