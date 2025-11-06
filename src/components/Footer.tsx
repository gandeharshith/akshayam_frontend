import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  Divider
} from '@mui/material';
import { Email, Phone, LocationOn } from '@mui/icons-material';
import { contactAPI } from '../services/api';

const Footer: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<any>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const contact = await contactAPI.get();
        setContactInfo(contact);
      } catch (err) {
        console.error('Failed to load contact info:', err);
      }
    };
    
    fetchContactInfo();
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2e7d32',
        color: 'white',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {contactInfo?.company_name || 'Akshayam Wellness'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {contactInfo?.company_description || 'Your trusted partner in organic wellness products. We provide high-quality, natural products to enhance your healthy lifestyle.'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover">
                Home
              </Link>
              <Link href="/about" color="inherit" underline="hover">
                About Us
              </Link>
              <Link href="/products" color="inherit" underline="hover">
                Products
              </Link>
              <Link href="/my-orders" color="inherit" underline="hover">
                My Orders
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2">
                  {contactInfo?.email || 'info@akshayamwellness.com'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2">
                  {contactInfo?.phone || '+91-9876543210'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  {contactInfo?.address || '123 Wellness Street, Organic City'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} {contactInfo?.company_name || 'Akshayam Wellness'}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
