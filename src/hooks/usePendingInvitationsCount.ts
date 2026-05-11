import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { listMyInvitations } from '../api/invitations.ts'
import { useAuth } from '../context/useAuth.ts'

export function usePendingInvitationsCount() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [pendingCount, setPendingCount] = useState(0)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setPendingCount(0)
      return
    }
    try {
      const data = await listMyInvitations({
        limit: 1,
        offset: 0,
        status: 'pending',
      })
      setPendingCount(data.count)
    } catch {
      setPendingCount(0)
    }
  }, [isAuthenticated])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void refresh()
    }, 0)
    return () => window.clearTimeout(t)
  }, [refresh, location.pathname])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    const onFocus = () => {
      void refresh()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [isAuthenticated, refresh])

  return { pendingCount, refresh }
}
