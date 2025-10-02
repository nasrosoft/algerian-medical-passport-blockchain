import React from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Button,
} from "@mui/material"
import {
  Menu as MenuIcon,
  AccountBalanceWallet as WalletIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from "@mui/icons-material"

import { formatAddress } from "../hooks/useWeb3"
import { useContractAddresses } from "../hooks/useContracts"
import { getNetworkName } from "../config"

interface NavbarProps {
  account: string | null
  chainId: number | null
  onDisconnect: () => void
  onToggleSidebar: () => void
  onToggleTheme: () => void
  themeMode: "light" | "dark"
  showSidebarToggle: boolean
}

const Navbar: React.FC<NavbarProps> = ({
  account,
  chainId,
  onDisconnect,
  onToggleSidebar,
  onToggleTheme,
  themeMode,
  showSidebarToggle,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleDisconnect = () => {
    handleMenuClose()
    onDisconnect()
  }

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar>
        {showSidebarToggle && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onToggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}
        >
          <Box
            component="img"
            src="/healty1.png"
            alt="Algerian Medical Passport Logo"
            sx={{
              width: 40,
              height: 40,
              objectFit: "contain",
            }}
          />

          <Typography variant="h6" component="div" noWrap>
            Medical Passport
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Network Info */}
          {chainId && (
            <Chip
              label={getNetworkName(chainId)}
              size="small"
              color={chainId === 1337 ? "secondary" : "primary"}
              variant="outlined"
            />
          )}

          {/* Wallet Info */}
          {account && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WalletIcon sx={{ fontSize: 20 }} />
              <Typography
                variant="body2"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {formatAddress(account)}
              </Typography>
            </Box>
          )}

          {/* Theme Toggle */}
          <Tooltip
            title={`Switch to ${themeMode === "light" ? "dark" : "light"} mode`}
          >
            <IconButton color="inherit" onClick={onToggleTheme}>
              {themeMode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="Account settings">
            <IconButton color="inherit" onClick={handleMenuOpen} sx={{ ml: 2 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleMenuClose}>
              <PersonIcon sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleDisconnect}>
              <LogoutIcon sx={{ mr: 1 }} />
              Disconnect Wallet
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
