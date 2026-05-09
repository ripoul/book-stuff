import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import PlaceIcon from '@mui/icons-material/Place'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../context/useAuth.ts'

const drawerWidth = 260

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()

  const close = () => setOpen(false)

  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  const drawer = (
    <Box sx={{ width: drawerWidth, pt: 1 }} role="presentation">
      <Typography
        variant="subtitle2"
        sx={{ px: 2, py: 1, color: 'text.secondary' }}
      >
        Menu
      </Typography>
      <List dense>
        <ListItemButton component={RouterLink} to="/" onClick={close}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton component={RouterLink} to="/places" onClick={close}>
          <ListItemIcon>
            <PlaceIcon />
          </ListItemIcon>
          <ListItemText primary="Places" />
        </ListItemButton>
        <Divider sx={{ my: 1 }} />
        {!isAuthenticated ? (
          <>
            <ListItemButton component={RouterLink} to="/login" onClick={close}>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Sign in" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/signup" onClick={close}>
              <ListItemIcon>
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Create account" />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sign out" />
          </ListItemButton>
        )}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open menu"
            onClick={() => setOpen(true)}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            Book stuff
          </Typography>
          <Box
            component={RouterLink}
            to="/"
            aria-label="Home"
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src="/favicon.svg"
              alt=""
              sx={{ height: 36, width: 36, display: 'block' }}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={open} onClose={close}>
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flex: 1, bgcolor: 'grey.50' }}>
        <Outlet />
      </Box>
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="caption" color="text.secondary" component="div">
          © {new Date().getFullYear()}{' '}
          <Link
            href="https://github.com/ripoul"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            ripoul
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
