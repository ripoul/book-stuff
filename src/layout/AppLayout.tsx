import HomeIcon from '@mui/icons-material/Home'
import LoginIcon from '@mui/icons-material/Login'
import MenuIcon from '@mui/icons-material/Menu'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PlaceIcon from '@mui/icons-material/Place'
import {
  AppBar,
  Box,
  Button,
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
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState } from 'react'
import { Link as RouterLink, Outlet } from 'react-router-dom'
import {
  AccountDrawerUserSection,
  AccountToolbarUserMenu,
} from '../components/AccountUserMenu.tsx'
import { useAuth } from '../context/useAuth.ts'

const drawerWidth = 260

export function AppLayout() {
  const theme = useTheme()
  const isWide = useMediaQuery(theme.breakpoints.up('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  const closeDrawer = () => setDrawerOpen(false)

  const desktopNav = (
    <Box
      component="nav"
      aria-label="Main"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
        gap: 0.5,
        mr: 1,
      }}
    >
      <Button
        component={RouterLink}
        to="/"
        color="inherit"
        startIcon={<HomeIcon />}
      >
        Home
      </Button>
      <Button
        component={RouterLink}
        to="/places"
        color="inherit"
        startIcon={<PlaceIcon />}
      >
        Places
      </Button>
      <Box sx={{ flex: 1, minWidth: 0 }} aria-hidden />
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      {!isAuthenticated ? (
        <>
          <Button
            component={RouterLink}
            to="/login"
            color="inherit"
            startIcon={<LoginIcon />}
          >
            Sign in
          </Button>
          <Button
            component={RouterLink}
            to="/signup"
            color="inherit"
            startIcon={<PersonAddIcon />}
          >
            Create account
          </Button>
        </>
      ) : (
        <AccountToolbarUserMenu />
      )}
    </Box>
  )

  const mobileNavList = (
    <List dense disablePadding>
      <ListItemButton component={RouterLink} to="/" onClick={closeDrawer}>
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItemButton>
      <ListItemButton component={RouterLink} to="/places" onClick={closeDrawer}>
        <ListItemIcon>
          <PlaceIcon />
        </ListItemIcon>
        <ListItemText primary="Places" />
      </ListItemButton>
      <Divider sx={{ my: 1 }} />
      {!isAuthenticated ? (
        <>
          <ListItemButton
            component={RouterLink}
            to="/login"
            onClick={closeDrawer}
          >
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Sign in" />
          </ListItemButton>
          <ListItemButton
            component={RouterLink}
            to="/signup"
            onClick={closeDrawer}
          >
            <ListItemIcon>
              <PersonAddIcon />
            </ListItemIcon>
            <ListItemText primary="Create account" />
          </ListItemButton>
        </>
      ) : (
        <AccountDrawerUserSection onClose={closeDrawer} />
      )}
    </List>
  )

  const drawerPanel = (
    <Box sx={{ width: drawerWidth, pt: 1 }} role="presentation">
      <Typography
        variant="subtitle2"
        sx={{ px: 2, py: 1, color: 'text.secondary' }}
      >
        Menu
      </Typography>
      <Box component="nav" aria-label="Main">
        {mobileNavList}
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          {!isWide ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          ) : null}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexShrink: 0,
              fontWeight: 700,
              textDecoration: 'none',
              color: 'inherit',
              ...(!isWide ? { flexGrow: 1 } : {}),
            }}
          >
            Book stuff
          </Typography>
          {isWide ? desktopNav : null}
          <Box
            component={RouterLink}
            to="/"
            aria-label="Home page logo"
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
      <Drawer anchor="left" open={drawerOpen && !isWide} onClose={closeDrawer}>
        {drawerPanel}
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
