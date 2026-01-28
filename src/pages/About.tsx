import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
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

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        {content?.logo_url ? (
          // Layout with logo - text flows around and below the image
          <Box sx={{ position: 'relative' }}>
            {/* Logo positioned on right */}
            <Box sx={{ 
              float: { xs: 'none', md: 'right' },
              ml: { xs: 0, md: 3 },
              mb: { xs: 2, md: 2 },
              textAlign: { xs: 'center', md: 'right' }
            }}>
              <img
                src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${content.logo_url}`}
                alt="Akshayam Wellness Logo"
                style={{ 
                  maxWidth: window.innerWidth < 900 ? '300px' : '400px',
                  maxHeight: window.innerWidth < 900 ? '300px' : '400px', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}
              />
            </Box>
            
            {/* Text that flows around and below the image */}
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: { xs: 1.3, md: 1.4 }, 
                fontSize: { xs: '0.875rem', md: '0.95rem' },
                textAlign: 'justify',
                whiteSpace: 'pre-line',
                '&::after': {
                  content: '""',
                  display: 'table',
                  clear: 'both'
                }
              }}
            >
              {content?.content || `Founded with a mission to provide pure, organic products, Akshayam Wellness has been serving customers with premium quality natural products. Our commitment to sustainability and health drives everything we do.

              We believe in the power of nature to heal and nourish. Every product in our collection is carefully sourced and quality-tested to ensure you receive only the best. From traditional wellness practices to modern organic innovations, we bridge the gap between ancient wisdom and contemporary health needs.

              Our dedication to quality extends beyond just sourcing - we ensure that every step of our process, from procurement to packaging, meets the highest standards. This commitment has earned us the trust of customers who rely on us for their wellness journey.

              At Akshayam Wellness, we understand that true health comes from natural solutions. That's why we work closely with organic farmers and trusted suppliers to bring you products that are not only effective but also ethically sourced and environmentally sustainable.`}
            </Typography>
          </Box>
        ) : (
          // Layout without logo - full width text
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: { xs: 1.3, md: 1.4 }, 
              fontSize: { xs: '0.875rem', md: '0.95rem' },
              textAlign: 'justify',
              whiteSpace: 'pre-line'
            }}
          >
            {content?.content || `Founded with a mission to provide pure, organic products, 
            Akshayam Wellness has been serving customers with premium quality natural products. 
            Our commitment to sustainability and health drives everything we do.

            We believe in the power of nature to heal and nourish. Every product in our collection is carefully sourced and quality-tested to ensure you receive only the best. From traditional wellness practices to modern organic innovations, we bridge the gap between ancient wisdom and contemporary health needs.`}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default About;
