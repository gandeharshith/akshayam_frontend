import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { contentAPI, categoriesAPI } from '../services/api';
import { Content, Category } from '../types';

const Home: React.FC = () => {
  const [content, setContent] = useState<Content | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeContent, categoriesData] = await Promise.all([
          contentAPI.get('home'),
          categoriesAPI.getAll()
        ]);
        setContent(homeContent);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load content');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 4, md: 8 },
          px: { xs: 2, md: 4 },
          mb: { xs: 3, md: 6 },
          background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
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
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
            lineHeight: 1.2,
            mb: { xs: 2, md: 3 }
          }}
        >
          {content?.title || 'Welcome to Akshayam Wellness'}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: { xs: 3, md: 4 }, 
            maxWidth: 800, 
            mx: 'auto',
            fontSize: { xs: '1rem', md: '1.25rem' },
            px: { xs: 1, sm: 2 }
          }}
        >
          {content?.content || 'Your trusted partner in organic wellness products'}
        </Typography>
        <Button
          variant="contained"
          size={window.innerWidth < 600 ? "medium" : "large"}
          onClick={() => navigate('/products')}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            fontSize: { xs: '0.9rem', md: '1rem' },
            px: { xs: 3, md: 4 },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          Shop Now
        </Button>
      </Box>

      {/* Categories Section */}
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          textAlign="center"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            mb: { xs: 2, md: 3 }
          }}
        >
          Our Product Categories
        </Typography>
        <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mt: 1 }}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category._id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: { xs: 'none', md: 'translateY(-4px)' }
                  },
                  '&:active': {
                    transform: { xs: 'scale(0.98)', md: 'translateY(-4px)' }
                  }
                }}
                onClick={() => navigate(`/products?category=${category._id}`)}
              >
                {category.image_url && (
                  <CardMedia
                    component="img"
                    image={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${category.image_url}`}
                    alt={category.name}
                    sx={{
                      height: { xs: 150, md: 200 },
                      objectFit: 'cover'
                    }}
                  />
                )}
                <CardContent sx={{ p: { xs: 2, md: 2 } }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom
                    sx={{
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.875rem', md: '0.875rem' },
                      lineHeight: 1.4
                    }}
                  >
                    {category.description || 'Explore our organic products in this category'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        py: { xs: 4, md: 6 }, 
        px: { xs: 2, md: 0 },
        backgroundColor: '#f8f9fa', 
        borderRadius: 2 
      }}>
        <Container>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            textAlign="center"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              mb: { xs: 3, md: 4 }
            }}
          >
            Why Choose Akshayam Wellness?
          </Typography>
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', px: { xs: 1, md: 0 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  color="primary"
                  sx={{
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    mb: { xs: 1.5, md: 2 }
                  }}
                >
                  100% Organic
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    lineHeight: { xs: 1.5, md: 1.6 }
                  }}
                >
                  All our products are certified organic and are self products
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', px: { xs: 1, md: 0 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  color="primary"
                  sx={{
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    mb: { xs: 1.5, md: 2 }
                  }}
                >
                  Quality Assured
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    lineHeight: { xs: 1.5, md: 1.6 }
                  }}
                >
                  Every product undergoes rigorous quality checks before reaching you
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', px: { xs: 1, md: 0 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  color="primary"
                  sx={{
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    mb: { xs: 1.5, md: 2 }
                  }}
                >
                  Delivery Schedule
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    lineHeight: { xs: 1.5, md: 1.6 }
                  }}
                >
                  Orders should be placed before every Wednesday 6 PM and the shipment will be delivered on Sunday
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Container>
  );
};

export default Home;
