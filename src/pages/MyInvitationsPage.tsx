import {
  Alert,
  Button,
  Chip,
  Container,
  FormControl,
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
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/errors.ts'
import { listMyInvitations, patchMyInvitation } from '../api/invitations.ts'
import { useAuth } from '../context/useAuth.ts'
import type {
  InvitationStatus,
  MyInvitation,
  Paginated,
} from '../types/booking.ts'

const STATUS_OPTIONS: (InvitationStatus | '')[] = [
  '',
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

export function MyInvitationsPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [rows, setRows] = useState<Paginated<MyInvitation> | null>(null)
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | ''>('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listMyInvitations({
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        ...(statusFilter ? { status: statusFilter } : {}),
      })
      setRows(data)
    } catch (e) {
      setRows(null)
      setError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Could not load invitations',
      )
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, statusFilter])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    const t = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(t)
  }, [isAuthenticated, navigate, load])

  const runPatch = async (id: string, status: InvitationStatus) => {
    setActionId(id)
    setError(null)
    try {
      await patchMyInvitation(id, { status })
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

  const onStatusFilterChange = (
    e: SelectChangeEvent<InvitationStatus | ''>,
  ) => {
    setStatusFilter(e.target.value as InvitationStatus | '')
    setPage(0)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Invitations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Invitations you have received for places. Accept, decline, or revoke as
        needed.
      </Typography>
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' } }}
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="inv-status-filter">Status</InputLabel>
            <Select<InvitationStatus | ''>
              labelId="inv-status-filter"
              label="Status"
              value={statusFilter}
              onChange={onStatusFilterChange}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Place</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Updated</TableCell>
              <TableCell align="right" width={280}>
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
                    No invitations.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              (rows?.results ?? []).map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.place_name ?? row.place}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <Chip size="small" label={row.status} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    {formatDate(row.updated_at)}
                  </TableCell>
                  <TableCell align="right">
                    {row.status === 'revoked' ? (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    ) : (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}
                      >
                        {(row.status === 'pending' ||
                          row.status === 'declined') && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={actionId === row.id}
                            onClick={() => void runPatch(row.id, 'accepted')}
                          >
                            Accept
                          </Button>
                        )}
                        {(row.status === 'pending' ||
                          row.status === 'accepted') && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            disabled={actionId === row.id}
                            onClick={() => void runPatch(row.id, 'declined')}
                          >
                            Decline
                          </Button>
                        )}
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25]}
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
    </Container>
  )
}
