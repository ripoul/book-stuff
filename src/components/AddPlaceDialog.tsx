import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { createPlace } from '../api/places.ts'
import { useAuth } from '../context/useAuth.ts'

type Props = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function AddPlaceDialog({ open, onClose, onCreated }: Props) {
  const { accessToken } = useAuth()
  const [name, setName] = useState('')
  const [publicPlace, setPublicPlace] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setName('')
    setPublicPlace(false)
    setError(null)
  }

  const handleClose = () => {
    if (!loading) {
      reset()
      onClose()
    }
  }

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (!accessToken) {
      setError('You must be signed in to add a place.')
      return
    }
    setLoading(true)
    try {
      await createPlace({ name: name.trim(), public: publicPlace })
      onCreated()
      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save place.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add place</DialogTitle>
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
          <FormControlLabel
            control={
              <Switch
                checked={publicPlace}
                onChange={(e) => setPublicPlace(e.target.checked)}
              />
            }
            label="Public (visible without sign-in)"
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
