import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Switch,
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
import { ApiError } from '../api/errors.ts'
import { listPlaces } from '../api/places.ts'
import { AddPlaceDialog } from '../components/AddPlaceDialog.tsx'
import { EditPlaceDialog } from '../components/EditPlaceDialog.tsx'
import { useAuth } from '../context/useAuth.ts'
import type { Paginated, Place } from '../types/booking.ts'

const orderingOptions = [
  { value: '-created_at', label: 'Newest first' },
  { value: 'created_at', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: '-name', label: 'Name Z–A' },
  { value: 'id', label: 'ID ascending' },
  { value: '-id', label: 'ID descending' },
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

export function PlacesPage() {
  const { accessToken } = useAuth()
  const [nameInput, setNameInput] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [ordering, setOrdering] = useState('-created_at')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState<Paginated<Place> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [managedByMe, setManagedByMe] = useState(false)
  const [editing, setEditing] = useState<Place | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => {
      setNameFilter(nameInput)
      setPage(0)
    }, 400)
    return () => window.clearTimeout(t)
  }, [nameInput])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listPlaces(
        {
          limit: rowsPerPage,
          offset: page * rowsPerPage,
          name: nameFilter || undefined,
          ordering,
          managed_by_me: managedByMe ? true : undefined,
        },
        accessToken,
      )
      setData(res)
    } catch (e) {
      setData(null)
      setError(e instanceof ApiError ? e.message : 'Failed to load places')
    } finally {
      setLoading(false)
    }
  }, [accessToken, page, rowsPerPage, nameFilter, ordering, managedByMe])

  useEffect(() => {
    void load()
  }, [load])

  const handleOrdering = (e: SelectChangeEvent) => {
    setOrdering(e.target.value)
    setPage(0)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700 }}
      >
        Places
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Filter by name, show only places you manage, change sort order, and
        browse pages. Totals follow API pagination.
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Toolbar sx={{ flexWrap: 'wrap', gap: 2, py: 2 }}>
          <TextField
            label="Filter by name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            size="small"
            sx={{ minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="ordering-label">Sort by</InputLabel>
            <Select
              labelId="ordering-label"
              label="Sort by"
              value={ordering}
              onChange={handleOrdering}
            >
              {orderingOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={managedByMe}
                onChange={(e) => {
                  setManagedByMe(e.target.checked)
                  setPage(0)
                }}
              />
            }
            label="Managed by me"
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={!accessToken}
            title={accessToken ? '' : 'Sign in to add a place'}
          >
            Add place
          </Button>
        </Toolbar>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Visibility</TableCell>
                <TableCell align="right">Updated</TableCell>
                <TableCell align="right" width={72}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.results ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 2 }}
                    >
                      No places on this page.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (data?.results ?? []).map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.public ? 'Public' : 'Private'}
                        color={row.public ? 'primary' : 'default'}
                        variant={row.public ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatDate(row.updated_at)}
                    </TableCell>
                    <TableCell align="right">
                      {row.can_manage ? (
                        <IconButton
                          size="small"
                          aria-label={`Edit ${row.name}`}
                          onClick={() => setEditing(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            count={data?.count ?? 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
          />
        </TableContainer>
      )}

      <AddPlaceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => void load()}
      />
      <EditPlaceDialog
        key={editing ? `place-${editing.id}` : 'closed'}
        place={editing}
        onClose={() => setEditing(null)}
        onSaved={() => void load()}
      />
    </Container>
  )
}
