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
import { createPlace } from '../api/places.ts'
import { useAuth } from '../context/useAuth.ts'

type Props = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function AddPlaceDialog({ open, onClose, onCreated }: Props) {
  const { accessToken, refreshSession } = useAuth()
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

  const submit = async (token: string) => {
    await createPlace({ name: name.trim(), public: publicPlace }, token)
  }

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    const token = accessToken
    if (!token) {
      setError('You must be signed in to add a place.')
      return
    }
    setLoading(true)
    try {
      await submit(token)
      onCreated()
      reset()
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const next = await refreshSession()
        if (next) {
          try {
            await submit(next)
            onCreated()
            reset()
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
