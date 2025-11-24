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
  const [missionContent, setMissionContent] = useState<Content | null>(null);
  const [valuesContent, setValuesContent] = useState<Content | null>(null);
  const [organicContent, setOrganicContent] = useState<Content | null>(null);
  const [certificationsContent, setCertificationsContent] = useState<Content | null>(null);
  const [satisfactionContent, setSatisfactionContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [
          aboutContent,
          missionData,
          valuesData,
          organicData,
          certificationsData,
          satisfactionData
        ] = await Promise.all([
          contentAPI.get('about'),
          contentAPI.getSection('about', 'mission').catch(() => null),
          contentAPI.getSection('about', 'values').catch(() => null),
          contentAPI.getSection('about', 'organic').catch(() => null),
          contentAPI.getSection('about', 'certifications').catch(() => null),
          contentAPI.getSection('about', 'satisfaction').catch(() => null)
        ]);
        setContent(aboutContent);
        setMissionContent(missionData);
        setValuesContent(valuesData);
        setOrganicContent(organicData);
        setCertificationsContent(certificationsData);
        setSatisfactionContent(satisfactionData);
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
              {missionContent?.title || 'Our Mission'}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: { xs: 1.6, md: 1.8 }, 
                mb: 3,
                fontSize: { xs: '0.95rem', md: '1rem' }
              }}
            >
              {missionContent?.content || 'To promote healthier living by providing access to authentic, organic wellness products that nourish the body and mind while supporting sustainable farming practices.'}
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
              {valuesContent?.title || 'Our Values'}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: { xs: 1.6, md: 1.8 }, 
                mb: 3,
                fontSize: { xs: '0.95rem', md: '1rem' },
                whiteSpace: 'pre-line'
              }}
            >
              {valuesContent?.content || `• Quality First: We source only the finest organic products
• Sustainability: Supporting eco-friendly farming practices  
• Transparency: Clear information about product origins
• Customer Care: Dedicated to your wellness journey`}
            </Typography>
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
              {organicContent?.title || 'Why Choose Organic?'}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: { xs: 1.5, md: 1.6 },
                fontSize: { xs: '0.85rem', md: '0.875rem' }
              }}
            >
              {organicContent?.content || 'Organic products are grown without harmful pesticides, synthetic fertilizers, or GMOs. They\'re not only better for your health but also for the environment.'}
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
              {certificationsContent?.title || 'Our Certifications'}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: { xs: 1.5, md: 1.6 },
                fontSize: { xs: '0.85rem', md: '0.875rem' }
              }}
            >
              {certificationsContent?.content || 'All our products are certified organic by recognized authorities, ensuring you receive genuine, high-quality wellness products.'}
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
              {satisfactionContent?.title || 'Customer Satisfaction'}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: { xs: 1.5, md: 1.6 },
                fontSize: { xs: '0.85rem', md: '0.875rem' }
              }}
            >
              {satisfactionContent?.content || 'With thousands of happy customers, we take pride in our commitment to quality and service excellence.'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default About;
