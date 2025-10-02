import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  LocalHospital as HospitalIcon,
  LocalPharmacy as PharmacyIcon,
  AccountBalance as GovernmentIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';

import { EntityType, RegistrationFormData } from '../types';
import { useWeb3 } from '../hooks/useWeb3';
import { useContracts } from '../hooks/useContracts';

const steps = ['Select Role', 'Personal Information', 'Professional Details', 'Review & Submit'];

const entityTypeOptions = [
  {
    value: EntityType.Patient,
    label: 'Patient',
    icon: <PersonAddIcon sx={{ fontSize: 48 }} />,
    description: 'Access and control your medical records with digital passport',
    color: 'primary.main',
  },
  {
    value: EntityType.Hospital,
    label: 'Hospital',
    icon: <HospitalIcon sx={{ fontSize: 48 }} />,
    description: 'Hospital organization providing comprehensive medical care',
    color: 'secondary.main',
  },
  {
    value: EntityType.Clinic,
    label: 'Clinic',
    icon: <BusinessIcon sx={{ fontSize: 48 }} />,
    description: 'Medical clinic providing specialized healthcare services',
    color: 'success.main',
  },
  {
    value: EntityType.Pharmacy,
    label: 'Pharmacy',
    icon: <PharmacyIcon sx={{ fontSize: 48 }} />,
    description: 'Verify prescriptions and dispense medications',
    color: 'warning.main',
  },
  {
    value: EntityType.Doctor,
    label: 'Doctor',
    icon: <HospitalIcon sx={{ fontSize: 48 }} />,
    description: 'Individual healthcare provider managing patient records',
    color: 'info.main',
  },
  {
    value: EntityType.Government,
    label: 'Government Official',
    icon: <GovernmentIcon sx={{ fontSize: 48 }} />,
    description: 'Ministry of Health - oversee healthcare system',
    color: 'error.main',
  },
];

const validationSchema = yup.object({
  entityType: yup.number().required('Please select your role'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  // Patient Passport specific fields
  firstNameAr: yup.string().when('entityType', {
    is: EntityType.Patient,
    then: (schema) => schema.required('Arabic first name is required for patients'),
  }),
  lastNameAr: yup.string().when('entityType', {
    is: EntityType.Patient,
    then: (schema) => schema.required('Arabic last name is required for patients'),
  }),
  patientId: yup.string().when('entityType', {
    is: EntityType.Patient,
    then: (schema) => schema.required('Patient ID is required').matches(/^DZ-213-\d{6}$/, 'Patient ID must be in format DZ-213-XXXXXX'),
  }),
  bloodType: yup.string().when('entityType', {
    is: EntityType.Patient,
    then: (schema) => schema.required('Blood type is required for patients').oneOf(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], 'Invalid blood type'),
  }),
  // Standard fields
  dateOfBirth: yup.date().required('Date of birth is required').max(new Date(), 'Date cannot be in the future'),
  nationalId: yup.string().required('National ID is required').min(10, 'National ID must be at least 10 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().required('Phone number is required').min(10, 'Phone number must be at least 10 digits'),
  address: yup.string().required('Address is required'),
  emergencyContactName: yup.string().required('Emergency contact name is required'),
  emergencyContactRelationship: yup.string().required('Emergency contact relationship is required'),
  emergencyContactPhone: yup.string().required('Emergency contact phone is required'),
  // Provider fields
  licenseNumber: yup.string().when('entityType', {
    is: (val: number) => val === EntityType.Doctor || val === EntityType.Pharmacy || val === EntityType.Hospital || val === EntityType.Clinic,
    then: (schema) => schema.required('License number is required for healthcare providers'),
  }),
  specialization: yup.string().when('entityType', {
    is: (val: number) => val === EntityType.Doctor || val === EntityType.Pharmacy || val === EntityType.Hospital || val === EntityType.Clinic,
    then: (schema) => schema.required('Specialization is required for healthcare providers'),
  }),
  facilityId: yup.string().when('entityType', {
    is: EntityType.Doctor,
    then: (schema) => schema.required('Facility ID is required for doctors (which hospital/clinic you work at)'),
  }),
  licenseExpiryDate: yup.date().when('entityType', {
    is: (val: number) => val === EntityType.Doctor || val === EntityType.Pharmacy || val === EntityType.Hospital || val === EntityType.Clinic,
    then: (schema) => schema.required('License expiry date is required').min(new Date(), 'License must not be expired'),
  }),
});

const Registration: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { account, isConnected } = useWeb3();
  const { identityManagement } = useContracts();

  const formik = useFormik<RegistrationFormData>({
    initialValues: {
      walletAddress: account || '',
      entityType: EntityType.Patient,
      firstName: '',
      lastName: '',
      // Patient Passport fields
      firstNameAr: '',
      lastNameAr: '',
      patientId: '',
      bloodType: undefined,
      // Standard fields
      dateOfBirth: '',
      nationalId: '',
      email: '',
      phone: '',
      address: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      // Provider fields
      licenseNumber: '',
      specialization: '',
      facilityId: '',
      licenseExpiryDate: '',
      additionalCertifications: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (!identityManagement || !account) {
          throw new Error('Contract not available or wallet not connected');
        }

        console.log('Submitting registration:', values);
        
        // Prepare encrypted personal data
        const personalData = {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth,
          nationalId: values.nationalId,
          email: values.email,
          phone: values.phone,
          address: values.address,
          emergencyContact: {
            name: values.emergencyContactName,
            relationship: values.emergencyContactRelationship,
            phone: values.emergencyContactPhone
          },
          credentials: values.licenseNumber ? {
            licenseNumber: values.licenseNumber,
            specialization: values.specialization || '',
            licenseExpiryDate: values.licenseExpiryDate,
          } : null
        };

        // For demo purposes, we'll use base64 encoding as "encryption"
        // In production, use proper encryption
        const encryptedData = btoa(JSON.stringify(personalData));
        
        // Generate a mock public key (in production, generate proper key pair)
        const publicKey = `pubkey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Register medical ID on blockchain
        const tx = await identityManagement.registerMedicalID(
          account,
          values.entityType,
          encryptedData,
          publicKey
        );

        toast.info('Transaction submitted. Please wait for confirmation...');
        const receipt = await tx.wait();
        
        // Get medical ID from the emitted event
        const event = receipt.events?.find((e: any) => e.event === 'IdentityRegistered');
        const medicalId = event?.args?.medicalId?.toNumber();

        if (!medicalId) {
          throw new Error('Failed to get medical ID from transaction');
        }
        
        // Save to localStorage for demo purposes
        localStorage.setItem(`userType_${account}`, values.entityType.toString());
        localStorage.setItem(`isRegistered_${account}`, 'true');
        localStorage.setItem(`medicalId_${account}`, medicalId.toString());
        localStorage.setItem(`userProfile_${account}`, JSON.stringify(values));
        
        toast.success(`Registration successful! Your Medical ID: ${medicalId}`);
        
        // Redirect to dashboard after successful registration
        setTimeout(() => window.location.reload(), 2000);
      } catch (error: any) {
        console.error('Registration error:', error);
        if (error.code === 4001) {
          toast.error('Transaction rejected by user');
        } else if (error.message?.includes('insufficient funds')) {
          toast.error('Insufficient funds for transaction');
        } else {
          toast.error(error.message || 'Registration failed. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const validateCurrentStep = async () => {
    switch (activeStep) {
      case 0: // Role Selection
        if (formik.values.entityType === undefined) {
          toast.error('Please select your role');
          return false;
        }
        break;
        
      case 1: // Personal Information
        // Touch all fields to trigger validation display
        const personalInfoFields = [
          'firstName', 'lastName', 'dateOfBirth', 'nationalId', 'email', 'phone', 'address',
          'emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone'
        ];
        
        // Add patient-specific fields if user is a patient
        if (formik.values.entityType === EntityType.Patient) {
          personalInfoFields.push('firstNameAr', 'lastNameAr', 'patientId', 'bloodType');
        }
        
        // Touch all relevant fields
        const touchedFields: any = {};
        personalInfoFields.forEach(field => {
          touchedFields[field] = true;
        });
        formik.setTouched(touchedFields, true);
        
        // Validate only the fields for current step
        try {
          await validationSchema.validateSync(formik.values, { abortEarly: false });
        } catch (validationError: any) {
          // Check if any errors are related to personal information fields
          const relevantErrors = validationError.inner?.filter((error: any) => 
            personalInfoFields.includes(error.path)
          );
          
          if (relevantErrors && relevantErrors.length > 0) {
            toast.error(`Please fill all required fields: ${relevantErrors[0].message}`);
            return false;
          }
        }
        break;
        
      case 2: // Professional Details
        // Only validate if user is a healthcare provider
        if ([EntityType.Doctor, EntityType.Hospital, EntityType.Clinic, EntityType.Pharmacy].includes(formik.values.entityType)) {
          const professionalFields = ['licenseNumber', 'specialization', 'licenseExpiryDate'];
          
          // Add doctor-specific field
          if (formik.values.entityType === EntityType.Doctor) {
            professionalFields.push('facilityId');
          }
          
          // Touch professional fields
          const touchedFields: any = {};
          professionalFields.forEach(field => {
            touchedFields[field] = true;
          });
          formik.setTouched({ ...formik.touched, ...touchedFields }, true);
          
          // Validate professional fields
          try {
            await validationSchema.validateSync(formik.values, { abortEarly: false });
          } catch (validationError: any) {
            const relevantErrors = validationError.inner?.filter((error: any) => 
              professionalFields.includes(error.path)
            );
            
            if (relevantErrors && relevantErrors.length > 0) {
              toast.error(`Please fill all required fields: ${relevantErrors[0].message}`);
              return false;
            }
          }
        }
        break;
        
      default:
        break;
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Your Role in the Healthcare System
            </Typography>
            <Grid container spacing={2}>
              {entityTypeOptions.map((option) => (
                <Grid item xs={12} sm={6} key={option.value}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: formik.values.entityType === option.value ? 2 : 1,
                      borderColor: formik.values.entityType === option.value ? option.color : 'grey.300',
                      '&:hover': {
                        borderColor: option.color,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out',
                      },
                    }}
                    onClick={() => formik.setFieldValue('entityType', option.value)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box sx={{ color: option.color, mb: 1 }}>
                        {option.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {option.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please fill all required fields marked with * to continue to the next step.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="firstName"
                  label="First Name *"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="lastName"
                  label="Last Name *"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  required
                />
              </Grid>
              
              {/* Patient Passport specific fields */}
              {formik.values.entityType === EntityType.Patient && (
                <>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2, mb: 1 }}>
                      🆔 <strong>Patient Passport Information</strong><br/>
                      As a patient, you need to provide additional information for your digital medical passport.
                    </Alert>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="firstNameAr"
                      label="First Name (Arabic) - الاسم الأول *"
                      placeholder="نسيم"
                      value={formik.values.firstNameAr}
                      onChange={formik.handleChange}
                      error={formik.touched.firstNameAr && Boolean(formik.errors.firstNameAr)}
                      helperText={formik.touched.firstNameAr && formik.errors.firstNameAr}
                      required
                      dir="rtl"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          textAlign: 'right',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="lastNameAr"
                      label="Last Name (Arabic) - اللقب *"
                      placeholder="بن يحيى"
                      value={formik.values.lastNameAr}
                      onChange={formik.handleChange}
                      error={formik.touched.lastNameAr && Boolean(formik.errors.lastNameAr)}
                      helperText={formik.touched.lastNameAr && formik.errors.lastNameAr}
                      required
                      dir="rtl"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          textAlign: 'right',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="patientId"
                      label="Algerian Patient ID *"
                      placeholder="DZ-213-000001"
                      value={formik.values.patientId}
                      onChange={formik.handleChange}
                      error={formik.touched.patientId && Boolean(formik.errors.patientId)}
                      helperText={formik.touched.patientId && formik.errors.patientId || "Format: DZ-213-XXXXXX"}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="bloodType-label">Blood Type *</InputLabel>
                      <Select
                        labelId="bloodType-label"
                        name="bloodType"
                        value={formik.values.bloodType}
                        label="Blood Type *"
                        onChange={formik.handleChange}
                        error={formik.touched.bloodType && Boolean(formik.errors.bloodType)}
                      >
                        <MenuItem value="O+">O+</MenuItem>
                        <MenuItem value="O-">O-</MenuItem>
                        <MenuItem value="A+">A+</MenuItem>
                        <MenuItem value="A-">A-</MenuItem>
                        <MenuItem value="B+">B+</MenuItem>
                        <MenuItem value="B-">B-</MenuItem>
                        <MenuItem value="AB+">AB+</MenuItem>
                        <MenuItem value="AB-">AB-</MenuItem>
                      </Select>
                      {formik.touched.bloodType && formik.errors.bloodType && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {formik.errors.bloodType}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="dateOfBirth"
                  label="Date of Birth *"
                  type="date"
                  value={formik.values.dateOfBirth}
                  onChange={formik.handleChange}
                  error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                  helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="nationalId"
                  label="National ID *"
                  value={formik.values.nationalId}
                  onChange={formik.handleChange}
                  error={formik.touched.nationalId && Boolean(formik.errors.nationalId)}
                  helperText={formik.touched.nationalId && formik.errors.nationalId}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email Address *"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number *"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address *"
                  multiline
                  rows={3}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Emergency Contact
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  name="emergencyContactName"
                  label="Emergency Contact Name *"
                  value={formik.values.emergencyContactName}
                  onChange={formik.handleChange}
                  error={formik.touched.emergencyContactName && Boolean(formik.errors.emergencyContactName)}
                  helperText={formik.touched.emergencyContactName && formik.errors.emergencyContactName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  name="emergencyContactRelationship"
                  label="Relationship *"
                  value={formik.values.emergencyContactRelationship}
                  onChange={formik.handleChange}
                  error={formik.touched.emergencyContactRelationship && Boolean(formik.errors.emergencyContactRelationship)}
                  helperText={formik.touched.emergencyContactRelationship && formik.errors.emergencyContactRelationship}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  name="emergencyContactPhone"
                  label="Emergency Contact Phone *"
                  value={formik.values.emergencyContactPhone}
                  onChange={formik.handleChange}
                  error={formik.touched.emergencyContactPhone && Boolean(formik.errors.emergencyContactPhone)}
                  helperText={formik.touched.emergencyContactPhone && formik.errors.emergencyContactPhone}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Professional Details
            </Typography>
            {(formik.values.entityType === EntityType.Doctor ||
              formik.values.entityType === EntityType.Hospital ||
              formik.values.entityType === EntityType.Clinic ||
              formik.values.entityType === EntityType.Pharmacy) && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Please fill all required professional fields marked with * to continue.
              </Alert>
            )}
            {(formik.values.entityType === EntityType.Doctor ||
              formik.values.entityType === EntityType.Hospital ||
              formik.values.entityType === EntityType.Clinic ||
              formik.values.entityType === EntityType.Pharmacy) ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity="info">
                    As a healthcare provider, you need to provide your professional credentials for government verification.
                  </Alert>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="licenseNumber"
                    label="License Number *"
                    value={formik.values.licenseNumber}
                    onChange={formik.handleChange}
                    error={formik.touched.licenseNumber && Boolean(formik.errors.licenseNumber)}
                    helperText={formik.touched.licenseNumber && formik.errors.licenseNumber}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="specialization"
                    label={formik.values.entityType === EntityType.Doctor ? "Medical Specialization *" : "Facility Type/Specialization *"}
                    placeholder={formik.values.entityType === EntityType.Doctor ? "Cardiology, General Practice, etc." : "General Hospital, Specialized Clinic, etc."}
                    value={formik.values.specialization}
                    onChange={formik.handleChange}
                    error={formik.touched.specialization && Boolean(formik.errors.specialization)}
                    helperText={formik.touched.specialization && formik.errors.specialization}
                    required
                  />
                </Grid>
                {formik.values.entityType === EntityType.Doctor && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="facilityId"
                      label="Facility ID (Hospital/Clinic) *"
                      placeholder="HOSP-ALG-001, CLINIC-ALG-001"
                      value={formik.values.facilityId}
                      onChange={formik.handleChange}
                      error={formik.touched.facilityId && Boolean(formik.errors.facilityId)}
                      helperText={formik.touched.facilityId && formik.errors.facilityId || "Which hospital/clinic do you work at?"}
                      required
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="licenseExpiryDate"
                    label="License Expiry Date *"
                    type="date"
                    value={formik.values.licenseExpiryDate}
                    onChange={formik.handleChange}
                    error={formik.touched.licenseExpiryDate && Boolean(formik.errors.licenseExpiryDate)}
                    helperText={formik.touched.licenseExpiryDate && formik.errors.licenseExpiryDate}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="additionalCertifications"
                    label="Additional Certifications (Optional)"
                    placeholder="Board Certified, Accredited Level 1 Hospital, etc."
                    multiline
                    rows={2}
                    value={formik.values.additionalCertifications}
                    onChange={formik.handleChange}
                    error={formik.touched.additionalCertifications && Boolean(formik.errors.additionalCertifications)}
                    helperText={formik.touched.additionalCertifications && formik.errors.additionalCertifications}
                  />
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                No additional professional details required for {entityTypeOptions.find(opt => opt.value === formik.values.entityType)?.label}.
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {entityTypeOptions.find(opt => opt.value === formik.values.entityType)?.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {entityTypeOptions.find(opt => opt.value === formik.values.entityType)?.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Personal Information:
                    </Typography>
                    <Typography variant="body2">
                      {formik.values.firstName} {formik.values.lastName}
                      {formik.values.entityType === EntityType.Patient && formik.values.firstNameAr && formik.values.lastNameAr && (
                        <span style={{ marginLeft: '8px', color: '#666' }}>({formik.values.firstNameAr} {formik.values.lastNameAr})</span>
                      )}
                    </Typography>
                    {formik.values.entityType === EntityType.Patient && formik.values.patientId && (
                      <Typography variant="body2">
                        Patient ID: <strong>{formik.values.patientId}</strong>
                      </Typography>
                    )}
                    {formik.values.entityType === EntityType.Patient && formik.values.bloodType && (
                      <Typography variant="body2">
                        Blood Type: <strong style={{ color: '#d32f2f' }}>{formik.values.bloodType}</strong>
                      </Typography>
                    )}
                    <Typography variant="body2">
                      DOB: {formik.values.dateOfBirth}
                    </Typography>
                    <Typography variant="body2">
                      National ID: {formik.values.nationalId}
                    </Typography>
                    <Typography variant="body2">
                      Email: {formik.values.email}
                    </Typography>
                    <Typography variant="body2">
                      Phone: {formik.values.phone}
                    </Typography>
                    
                    {(formik.values.entityType === EntityType.Doctor || 
                      formik.values.entityType === EntityType.Hospital ||
                      formik.values.entityType === EntityType.Clinic ||
                      formik.values.entityType === EntityType.Pharmacy) && (
                      <>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Professional Details:
                        </Typography>
                        <Typography variant="body2">
                          License: {formik.values.licenseNumber}
                        </Typography>
                        <Typography variant="body2">
                          Specialization: {formik.values.specialization}
                        </Typography>
                        {formik.values.entityType === EntityType.Doctor && formik.values.facilityId && (
                          <Typography variant="body2">
                            Facility: {formik.values.facilityId}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          License Expiry: {formik.values.licenseExpiryDate}
                        </Typography>
                        {formik.values.additionalCertifications && (
                          <Typography variant="body2">
                            Certifications: {formik.values.additionalCertifications}
                          </Typography>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="warning">
                  Please review your information carefully. After submission, your registration will be sent to government authorities for verification. You will be notified once your account is approved.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  if (!isConnected) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Please connect your wallet to register for the Medical Passport system.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Medical Passport Registration
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Join the Algerian Medical Passport system to access secure, blockchain-based healthcare services.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={formik.handleSubmit}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Registration;