import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Alert
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
      <Box sx={{ 
        textAlign: 'center', 
        mb: { xs: 4, md: 6 },
        px: { xs: 1, md: 0 }
      }}>
        {content?.logo_url && (
          <Box sx={{ mb: { xs: 2, md: 3 }, display: 'flex', justifyContent: 'center' }}>
            <img
              src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${content.logo_url}`}
              alt="Akshayam Wellness Logo"
              style={{ 
                maxHeight: window.innerWidth < 600 ? 80 : 120, 
                objectFit: 'contain' 
              }}
            />
          </Box>
        )}
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
            lineHeight: 1.2,
            mb: { xs: 2, md: 3 }
          }}
        >
          {content?.title || 'About Akshayam Wellness'}
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 3, md: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 3, md: 4 } }}>
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: { xs: 1.6, md: 1.8 }, 
                mb: 3,
                fontSize: { xs: '0.95rem', md: '1rem' }
              }}
            >
              {content?.content || `Founded with a mission to provide pure, organic products, 
              Akshayam Wellness has been serving customers with premium quality natural products. 
              Our commitment to sustainability and health drives everything we do.`}
            </Typography>
            
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                mt: { xs: 3, md: 4 }, 
                color: 'primary.main',
                fontSize: { xs: '1.25rem', md: '1.5rem' }
              }}
            >
              Our Mission
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: { xs: 1.6, md: 1.8 }, 
                mb: 3,
                fontSize: { xs: '0.95rem', md: '1rem' }
              }}
            >
              To promote healthier living by providing access to authentic, organic wellness products 
              that nourish the body and mind while supporting sustainable farming practices.
            </Typography>

            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                mt: { xs: 3, md: 4 }, 
                color: 'primary.main',
                fontSize: { xs: '1.25rem', md: '1.5rem' }
              }}
            >
              Our Values
            </Typography>
            <Box component="ul" sx={{ pl: { xs: 2, md: 3 } }}>
              <Typography 
                component="li" 
                variant="body1" 
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  lineHeight: { xs: 1.5, md: 1.6 }
                }}
              >
                <strong>Quality First:</strong> We source only the finest organic products
              </Typography>
              <Typography 
                component="li" 
                variant="body1" 
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  lineHeight: { xs: 1.5, md: 1.6 }
                }}
              >
                <strong>Sustainability:</strong> Supporting eco-friendly farming practices
              </Typography>
              <Typography 
                component="li" 
                variant="body1" 
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  lineHeight: { xs: 1.5, md: 1.6 }
                }}
              >
                <strong>Transparency:</strong> Clear information about product origins
              </Typography>
              <Typography 
                component="li" 
                variant="body1" 
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  lineHeight: { xs: 1.5, md: 1.6 }
                }}
              >
                <strong>Customer Care:</strong> Dedicated to your wellness journey
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 3 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              color="primary"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              Why Choose Organic?
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: { xs: 1.5, md: 1.6 },
                fontSize: { xs: '0.85rem', md: '0.875rem' }
              }}
            >
              Organic products are grown without harmful pesticides, synthetic fertilizers, 
              or GMOs. They're not only better for your health but also for the environment.
            </Typography>
          </Paper>

          <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 3 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              color="primary"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              Our Certifications
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: { xs: 1.5, md: 1.6 },
                fontSize: { xs: '0.85rem', md: '0.875rem' }
              }}
            >
              All our products are certified organic by recognized authorities, ensuring 
              you receive genuine, high-quality wellness products.
            </Typography>
          </Paper>

          <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              color="primary"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              Customer Satisfaction
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: { xs: 1.5, md: 1.6 },
                fontSize: { xs: '0.85rem', md: '0.875rem' }
              }}
            >
              With thousands of happy customers, we take pride in our commitment to 
              quality and service excellence.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default About;
