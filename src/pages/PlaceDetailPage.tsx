import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import EmailIcon from '@mui/icons-material/Email'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { ApiError } from '../api/errors.ts'
import { getPlace } from '../api/places.ts'
import { listResources } from '../api/resources.ts'
import { ResourceFormDialog } from '../components/ResourceFormDialog.tsx'
import { useAuth } from '../context/useAuth.ts'
import type { Paginated, Place, Resource } from '../types/booking.ts'

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

export function PlaceDetailPage() {
  const { placeId: placeIdParam } = useParams<{ placeId: string }>()
  const { accessToken } = useAuth()
  const placeId = placeIdParam && isUuid(placeIdParam) ? placeIdParam : null

  const [place, setPlace] = useState<Place | null>(null)
  const [resources, setResources] = useState<Paginated<Resource> | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)

  const loadAll = useCallback(async () => {
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
      try {
        const res = await listResources({
          place: placeId,
          limit: rowsPerPage,
          offset: page * rowsPerPage,
        })
        setResources(res)
        setError(null)
      } catch (e2) {
        setResources(null)
        setError(
          e2 instanceof ApiError ? e2.message : 'Failed to load resources',
        )
      }
    } catch (e) {
      setPlace(null)
      setResources(null)
      setError(e instanceof ApiError ? e.message : 'Failed to load place')
    } finally {
      setLoading(false)
    }
  }, [placeId, accessToken, page, rowsPerPage])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadAll()
    }, 0)
    return () => window.clearTimeout(t)
  }, [loadAll])

  useEffect(() => {
    if (place?.name) {
      document.title = `${place.name} · Book stuff`
    }
    return () => {
      document.title = 'Book stuff'
    }
  }, [place?.name])

  const canManage = place?.can_manage === true

  const openCreate = () => {
    setEditingResource(null)
    setFormOpen(true)
  }

  const openEdit = (row: Resource) => {
    setEditingResource(row)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingResource(null)
  }

  if (!placeId) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">Invalid place.</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button
        component={RouterLink}
        to="/places"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Places
      </Button>

      {loading && !place ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error && !place ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            {place?.name ?? 'Place'}
          </Typography>
          {place ? (
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Chip
                size="small"
                label={place.public ? 'Public' : 'Private'}
                color={place.public ? 'primary' : 'default'}
                variant={place.public ? 'filled' : 'outlined'}
              />
              {canManage ? (
                <Button
                  component={RouterLink}
                  to={`/places/${place.id}/invitations`}
                  size="small"
                  variant="outlined"
                  startIcon={<EmailIcon />}
                >
                  Invitations
                </Button>
              ) : null}
            </Box>
          ) : null}

          {error && place ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <Paper sx={{ mb: 2 }}>
            <Toolbar sx={{ flexWrap: 'wrap', gap: 2, py: 2 }}>
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                Resources
              </Typography>
              {canManage ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openCreate}
                  disabled={!accessToken}
                >
                  Add resource
                </Button>
              ) : null}
            </Toolbar>
          </Paper>

          {loading && place && !resources ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Updated</TableCell>
                    {canManage ? (
                      <TableCell align="right" width={72}>
                        Actions
                      </TableCell>
                    ) : null}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(resources?.results ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 3 : 2} sx={{ border: 0 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ py: 2 }}
                        >
                          No resources yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (resources?.results ?? []).map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">
                          {formatDate(row.updated_at)}
                        </TableCell>
                        {canManage ? (
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              aria-label={`Edit ${row.name}`}
                              onClick={() => openEdit(row)}
                              disabled={!accessToken}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                rowsPerPageOptions={[5, 10, 25, 50]}
                count={resources?.count ?? 0}
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
        </>
      )}

      {formOpen && place ? (
        <ResourceFormDialog
          key={editingResource ? `e-${editingResource.id}` : 'create'}
          open
          placeId={place.id}
          resource={editingResource}
          onClose={closeForm}
          onSaved={() => void loadAll()}
        />
      ) : null}
    </Container>
  )
}
