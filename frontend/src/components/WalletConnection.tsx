import React from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Container,
  Grid,
  Paper,
} from "@mui/material"
import NetworkSwitcher from "./NetworkSwitcher"
import { useWeb3 } from "../hooks/useWeb3"
import {
  AccountBalanceWallet as WalletIcon,
  Security as SecurityIcon,
  HealthAndSafety as HealthIcon,
  Public as PublicIcon,
} from "@mui/icons-material"

interface WalletConnectionProps {
  onConnect: () => Promise<void>
  error: string | null
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnect,
  error,
}) => {
  const { chainId, isConnected } = useWeb3()

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: "primary.main" }} />,
      title: "Secure & Private",
      description:
        "Your medical data is encrypted and stored securely on the blockchain, ensuring privacy and immutability.",
    },
    {
      icon: <HealthIcon sx={{ fontSize: 48, color: "secondary.main" }} />,
      title: "Complete Medical History",
      description:
        "Access your complete medical records, prescriptions, and treatment history in one secure location.",
    },
    {
      icon: <PublicIcon sx={{ fontSize: 48, color: "info.main" }} />,
      title: "Universal Access",
      description:
        "Share your medical information with healthcare providers across Algeria with your explicit consent.",
    },
  ]

  const stakeholders = [
    {
      title: "Patients",
      description:
        "Control your medical data and grant access to healthcare providers as needed.",
      color: "primary.main",
    },
    {
      title: "Doctors",
      description:
        "Access patient records with permission and maintain comprehensive treatment records.",
      color: "secondary.main",
    },
    {
      title: "Hospitals",
      description:
        "Manage patient admissions, treatments, and coordinate care across departments.",
      color: "success.main",
    },
    {
      title: "Clinics",
      description:
        "Provide outpatient care and maintain detailed records of consultations and treatments.",
      color: "error.main",
    },
    {
      title: "Pharmacies",
      description:
        "Verify prescriptions and dispense medications with complete audit trails.",
      color: "warning.main",
    },
    {
      title: "Government",
      description:
        "Oversee the healthcare system with anonymized analytics and regulatory compliance.",
      color: "info.main",
    },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: "left", mb: 6 }} >
        <Box
          component="img"
          src="/healty1.png"
          alt="Algerian Medical Passport Logo"
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            objectFit: "contain",
          }}
        />
        <Typography variant="h2" component="h1" gutterBottom>
          Algerian Medical Passport
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Secure, Blockchain-Based Healthcare Records System
        </Typography>
      </Box>

      {/* Network Switcher */}
      <NetworkSwitcher currentChainId={chainId} isConnected={isConnected} />

      {/* Wallet Connection Card */}
      <Card
        sx={{
          maxWidth: 500,
          mx: "auto",
          mb: 6,
          p: 3,
          textAlign: "center",
          background: "linear-gradient(135deg, #caf0f8 0%, #0077b6 100%)",
          color: "white",
        }}
      >
        <CardContent>
          <WalletIcon sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" component="h2" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            To access the medical passport system, please connect your MetaMask
            wallet.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            onClick={onConnect}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: "1.1rem",
              bgcolor: "rgba(255, 255, 255, 0.2)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            Connect MetaMask
          </Button>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 4 }}>
        Key Features
      </Typography>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: "100%", textAlign: "center", p: 2 }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stakeholders Section */}
      <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 4 }}>
        System Stakeholders
      </Typography>

      <Grid container spacing={3}>
        {stakeholders.map((stakeholder, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                height: "100%",
                borderTop: `4px solid`,
                borderTopColor: stakeholder.color,
              }}
            >
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{ color: stakeholder.color }}
              >
                {stakeholder.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stakeholder.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* System Requirements */}
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          
        </Typography>
        {/* <Typography variant="body2" color="text.secondary">
          • MetaMask browser extension installed<br />
          • Connected to supported network (Chain ID: 1, 1337, 31337, 80001, or 137)<br />
          • Local blockchain node running on port 8545 (for localhost networks)<br />
          • Modern web browser with JavaScript enabled
        </Typography> */}
        <Typography variant="body2" color="text.secondary">
          © 2025 Algerian Medical Passport. All rights reserved. This system is
          intended solely for authorized healthcare professionals and registered
          patients. Unauthorized access, use, or distribution of medical data is
          strictly prohibited and may be subject to legal action under Algerian
          law.
        </Typography>
      </Box>
    </Container>
  )
}

export default WalletConnection
