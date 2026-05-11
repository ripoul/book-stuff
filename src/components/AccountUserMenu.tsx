import LogoutIcon from '@mui/icons-material/Logout'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import NotificationsIcon from '@mui/icons-material/Notifications'
import {
  Avatar,
  Badge,
  Box,
  Button,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.ts'
import { usePendingInvitationsCount } from '../hooks/usePendingInvitationsCount.ts'

const badgeSlotProps = {
  sx: {
    '& .MuiBadge-badge': {
      fontSize: '0.65rem',
      minWidth: 16,
      height: 16,
      padding: '0 4px',
    },
  },
}

function avatarLetter(email: string | null): string {
  if (!email) return '?'
  const c = email.trim()[0]
  return c ? c.toUpperCase() : '?'
}

export function AccountToolbarUserMenu() {
  const { accountEmail, logout } = useAuth()
  const navigate = useNavigate()
  const { pendingCount, refresh } = usePendingInvitationsCount()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const closeMenu = () => setAnchorEl(null)

  const handleLogout = () => {
    closeMenu()
    logout()
    navigate('/')
  }

  return (
    <>
      <Button
        color="inherit"
        onClick={(e) => {
          void refresh()
          setAnchorEl(e.currentTarget)
        }}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        aria-controls={open ? 'account-menu' : undefined}
        sx={{
          textTransform: 'none',
          maxWidth: { xs: 200, sm: 280 },
          px: 1,
        }}
        startIcon={
          <Badge
            badgeContent={pendingCount}
            color="error"
            max={99}
            invisible={pendingCount === 0}
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            {...badgeSlotProps}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.9rem',
                bgcolor: 'primary.main',
              }}
            >
              {avatarLetter(accountEmail)}
            </Avatar>
          </Badge>
        }
      >
        <Typography variant="body2" component="span" noWrap>
          {accountEmail ?? '…'}
        </Typography>
      </Button>
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ list: { dense: true } }}
      >
        <MenuItem
          component={RouterLink}
          to="/account"
          onClick={closeMenu}
          sx={{ py: 1 }}
        >
          <ListItemIcon>
            <ManageAccountsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" component="span">
                Edit account
              </Typography>
            }
          />
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to="/account/invitations"
          onClick={closeMenu}
          sx={{ py: 1 }}
        >
          <ListItemIcon>
            <Badge
              badgeContent={pendingCount}
              color="error"
              max={99}
              invisible={pendingCount === 0}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              {...badgeSlotProps}
            >
              <NotificationsIcon fontSize="small" />
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" component="span">
                Invitations
              </Typography>
            }
          />
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" component="span">
                Sign out
              </Typography>
            }
          />
        </MenuItem>
      </Menu>
    </>
  )
}

export function AccountDrawerUserSection({ onClose }: { onClose: () => void }) {
  const { accountEmail, logout } = useAuth()
  const navigate = useNavigate()
  const { pendingCount } = usePendingInvitationsCount()

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/')
  }

  return (
    <>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Badge
          badgeContent={pendingCount}
          color="error"
          max={99}
          invisible={pendingCount === 0}
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          {...badgeSlotProps}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              fontSize: '1rem',
              bgcolor: 'primary.main',
            }}
          >
            {avatarLetter(accountEmail)}
          </Avatar>
        </Badge>
        <Typography
          variant="body2"
          noWrap
          title={accountEmail ?? undefined}
          sx={{ flex: 1, minWidth: 0 }}
        >
          {accountEmail ?? '…'}
        </Typography>
      </Box>
      <ListItemButton component={RouterLink} to="/account" onClick={onClose}>
        <ListItemIcon>
          <ManageAccountsIcon />
        </ListItemIcon>
        <ListItemText primary="Edit account" />
      </ListItemButton>
      <ListItemButton
        component={RouterLink}
        to="/account/invitations"
        onClick={onClose}
      >
        <ListItemIcon>
          <Badge
            badgeContent={pendingCount}
            color="error"
            max={99}
            invisible={pendingCount === 0}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            {...badgeSlotProps}
          >
            <NotificationsIcon />
          </Badge>
        </ListItemIcon>
        <ListItemText primary="Invitations" />
      </ListItemButton>
      <ListItemButton onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Sign out" />
      </ListItemButton>
    </>
  )
}
