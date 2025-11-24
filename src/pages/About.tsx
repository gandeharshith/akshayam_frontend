import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { contentAPI } from '../services/api';
import { Content } from '../types';

const About: React.FC = () => {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const aboutContent = await contentAPI.get('about');
        setContent(aboutContent);
      } catch (err) {
        setError('Failed to load content');
        console.error('Error fetching about content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom
        sx={{
          fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
          lineHeight: 1.2,
          mb: { xs: 3, md: 4 },
          textAlign: 'center'
        }}
      >
        {content?.title || 'About Akshayam Wellness'}
      </Typography>

      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="flex-start">
          {/* Content Section - Left Side */}
          <Grid item xs={12} md={7}>
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: { xs: 1.6, md: 1.8 }, 
                fontSize: { xs: '1rem', md: '1.125rem' },
                textAlign: 'justify',
                whiteSpace: 'pre-line'
              }}
            >
              {content?.content || `Founded with a mission to provide pure, organic products, 
              Akshayam Wellness has been serving customers with premium quality natural products. 
              Our commitment to sustainability and health drives everything we do.

              We believe in the power of nature to heal and nourish. Every product in our collection is carefully sourced and quality-tested to ensure you receive only the best. From traditional wellness practices to modern organic innovations, we bridge the gap between ancient wisdom and contemporary health needs.`}
            </Typography>
          </Grid>

          {/* Logo Section - Right Side */}
          <Grid item xs={12} md={5}>
            {content?.logo_url && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'center', md: 'flex-end' },
                alignItems: 'center',
                height: '100%'
              }}>
                <img
                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${content.logo_url}`}
                  alt="Akshayam Wellness Logo"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: window.innerWidth < 900 ? '200px' : '300px', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default About;
