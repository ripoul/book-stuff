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
import { ApiError } from '../api/errors.ts'
import { updatePlace } from '../api/places.ts'
import { useAuth } from '../context/useAuth.ts'
import type { Place } from '../types/booking.ts'

type Props = {
  place: Place | null
  onClose: () => void
  onSaved: () => void
}

export function EditPlaceDialog({ place, onClose, onSaved }: Props) {
  const open = place !== null
  const { accessToken, refreshSession } = useAuth()
  const [name, setName] = useState(() => place?.name ?? '')
  const [publicPlace, setPublicPlace] = useState(() => place?.public ?? false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    if (!loading) onClose()
  }

  const submit = async (token: string, target: Place) => {
    await updatePlace(
      target.id,
      { name: name.trim(), public: publicPlace },
      token,
    )
  }

  const handleSubmit = async () => {
    setError(null)
    if (!place) return
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    const token = accessToken
    if (!token) {
      setError('You must be signed in to edit a place.')
      return
    }
    setLoading(true)
    try {
      await submit(token, place)
      onSaved()
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const next = await refreshSession()
        if (next) {
          try {
            await submit(next, place)
            onSaved()
            onClose()
            return
          } catch (e2) {
            setError(e2 instanceof Error ? e2.message : 'Could not save place.')
            return
          }
        }
        setError('Session expired. Please sign in again.')
        return
      }
      setError(err instanceof Error ? err.message : 'Could not save place.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit place</DialogTitle>
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
