import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Slide
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Instagram,
  WhatsApp,
  LocalFlorist,
  ArrowUpward,
  Favorite,
  Copyright,
  Schedule,
  Security,
  Park
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { contactAPI } from '../services/api';

const Footer: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

    // Scroll to top button visibility
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const quickLinks = [
    { text: 'Home', path: '/', icon: '🏠' },
    { text: 'About Us', path: '/about', icon: '📖' },
    { text: 'Products', path: '/products', icon: '🛒' },
    { text: 'Healthy Recipes', path: '/recipes', icon: '🥗' },
    { text: 'My Orders', path: '/my-orders', icon: '📦' }
  ];

  const socialLinks = [
    { icon: <Instagram />, url: 'https://www.instagram.com/akshayamwellness?utm_source=qr&igsh=MXUyb25mZTQ2bWt5Yw==', label: 'Instagram', color: '#E4405F' },
    { icon: <WhatsApp />, url: 'https://api.whatsapp.com/send/?phone=919391136761&text&type=phone_number&app_absent=0&wame_ctl=1', label: 'WhatsApp', color: '#25D366' }
  ];

  const features = [
    { icon: <Park />, text: '100% Organic' },
    { icon: <Security />, text: 'Secure Shopping' },
    { icon: <Schedule />, text: 'Weekly Delivery' }
  ];

  return (
    <>
      {/* Scroll to Top Button */}
      <Slide direction="up" in={showScrollToTop} mountOnEnter unmountOnExit>
        <IconButton
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 80, md: 32 },
            right: { xs: 20, md: 32 },
            zIndex: 1000,
            backgroundColor: '#2e7d32',
            color: 'white',
            boxShadow: '0 4px 20px rgba(46, 125, 50, 0.3)',
            '&:hover': {
              backgroundColor: '#1b5e20',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(46, 125, 50, 0.4)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: 56,
            height: 56,
          }}
        >
          <ArrowUpward />
        </IconButton>
      </Slide>

      {/* Enhanced Footer */}
      <Box
        component="footer"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 30%, #388e3c 70%, #4caf50 100%)',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 50%)',
            zIndex: 1,
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          {/* Top Section with Brand and Features */}
          <Box sx={{ py: { xs: 4, md: 6 }, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Container maxWidth="xl">
              <Fade in={true} timeout={1000}>
                <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <LocalFlorist 
                      sx={{ 
                        mr: 1.5, 
                        fontSize: 32,
                        color: 'rgba(255,255,255,0.9)',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }} 
                    />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: 'white',
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        letterSpacing: '-0.02em',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      {contactInfo?.company_name || 'Akshayam Wellness'}
                    </Typography>
                  </Box>

                  {/* Feature Chips */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
                    {features.map((feature, index) => (
                      <Fade in={true} timeout={1200 + index * 200} key={index}>
                        <Chip
                          icon={feature.icon}
                          label={feature.text}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.25)',
                            }
                          }}
                        />
                      </Fade>
                    ))}
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      maxWidth: 600,
                      mx: 'auto',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      lineHeight: 1.6,
                      px: 2,
                    }}
                  >
                    {contactInfo?.company_description || 'Your trusted partner in organic wellness products. We provide high-quality, natural products to enhance your healthy lifestyle.'}
                  </Typography>
                </Box>
              </Fade>
            </Container>
          </Box>

          {/* Main Footer Content */}
          <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Container maxWidth="xl">
              <Grid container spacing={{ xs: 3, md: 5 }}>
                {/* Quick Links */}
                <Grid item xs={12} sm={6} md={3}>
                  <Fade in={true} timeout={800}>
                    <Box>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{
                          color: 'white',
                          fontWeight: 700,
                          fontSize: { xs: '1.1rem', md: '1.25rem' },
                          mb: 2.5,
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -8,
                            left: 0,
                            width: 40,
                            height: 2,
                            backgroundColor: '#66bb6a',
                            borderRadius: 1,
                          }
                        }}
                      >
                        Quick Links
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {quickLinks.map((link, index) => (
                          <Fade in={true} timeout={1000 + index * 100} key={link.path}>
                            <Link 
                              component={RouterLink}
                              to={link.path}
                              sx={{
                                color: 'rgba(255,255,255,0.8)',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                py: 0.5,
                                px: 1,
                                borderRadius: 2,
                                fontSize: '0.95rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  color: 'white',
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  transform: 'translateX(8px)',
                                  backdropFilter: 'blur(10px)',
                                }
                              }}
                            >
                              <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                              {link.text}
                            </Link>
                          </Fade>
                        ))}
                      </Box>
                    </Box>
                  </Fade>
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12} sm={6} md={4}>
                  <Fade in={true} timeout={1000}>
                    <Box>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{
                          color: 'white',
                          fontWeight: 700,
                          fontSize: { xs: '1.1rem', md: '1.25rem' },
                          mb: 2.5,
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -8,
                            left: 0,
                            width: 40,
                            height: 2,
                            backgroundColor: '#66bb6a',
                            borderRadius: 1,
                          }
                        }}
                      >
                        Get In Touch
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                          { 
                            icon: <Email />, 
                            text: contactInfo?.email || 'info@akshayamwellness.com',
                            href: `mailto:${contactInfo?.email || 'info@akshayamwellness.com'}`
                          },
                          { 
                            icon: <Phone />, 
                            text: contactInfo?.phone || '+91-9876543210',
                            href: `tel:${contactInfo?.phone || '+919876543210'}`
                          },
                          { 
                            icon: <LocationOn />, 
                            text: contactInfo?.address || '123 Wellness Street, Organic City',
                            href: null
                          }
                        ].map((contact, index) => (
                          <Fade in={true} timeout={1200 + index * 150} key={index}>
                            <Box
                              component={contact.href ? 'a' : 'div'}
                              href={contact.href || undefined}
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5,
                                color: 'rgba(255,255,255,0.8)',
                                textDecoration: 'none',
                                p: 1,
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': contact.href ? {
                                  color: 'white',
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  backdropFilter: 'blur(10px)',
                                  transform: 'translateY(-2px)',
                                } : {}
                              }}
                            >
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(255,255,255,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  minWidth: 40,
                                  height: 40,
                                }}
                              >
                                {contact.icon}
                              </Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '0.9rem',
                                  lineHeight: 1.5,
                                  mt: 0.5
                                }}
                              >
                                {contact.text}
                              </Typography>
                            </Box>
                          </Fade>
                        ))}
                      </Box>
                    </Box>
                  </Fade>
                </Grid>

                {/* Social Media & Newsletter */}
                <Grid item xs={12} md={5}>
                  <Fade in={true} timeout={1200}>
                    <Box>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{
                          color: 'white',
                          fontWeight: 700,
                          fontSize: { xs: '1.1rem', md: '1.25rem' },
                          mb: 2.5,
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -8,
                            left: 0,
                            width: 40,
                            height: 2,
                            backgroundColor: '#66bb6a',
                            borderRadius: 1,
                          }
                        }}
                      >
                        Follow Us
                      </Typography>

                      {/* Social Media Links */}
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255,255,255,0.8)', 
                            mb: 2,
                            fontSize: '0.9rem'
                          }}
                        >
                          Stay connected for the latest updates and wellness tips
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {socialLinks.map((social, index) => (
                            <Fade in={true} timeout={1400 + index * 100} key={social.label}>
                              <IconButton
                                component="a"
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                sx={{
                                  color: 'white',
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  '&:hover': {
                                    backgroundColor: social.color,
                                    transform: 'translateY(-3px) scale(1.05)',
                                    boxShadow: `0 8px 25px ${social.color}40`,
                                  }
                                }}
                              >
                                {social.icon}
                              </IconButton>
                            </Fade>
                          ))}
                        </Box>
                      </Box>

                      {/* Delivery Info Card */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 3,
                          color: 'white',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Schedule sx={{ mr: 1, color: '#66bb6a' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Delivery Schedule
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.9 }}>
                          Orders should be placed before every Wednesday 6 PM and the shipment will be delivered on Sunday
                        </Typography>
                      </Paper>
                    </Box>
                  </Fade>
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* Bottom Footer */}
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', py: 3 }}>
            <Container maxWidth="xl">
              <Fade in={true} timeout={1600}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  textAlign: { xs: 'center', md: 'left' }
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '0.85rem'
                    }}
                  >
                    <Copyright sx={{ fontSize: '1rem' }} />
                    {new Date().getFullYear()} {contactInfo?.company_name || 'Akshayam Wellness'}. All rights reserved.
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '0.8rem'
                    }}
                  >
                    Made with <Favorite sx={{ color: '#ff4444', fontSize: '1rem' }} /> for your wellness
                  </Typography>
                </Box>
              </Fade>
            </Container>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Footer;
