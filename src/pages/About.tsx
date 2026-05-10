import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Alert, Grid, Chip } from '@mui/material';
import { Spa, EmojiNature, VerifiedUser, Favorite, Park } from '@mui/icons-material';
import { contentAPI } from '../services/api';
import { Content } from '../types';

declare const process: { env: { REACT_APP_API_URL?: string } };
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const defaultContent = `Founded with a mission to provide pure, organic products, Akshayam Wellness has been serving customers with premium quality natural products. Our commitment to sustainability and health drives everything we do.

We believe in the power of nature to heal and nourish. Every product in our collection is carefully sourced and quality-tested to ensure you receive only the best. From traditional wellness practices to modern organic innovations, we bridge the gap between ancient wisdom and contemporary health needs.

Our dedication to quality extends beyond just sourcing — we ensure that every step of our process, from procurement to packaging, meets the highest standards. This commitment has earned us the trust of customers who rely on us for their wellness journey.

At Akshayam Wellness, we understand that true health comes from natural solutions. That's why we work closely with organic farmers and trusted suppliers to bring you products that are not only effective but also ethically sourced and environmentally sustainable.`;

const About: React.FC = () => {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    contentAPI.get('about')
      .then(data => { setContent(data); setLoading(false); })
      .catch(() => { setError('Failed to load content'); setLoading(false); });
  }, []);

  const values = [
    { icon: <Park />, title: 'Organic Farming', desc: 'Certified organic products from trusted natural farms', color: '#1a6b2e', bg: 'rgba(26,107,46,0.08)' },
    { icon: <VerifiedUser />, title: 'Quality First', desc: 'Rigorous quality checks at every step of the process', color: '#0277bd', bg: 'rgba(2,119,189,0.08)' },
    { icon: <Favorite />, title: 'Customer Care', desc: 'Your wellness and satisfaction is our top priority', color: '#c62828', bg: 'rgba(198,40,40,0.08)' },
    { icon: <EmojiNature />, title: 'Sustainability', desc: 'Eco-friendly practices for a healthier planet', color: '#e65100', bg: 'rgba(230,81,0,0.08)' },
  ];

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ width: 48, height: 48, border: '3px solid rgba(26,107,46,0.15)', borderTopColor: '#1a6b2e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', mx: 'auto', mb: 2, '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
        <Typography sx={{ color: '#71717a', fontSize: '0.9rem' }}>Loading...</Typography>
      </Box>
    </Box>
  );

  if (error) return <Container sx={{ py: 4 }}><Alert severity="error" sx={{ borderRadius: '14px' }}>{error}</Alert></Container>;

  return (
    <Box sx={{ minHeight: '100vh', background: '#f9fdf9' }}>
      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg,#0d4a1e 0%,#1a6b2e 50%,#2d9e4a 100%)',
        pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 },
        position: 'relative', overflow: 'hidden',
        '&::after': { content: '""', position: 'absolute', bottom: -2, left: 0, right: 0, height: { xs: 40, md: 60 }, background: '#f9fdf9', clipPath: 'ellipse(55% 100% at 50% 100%)' }
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2.5, py: 0.75, borderRadius: '100px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', mb: 3 }}>
            <Spa sx={{ fontSize: '0.85rem', color: '#a8e6b8' }} />
            <Typography sx={{ color: 'rgba(168,230,184,0.95)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Our Story</Typography>
          </Box>
          <Typography component="h1" sx={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 800, fontSize: { xs: '2.4rem', md: '3.5rem' }, color: 'white', mb: 2, letterSpacing: '-0.02em', lineHeight: 1.15, textShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            {content?.title || 'About Akshayam Wellness'}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '1rem', md: '1.15rem' }, maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}>
            Rooted in nature, committed to your wellness journey
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 }, px: { xs: 2, md: 3 } }}>
        {/* Main Content */}
        <Box sx={{ mb: { xs: 6, md: 10 } }}>
          {content?.logo_url ? (
            <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
              <Grid item xs={12} md={5}>
                <Box sx={{ position: 'sticky', top: 100, textAlign: 'center' }}>
                  <Box sx={{ display: 'inline-block', p: { xs: 2, md: 3 }, borderRadius: '24px', background: 'linear-gradient(135deg,#f0faf2,#e8f5e9)', border: '1px solid rgba(26,107,46,0.1)', boxShadow: '0 8px 40px rgba(26,107,46,0.12)' }}>
                    <img src={`${API_URL}${content.logo_url}`} alt="Akshayam Wellness" style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.1))' }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 3 }}>
                    {['100% Organic', 'Trusted Quality', 'Natural Wellness'].map(tag => (
                      <Chip key={tag} label={tag} size="small" sx={{ background: 'rgba(26,107,46,0.08)', color: '#1a6b2e', fontWeight: 600, border: '1px solid rgba(26,107,46,0.15)', fontSize: '0.75rem' }} />
                    ))}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={7}>
                <Box sx={{ p: { xs: 3, md: 4 }, borderRadius: '24px', background: 'white', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                  <Typography sx={{ fontSize: { xs: '1rem', md: '1.05rem' }, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-line', fontWeight: 400 }}>
                    {content?.content || defaultContent}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 3, md: 5 }, borderRadius: '24px', background: 'white', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <Typography sx={{ fontSize: { xs: '1rem', md: '1.05rem' }, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                {content?.content || defaultContent}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Values */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2.5, py: 0.75, borderRadius: '100px', background: 'rgba(26,107,46,0.08)', border: '1px solid rgba(26,107,46,0.15)', mb: 2 }}>
              <Spa sx={{ fontSize: '0.85rem', color: '#1a6b2e' }} />
              <Typography sx={{ color: '#1a6b2e', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Our Values</Typography>
            </Box>
            <Typography component="h2" sx={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 700, fontSize: { xs: '1.9rem', md: '2.5rem' }, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
              What We Stand For
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {values.map((v, i) => (
              <Grid item xs={12} sm={6} key={v.title}>
                <Box sx={{ p: { xs: 3, md: 3.5 }, borderRadius: '20px', background: 'white', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', gap: 2.5, alignItems: 'flex-start', transition: 'all 0.3s ease', animation: 'fadeInUp 0.6s ease both', animationDelay: `${i * 100}ms`, '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } }, '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' } }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: v.color, flexShrink: 0 }}>{v.icon}</Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#18181b', mb: 0.5 }}>{v.title}</Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: '#71717a', lineHeight: 1.6 }}>{v.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default About;
