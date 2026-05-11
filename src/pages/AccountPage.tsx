import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { getCurrentAccount, updateCurrentAccount } from '../api/account.ts'
import { ApiError } from '../api/errors.ts'
import { useAuth } from '../context/useAuth.ts'

export function AccountPage() {
  const { isAuthenticated, setAccountEmail } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    let cancelled = false
    void getCurrentAccount()
      .then((p) => {
        if (cancelled) return
        setLoadError(null)
        setFirstName(p.first_name ?? '')
        setLastName(p.last_name ?? '')
        setEmail(p.email ?? '')
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLoadError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Could not load profile',
        )
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setSuccess(false)
    setSaving(true)
    try {
      const updated = await updateCurrentAccount({
        email,
        first_name: firstName,
        last_name: lastName,
      })
      setAccountEmail(updated.email)
      setEmail(updated.email)
      setFirstName(updated.first_name ?? '')
      setLastName(updated.last_name ?? '')
      setSuccess(true)
    } catch (err: unknown) {
      setSaveError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Update failed',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Update your name and email for this account.
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          <Link
            component={RouterLink}
            to="/account/invitations"
            underline="hover"
          >
            View invitations
          </Link>
        </Typography>
        {loadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadError}
          </Alert>
        )}
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Changes saved.
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="First name"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              fullWidth
              disabled={loading || Boolean(loadError)}
            />
            <TextField
              label="Last name"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              fullWidth
              disabled={loading || Boolean(loadError)}
            />
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              disabled={loading || Boolean(loadError)}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving || loading || Boolean(loadError)}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}
