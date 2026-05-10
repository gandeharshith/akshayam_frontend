import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Link, Divider, IconButton, Slide } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { EmojiNature, Phone, Email, LocationOn, Instagram, WhatsApp, ArrowUpward } from '@mui/icons-material';
import { contactAPI } from '../services/api';

interface ContactInfo {
  company_name: string;
  company_description: string;
  email: string;
  phone: string;
  address: string;
}

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

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

    const handleScroll = () => setShowScrollToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
    { label: 'Recipes', to: '/recipes' },
    { label: 'About Us', to: '/about' },
    { label: 'My Orders', to: '/my-orders' },
  ];

  const policies = [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
    { label: 'Refund Policy', to: '#' },
    { label: 'Shipping Policy', to: '#' },
  ];

  const socialLinks = [
    { icon: <Instagram sx={{ fontSize: '1.1rem' }} />, href: 'https://www.instagram.com/akshayamwellness?utm_source=qr&igsh=MXUyb25mZTQ2bWt5Yw==', color: '#e1306c', label: 'Instagram' },
    { icon: <WhatsApp sx={{ fontSize: '1.1rem' }} />, href: 'https://api.whatsapp.com/send/?phone=919391136761&text&type=phone_number&app_absent=0&wame_ctl=1', color: '#25d366', label: 'WhatsApp' },
  ];

  const contactItems = contactInfo ? [
    contactInfo.email ? { icon: <Email sx={{ fontSize: '0.9rem' }} />, text: contactInfo.email, href: `mailto:${contactInfo.email}` } : null,
    contactInfo.phone ? { icon: <Phone sx={{ fontSize: '0.9rem' }} />, text: contactInfo.phone, href: `tel:${contactInfo.phone}` } : null,
    contactInfo.address ? { icon: <LocationOn sx={{ fontSize: '0.9rem' }} />, text: contactInfo.address, href: null } : null,
  ].filter(Boolean) as { icon: React.ReactNode; text: string; href: string | null }[] : [];

  return (
    <>
      {/* Scroll to Top Button */}
      <Slide direction="up" in={showScrollToTop} mountOnEnter unmountOnExit>
        <IconButton
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 20, md: 32 },
            right: { xs: 16, md: 32 },
            zIndex: 1000,
            background: 'linear-gradient(135deg,#1a6b2e,#2d9e4a)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(26,107,46,0.4)',
            width: { xs: 44, md: 52 },
            height: { xs: 44, md: 52 },
            '&:hover': {
              background: 'linear-gradient(135deg,#0d4a1e,#1a6b2e)',
              transform: 'translateY(-3px)',
              boxShadow: '0 8px 28px rgba(26,107,46,0.5)',
            },
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <ArrowUpward sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' } }} />
        </IconButton>
      </Slide>

      <Box
        component="footer"
        sx={{
          background: 'linear-gradient(180deg,#0a3318 0%,#0f4c25 100%)',
          color: 'white',
          pt: { xs: 5, md: 7 },
          pb: { xs: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 1,
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)',
          },
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', bottom: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 4, md: 5 }}>
            {/* Brand */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
                  <EmojiNature sx={{ color: 'white', fontSize: '1.2rem' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                    {contactInfo?.company_name || 'Akshayam'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Wellness</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, mb: 3, maxWidth: 300 }}>
                {contactInfo?.company_description || 'Bringing nature\'s finest organic and natural wellness products to your doorstep. Pure, authentic, and sustainably sourced.'}
              </Typography>
              {/* Social */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((s, i) => (
                  <IconButton key={i} component="a" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} size="small"
                    sx={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.25s ease', '&:hover': { background: s.color, color: 'white', border: `1px solid ${s.color}`, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${s.color}50` } }}>
                    {s.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={6} md={2.5}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 2 }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {navLinks.map(link => (
                  <Link key={link.to} component={RouterLink} to={link.to}
                    sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500, transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: 0.5, '&:hover': { color: '#4ade80', transform: 'translateX(4px)' } }}>
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Policies */}
            <Grid item xs={6} md={2.5}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 2 }}>
                Policies
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {policies.map(p => (
                  <Link key={p.label} href={p.to}
                    sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500, transition: 'all 0.2s ease', '&:hover': { color: '#4ade80', transform: 'translateX(4px)', display: 'inline-block' } }}>
                    {p.label}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Contact — from API data */}
            {contactInfo && contactItems.length > 0 && (
              <Grid item xs={12} md={3}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 2 }}>
                  Contact Us
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {contactItems.map((c, i) => (
                    <Box key={i}
                      component={c.href ? 'a' : 'div'}
                      href={c.href || undefined}
                      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, textDecoration: 'none', transition: 'all 0.2s ease', '&:hover .contact-icon': { background: '#22c55e', color: 'white' }, '&:hover .contact-text': { color: '#4ade80' } }}>
                      <Box className="contact-icon" sx={{ width: 32, height: 32, borderRadius: '9px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', flexShrink: 0, transition: 'all 0.2s ease' }}>
                        {c.icon}
                      </Box>
                      <Typography className="contact-text" sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, lineHeight: 1.4, transition: 'color 0.2s ease', pt: 0.5 }}>
                        {c.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Delivery note */}
                <Box sx={{ mt: 3, p: 2, borderRadius: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontWeight: 500 }}>
                    🚚 <strong style={{ color: '#4ade80' }}>Sunday Delivery</strong><br />
                    Orders placed before Wednesday 6 PM will be delivered on Sunday
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: { xs: 3, md: 4 }, borderColor: 'rgba(255,255,255,0.08)' }} />

          {/* Bottom bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
              © {year} {contactInfo?.company_name || 'Akshayam Wellness'}. All rights reserved.
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
              Made with ❤️ for your wellness
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Footer;
