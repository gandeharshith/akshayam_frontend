import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Paper,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import {
  Park,
  VerifiedUser,
  ArrowForward,
  Star,
  Schedule,
  CheckCircleOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { contentAPI, categoriesAPI, productsAPI } from '../services/api';
import { cachedApiCall } from '../services/cache';
import { Content, Category, Product } from '../types';
import LazyImage from '../components/LazyImage';

const FeaturedProductsBanner: React.FC<{
  newlyLaunched: Product | null;
  thisWeeksFresh: Product | null;
  onNavigate: (categoryId: string) => void;
}> = ({ newlyLaunched, thisWeeksFresh, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const products = [newlyLaunched, thisWeeksFresh].filter(Boolean) as Product[];

  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) return null;

  const currentProduct = products[currentIndex];
  const isNewlyLaunched = currentProduct === newlyLaunched;

  return (
    <Box
      sx={{
        mb: { xs: 4, md: 6 },
        cursor: 'pointer',
        transition: 'all 0.5s ease',
      }}
      onClick={() => onNavigate(currentProduct.category_id)}
    >
      <Paper
        elevation={3}
        sx={{
          background: isNewlyLaunched
            ? 'linear-gradient(135deg, #ffb88c 0%, #ffc891 100%)'
            : 'linear-gradient(135deg, #81c784 0%, #a5d6a7 100%)',
          color: '#333',
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          transition: 'all 0.5s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Box
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              animation: 'bounce 2s infinite',
              '@keyframes bounce': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
              },
            }}
          >
            {isNewlyLaunched ? '🎉' : '🌱'}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1rem', md: '1.3rem' },
                mb: 0.5,
              }}
            >
              {isNewlyLaunched ? 'NEWLY LAUNCHED!' : "THIS WEEK'S FRESH!"}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                opacity: 0.95,
              }}
            >
              {currentProduct.name} - ₹{currentProduct.price}
            </Typography>
          </Box>
        </Box>
        <ArrowForward sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />
      </Paper>
    </Box>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}> = ({ icon, title, description, delay = 0 }) => {
  return (
    <Fade in={true} timeout={1000} style={{ transitionDelay: `${delay}ms` }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          textAlign: 'center',
          height: '100%',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)',
          border: '1px solid rgba(46, 125, 50, 0.08)',
          borderRadius: 4,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #2e7d32, #4caf50, #66bb6a)',
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.4s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 16px 40px rgba(46, 125, 50, 0.15)',
            '&::before': {
              transform: 'scaleX(1)',
            },
            '& .feature-icon': {
              transform: 'scale(1.1) rotate(5deg)',
              color: '#2e7d32',
            }
          }
        }}
      >
        <Box
          className="feature-icon"
          sx={{
            display: 'inline-flex',
            p: 2,
            borderRadius: '50%',
            backgroundColor: 'rgba(46, 125, 50, 0.08)',
            color: '#4caf50',
            mb: 2,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: '2rem'
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
            mb: 2,
            fontSize: { xs: '1.1rem', md: '1.25rem' }
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#666666',
            lineHeight: 1.6,
            fontSize: { xs: '0.9rem', md: '1rem' }
          }}
        >
          {description}
        </Typography>
      </Paper>
    </Fade>
  );
};

const CategoryCard: React.FC<{
  category: Category;
  onNavigate: (categoryId: string) => void;
  delay?: number;
}> = ({ category, onNavigate, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <Grow in={true} timeout={800} style={{ transitionDelay: `${delay}ms` }}>
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)',
          border: '1px solid rgba(46, 125, 50, 0.08)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.8) 0%, rgba(76, 175, 80, 0.6) 100%)',
            opacity: 0,
            transition: 'opacity 0.4s ease',
            zIndex: 1,
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(46, 125, 50, 0.2)',
            '&::before': {
              opacity: 1,
            },
            '& .category-content': {
              color: 'white',
              zIndex: 2,
              position: 'relative',
            },
            '& .category-arrow': {
              opacity: 1,
              transform: 'translateX(8px)',
            }
          },
          // Ensure content is always visible on mobile
          [theme.breakpoints.down('md')]: {
            '& .category-content': {
              backgroundColor: 'rgba(255,255,255,0.95)',
              color: '#1a1a1a !important',
              position: 'relative',
              zIndex: 2,
            },
            '&:hover .category-content': {
              backgroundColor: 'rgba(255,255,255,0.95)',
              color: '#1a1a1a !important',
            }
          },
          '&:active': {
            transform: 'translateY(-4px) scale(0.98)',
          }
        }}
        onClick={() => onNavigate(category._id)}
      >
        {category.image_url && (
          <LazyImage
            src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${category.image_url}`}
            alt={category.name}
            height={200}
            sx={{
              transition: 'transform 0.4s ease',
              height: { xs: 180, md: 220 },
            }}
          />
        )}
        <CardContent
          className="category-content"
          sx={{
            p: { xs: 2.5, md: 3 },
            transition: 'all 0.4s ease',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.3,
                transition: 'color 0.4s ease',
              }}
            >
              {category.name}
            </Typography>
            <ArrowForward
              className="category-arrow"
              sx={{
                opacity: 0,
                transition: 'all 0.4s ease',
                fontSize: '1.2rem',
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: '0.875rem', md: '0.9rem' },
              lineHeight: 1.5,
              opacity: 0.8,
              transition: 'color 0.4s ease',
            }}
          >
            {category.description || 'Discover our organic products in this category'}
          </Typography>
        </CardContent>
      </Card>
    </Grow>
  );
};

const Home: React.FC = () => {
  const [content, setContent] = useState<Content | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<{ newly_launched: Product | null; this_weeks_fresh: Product | null }>({ newly_launched: null, this_weeks_fresh: null });
  const [deliveryContent, setDeliveryContent] = useState<Content | null>(null);
  const [categoriesHeading, setCategoriesHeading] = useState<Content | null>(null);
  const [featuresHeading, setFeaturesHeading] = useState<Content | null>(null);
  const [feature1, setFeature1] = useState<Content | null>(null);
  const [feature2, setFeature2] = useState<Content | null>(null);
  const [feature3, setFeature3] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch critical data first (home content and categories)
        const [homeContent, categoriesData] = await Promise.all([
          cachedApiCall('home-content', () => contentAPI.get('home'), 10 * 60 * 1000), // Cache for 10 minutes
          cachedApiCall('categories', () => categoriesAPI.getAll(), 5 * 60 * 1000) // Cache for 5 minutes
        ]);

        setContent(homeContent);
        setCategories(categoriesData);

        // Fetch featured products
        cachedApiCall('featured-products', () => productsAPI.getFeatured(), 5 * 60 * 1000)
          .then(setFeaturedProducts)
          .catch(() => {
            console.warn('No featured products set');
          });

        // Fetch secondary content in the background (non-blocking)
        Promise.all([
          cachedApiCall('delivery-schedule', () => contentAPI.getSection('delivery', 'schedule'), 30 * 60 * 1000).catch(() => null),
          cachedApiCall('categories-heading', () => contentAPI.getSection('home', 'categories_heading'), 30 * 60 * 1000).catch(() => null),
          cachedApiCall('features-heading', () => contentAPI.getSection('home', 'features_heading'), 30 * 60 * 1000).catch(() => null),
          cachedApiCall('feature-1', () => contentAPI.getSection('home', 'feature_1'), 30 * 60 * 1000).catch(() => null),
          cachedApiCall('feature-2', () => contentAPI.getSection('home', 'feature_2'), 30 * 60 * 1000).catch(() => null),
          cachedApiCall('feature-3', () => contentAPI.getSection('home', 'feature_3'), 30 * 60 * 1000).catch(() => null)
        ]).then(([
          deliveryData,
          categoriesHeadingData,
          featuresHeadingData,
          feature1Data,
          feature2Data,
          feature3Data
        ]) => {
          setDeliveryContent(deliveryData);
          setCategoriesHeading(categoriesHeadingData);
          setFeaturesHeading(featuresHeadingData);
          setFeature1(feature1Data);
          setFeature2(feature2Data);
          setFeature3(feature3Data);
        }).catch(err => {
          console.warn('Error fetching secondary content:', err);
          // Don't set error state for secondary content failures
        });

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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Skeleton */}
        <Box sx={{ textAlign: 'center', py: 8, mb: 6 }}>
          <Skeleton variant="rectangular" height={100} sx={{ mb: 3, borderRadius: 2 }} />
          <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={40} width="60%" sx={{ mx: 'auto', mb: 3 }} />
          <Skeleton variant="rectangular" height={50} width={150} sx={{ mx: 'auto', borderRadius: 3 }} />
        </Box>
        {/* Categories Skeleton */}
        <Grid container spacing={4}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4, mb: 2 }} />
              <Skeleton variant="text" height={30} />
              <Skeleton variant="text" height={20} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.1)'
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  const defaultFeatures = [
    {
      icon: <Park />,
      title: feature1?.title || '100% Organic',
      description: feature1?.content || 'All our products are certified organic or self produced from cow based natural farming'
    },
    {
      icon: <VerifiedUser />,
      title: feature2?.title || 'Quality Assured',
      description: feature2?.content || 'Every product undergoes rigorous quality checks before reaching you'
    },
    {
      icon: <Schedule />,
      title: feature3?.title || 'Delivery Schedule',
      description: feature3?.content || deliveryContent?.content || 'Orders should be placed before every Wednesday 6 PM and the shipment will be delivered on Sunday'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Enhanced Hero Section */}
        <Fade in={true} timeout={1200}>
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              py: { xs: 6, md: 10 },
              px: { xs: 3, md: 6 },
              mb: { xs: 4, md: 8 },
              background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 30%, #4caf50 70%, #66bb6a 100%)',
              color: 'white',
              borderRadius: 6,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
                pointerEvents: 'none',
              }
            }}
          >
            {content?.logo_url && (
              <Box sx={{ mb: { xs: 3, md: 4 }, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <LazyImage
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${content.logo_url}`}
                    alt="Akshayam Wellness Logo"
                    height={isMobile ? 80 : 120}
                    width="auto"
                    sx={{
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                      '& img': {
                        objectFit: 'contain'
                      }
                    }}
                  />
                </Box>
              </Box>
            )}

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{
                  fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 800,
                  lineHeight: { xs: 1.2, md: 1.1 },
                  mb: { xs: 2, md: 3 },
                  letterSpacing: '-0.02em',
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }}
              >
                {content?.title || 'Welcome to Akshayam Wellness'}
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: { xs: 3, md: 4 },
                  maxWidth: 900,
                  mx: 'auto',
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.4rem' },
                  fontWeight: 400,
                  px: { xs: 2, sm: 4 },
                  opacity: 0.95,
                  lineHeight: 1.5,
                }}
              >
                {content?.content || 'Your trusted partner in organic wellness products'}
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 3, md: 2 }, 
                justifyContent: 'center', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                maxWidth: { xs: '100%', sm: 'auto' },
                px: { xs: 2, sm: 0 }
              }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/products')}
                  endIcon={<ArrowForward />}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#2e7d32',
                    fontSize: { xs: '1.1rem', md: '1.1rem' },
                    px: { xs: 5, md: 5 },
                    py: { xs: 2, md: 2 },
                    minHeight: { xs: '52px', md: '56px' },
                    minWidth: { xs: '200px', sm: 'auto' },
                    fontWeight: 700,
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      backgroundColor: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                    },
                    '&:active': {
                      transform: 'translateY(0) scale(0.98)',
                    }
                  }}
                >
                  Shop Now
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/about')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    fontSize: { xs: '1.1rem', md: '1.1rem' },
                    px: { xs: 5, md: 5 },
                    py: { xs: 2, md: 2 },
                    minHeight: { xs: '52px', md: '56px' },
                    minWidth: { xs: '200px', sm: 'auto' },
                    fontWeight: 600,
                    borderRadius: 3,
                    textTransform: 'none',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0) scale(0.98)',
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>

            {/* Floating Quality Indicators */}
            <Box
              sx={{
                position: 'absolute',
                top: { xs: 20, md: 30 },
                right: { xs: 20, md: 30 },
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                zIndex: 1,
              }}
            >
              <Chip
                icon={<Star sx={{ color: '#ffd700 !important' }} />}
                label="Premium Quality"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              />
              <Chip
                icon={<CheckCircleOutline sx={{ color: '#4caf50 !important' }} />}
                label="Certified Organic"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              />
            </Box>
          </Paper>
        </Fade>

        {/* Featured Products Scrolling Banner */}
        {(featuredProducts.newly_launched || featuredProducts.this_weeks_fresh) && (
          <FeaturedProductsBanner 
            newlyLaunched={featuredProducts.newly_launched}
            thisWeeksFresh={featuredProducts.this_weeks_fresh}
            onNavigate={(categoryId) => navigate(`/products?category=${categoryId}`)}
          />
        )}

        {/* Enhanced Categories Section */}
        <Box sx={{ mb: { xs: 6, md: 10 } }}>
          <Fade in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: 700,
                  mb: 2,
                  color: '#1a1a1a',
                  letterSpacing: '-0.01em',
                }}
              >
                {categoriesHeading?.title || 'Our Product Categories'}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#666666',
                  maxWidth: 600,
                  mx: 'auto',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.6,
                }}
              >
                Discover our carefully curated selection of organic wellness products
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <CategoryCard
                  category={category}
                  onNavigate={(categoryId) => navigate(`/products?category=${categoryId}`)}
                  delay={index * 150}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Enhanced Features Section */}
        <Paper
          elevation={0}
          sx={{
            py: { xs: 6, md: 10 },
            px: { xs: 3, md: 6 },
            background: 'linear-gradient(135deg, #f8fff8 0%, #ffffff 50%, #f0f9ff 100%)',
            borderRadius: 6,
            border: '1px solid rgba(46, 125, 50, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 80% 20%, rgba(46, 125, 50, 0.03) 0%, transparent 50%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Container maxWidth="lg">
            <Fade in={true} timeout={1000}>
              <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h2"
                  component="h2"
                  sx={{
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    fontWeight: 700,
                    mb: 2,
                    color: '#1a1a1a',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {featuresHeading?.title || 'Why Choose Akshayam Wellness?'}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#666666',
                    maxWidth: 700,
                    mx: 'auto',
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    lineHeight: 1.6,
                  }}
                >
                  Experience the difference of authentic organic products with our commitment to quality and sustainability
                </Typography>
              </Box>
            </Fade>

            <Grid container spacing={{ xs: 4, md: 5 }} sx={{ position: 'relative', zIndex: 1 }}>
              {defaultFeatures.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    delay={index * 200}
                  />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
