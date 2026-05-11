import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import {
  createManagedInvitation,
  listManagedInvitations,
  patchManagedInvitation,
} from '../api/invitations.ts'
import { ApiError } from '../api/errors.ts'
import { getPlace, listPlaces } from '../api/places.ts'
import { useAuth } from '../context/useAuth.ts'
import type {
  InvitationStatus,
  ManagerInvitation,
  Paginated,
  Place,
} from '../types/booking.ts'

const ALL_STATUSES: InvitationStatus[] = [
  'pending',
  'accepted',
  'declined',
  'revoked',
]

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    s,
  )
}

export function PlaceInvitationsPage() {
  const { placeId: placeIdParam } = useParams<{ placeId: string }>()
  const navigate = useNavigate()
  const { accessToken, isAuthenticated } = useAuth()
  const placeId = placeIdParam && isUuid(placeIdParam) ? placeIdParam : null

  const [place, setPlace] = useState<Place | null>(null)
  const [managedPlaces, setManagedPlaces] = useState<Place[]>([])
  const [placeFilter, setPlaceFilter] = useState<string>(() => placeId ?? '')
  const [statusChecks, setStatusChecks] = useState<
    Partial<Record<InvitationStatus, boolean>>
  >({})
  const [rows, setRows] = useState<Paginated<ManagerInvitation> | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSaving, setInviteSaving] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const loadManagedPlaces = useCallback(async () => {
    try {
      const first = await listPlaces({
        limit: 100,
        offset: 0,
        managed_by_me: true,
      })
      setManagedPlaces(first.results)
    } catch {
      setManagedPlaces([])
    }
  }, [])

  const load = useCallback(async () => {
    if (!placeId) {
      setLoading(false)
      setError('Invalid place')
      return
    }
    void accessToken
    setLoading(true)
    setError(null)
    try {
      const p = await getPlace(placeId)
      setPlace(p)
      if (p.can_manage !== true) {
        setRows(null)
        setError('You do not manage this place.')
        setLoading(false)
        return
      }
      const picked = ALL_STATUSES.filter((s) => statusChecks[s])
      const statusArg = picked.length ? picked : undefined
      const pf = placeFilter.trim()
      const data = await listManagedInvitations({
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        ...(pf ? { place: pf } : {}),
        ...(statusArg ? { status: statusArg } : {}),
      })
      setRows(data)
    } catch (e) {
      setPlace(null)
      setRows(null)
      setError(e instanceof ApiError ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [placeId, accessToken, page, rowsPerPage, placeFilter, statusChecks])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    const t = window.setTimeout(() => {
      void loadManagedPlaces()
    }, 0)
    return () => window.clearTimeout(t)
  }, [isAuthenticated, loadManagedPlaces])

  useEffect(() => {
    if (!placeId) {
      return
    }
    const t = window.setTimeout(() => setPlaceFilter(placeId), 0)
    return () => window.clearTimeout(t)
  }, [placeId])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    const t = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(t)
  }, [isAuthenticated, load])

  useEffect(() => {
    if (place?.name) {
      document.title = `Invitations · ${place.name}`
    }
    return () => {
      document.title = 'Book stuff'
    }
  }, [place?.name])

  const toggleStatus = (s: InvitationStatus) => {
    setStatusChecks((prev) => ({ ...prev, [s]: !prev[s] }))
    setPage(0)
  }

  const onPlaceFilterChange = (e: SelectChangeEvent<string>) => {
    setPlaceFilter(e.target.value)
    setPage(0)
  }

  const runRevoke = async (id: string) => {
    setActionId(id)
    setError(null)
    try {
      await patchManagedInvitation(id, { status: 'revoked' })
      await load()
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Update failed',
      )
    } finally {
      setActionId(null)
    }
  }

  const runReinvite = async (id: string) => {
    setActionId(id)
    setError(null)
    try {
      await patchManagedInvitation(id, { status: 'pending' })
      await load()
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Update failed',
      )
    } finally {
      setActionId(null)
    }
  }

  const submitInvite = async () => {
    if (!placeId) return
    setInviteError(null)
    setInviteSaving(true)
    try {
      await createManagedInvitation({
        place: placeId,
        email: inviteEmail,
      })
      setDialogOpen(false)
      setInviteEmail('')
      await load()
    } catch (e) {
      setInviteError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Could not create invitation',
      )
    } finally {
      setInviteSaving(false)
    }
  }

  if (!placeId) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">Invalid place.</Alert>
      </Container>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button
        component={RouterLink}
        to={`/places/${placeId}`}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Place
      </Button>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700 }}
      >
        Invitations
      </Typography>
      {place ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage invitations for {place.name}.
        </Typography>
      ) : null}
      {error && !place ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {loading && !place ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}
      {place && place.can_manage === true ? (
        <>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <Paper sx={{ mb: 2 }}>
            <Toolbar
              sx={{ flexWrap: 'wrap', gap: 2, py: 2, alignItems: 'flex-start' }}
            >
              <Typography
                variant="subtitle1"
                sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}
              >
                Filters
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setInviteError(null)
                  setInviteEmail('')
                  setDialogOpen(true)
                }}
                disabled={!accessToken}
              >
                Invite by email
              </Button>
            </Toolbar>
            <Box sx={{ px: 2, pb: 2 }}>
              <Stack
                spacing={2}
                direction={{ xs: 'column', md: 'row' }}
                sx={{ alignItems: { md: 'flex-start' } }}
              >
                <FormControl size="small" sx={{ minWidth: 240 }}>
                  <InputLabel id="mgr-place-filter">Place</InputLabel>
                  <Select
                    labelId="mgr-place-filter"
                    label="Place"
                    value={placeFilter}
                    onChange={onPlaceFilterChange}
                  >
                    <MenuItem value="">
                      <em>All places you manage</em>
                    </MenuItem>
                    {managedPlaces.map((mp) => (
                      <MenuItem key={mp.id} value={mp.id}>
                        {mp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box>
                  <FormLabel component="legend">Status (any of)</FormLabel>
                  <FormGroup row>
                    {ALL_STATUSES.map((s) => (
                      <FormControlLabel
                        key={s}
                        control={
                          <Checkbox
                            checked={Boolean(statusChecks[s])}
                            onChange={() => toggleStatus(s)}
                            size="small"
                          />
                        }
                        label={s}
                      />
                    ))}
                  </FormGroup>
                </Box>
              </Stack>
            </Box>
          </Paper>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Place</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Updated</TableCell>
                  <TableCell align="right" width={200}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && !rows ? (
                  <TableRow>
                    <TableCell colSpan={5}>Loading…</TableCell>
                  </TableRow>
                ) : (rows?.results ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 2 }}
                      >
                        No invitations match.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  (rows?.results ?? []).map((row) => {
                    const pname =
                      managedPlaces.find((mp) => mp.id === row.place)?.name ??
                      row.place
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>{pname}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={row.status}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatDate(row.updated_at)}
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            useFlexGap
                            sx={{
                              justifyContent: 'flex-end',
                              flexWrap: 'wrap',
                            }}
                          >
                            {row.status === 'revoked' ? (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                disabled={!accessToken || actionId === row.id}
                                onClick={() => void runReinvite(row.id)}
                              >
                                Invite again
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                disabled={actionId === row.id}
                                onClick={() => void runRevoke(row.id)}
                              >
                                Revoke
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              rowsPerPageOptions={[5, 10, 25, 50]}
              count={rows?.count ?? 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
            />
          </TableContainer>
        </>
      ) : place && place.can_manage !== true ? (
        <Alert severity="warning">You do not manage this place.</Alert>
      ) : null}

      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (!inviteSaving) {
            setDialogOpen(false)
            setInviteEmail('')
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Invite by email</DialogTitle>
        <DialogContent>
          {inviteError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {inviteError}
            </Alert>
          ) : null}
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={inviteSaving}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={inviteSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void submitInvite()}
            disabled={inviteSaving || !inviteEmail.trim()}
          >
            {inviteSaving ? 'Sending…' : 'Send invitation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
