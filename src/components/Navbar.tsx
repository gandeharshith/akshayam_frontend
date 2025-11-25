import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Badge,
  IconButton,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Divider,
  Snackbar,
  Alert,
  Slide,
  Fade,
  Chip
} from '@mui/material';
import {
  ShoppingCart,
  Menu as MenuIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Store as StoreIcon,
  Assignment as OrdersIcon,
  Close as CloseIcon,
  MenuBook as RecipesIcon,
  LocalFlorist,
  KeyboardArrowRight
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { stockAPI } from '../services/api';
import { StockValidationItem } from '../types';

const Navbar: React.FC = () => {
  const { itemCount, items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stockErrors, setStockErrors] = useState<string[]>([]);
  const [showStockAlert, setShowStockAlert] = useState(false);

  const menuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon />, description: 'Welcome page' },
    { text: 'About', path: '/about', icon: <InfoIcon />, description: 'Our story' },
    { text: 'Products', path: '/products', icon: <StoreIcon />, description: 'Shop organic' },
    { text: 'Healthy Recipes', path: '/recipes', icon: <RecipesIcon />, description: 'Nutrition guides' },
    { text: 'My Orders', path: '/my-orders', icon: <OrdersIcon />, description: 'Order history' }
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleCartClick = async () => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    try {
      const stockValidationItems: StockValidationItem[] = items.map(item => ({
        product_id: item.product._id,
        quantity: item.quantity
      }));

      const validationResult = await stockAPI.validateStock({
        items: stockValidationItems
      });

      if (!validationResult.valid) {
        const errorMessages = validationResult.invalid_items.map(item => item.error);
        setStockErrors(errorMessages);
        setShowStockAlert(true);
        navigate('/cart');
      } else {
        navigate('/cart');
      }
    } catch (err) {
      console.error('Error validating stock:', err);
      navigate('/cart');
    }
  };

  const handleCloseStockAlert = () => {
    setShowStockAlert(false);
    setStockErrors([]);
  };

  return (
    <>
      {/* Enhanced AppBar with gradient and blur effect */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 50%, #4caf50 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth="xl">
            <Toolbar sx={{ py: { xs: 1.5, md: 1.5 }, minHeight: { xs: '64px', md: 'auto' } }}>
            {/* Logo and Brand */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                flexGrow: 1,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                }
              }}
            >
              <LocalFlorist 
                sx={{ 
                  mr: 1.5, 
                  fontSize: { xs: 24, md: 28 },
                  color: 'rgba(255,255,255,0.9)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }} 
              />
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    lineHeight: 1.2
                  }}
                >
                  {isMobile ? "Akshayam" : "Akshayam Wellness"}
                </Typography>
                {!isMobile && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      letterSpacing: '0.5px'
                    }}
                  >
                    Organic • Natural • Pure
                  </Typography>
                )}
              </Box>
            </Box>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mr: 2 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      px: 2.5,
                      py: 1,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      letterSpacing: '0.01em',
                      position: 'relative',
                      backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
                      backdropFilter: location.pathname === item.path ? 'blur(10px)' : 'none',
                      border: location.pathname === item.path ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                      boxShadow: location.pathname === item.path ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(10px)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '& .MuiButton-startIcon': {
                        marginRight: '8px',
                        fontSize: '1.1rem'
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}
            
            {/* Cart Icon with enhanced styling */}
            <IconButton
              color="inherit"
              onClick={handleCartClick}
              title="View Cart"
              sx={{ 
                ml: isMobile ? 1 : 0,
                mr: isMobile ? 1 : 0,
                p: 1.5,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                },
                '&:active': {
                  transform: 'translateY(-1px)',
                }
              }}
            >
              <Badge 
                badgeContent={itemCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#ff4444',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    minWidth: '20px',
                    height: '20px',
                    borderRadius: '10px',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }
                }}
              >
                <ShoppingCart sx={{ fontSize: '1.3rem' }} />
              </Badge>
            </IconButton>

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={handleMobileMenuToggle}
                sx={{ 
                  p: 1.5,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    transform: 'rotate(90deg)',
                  }
                }}
              >
                <MenuIcon sx={{ fontSize: '1.3rem' }} />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Enhanced Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        transitionDuration={400}
        sx={{
          '& .MuiDrawer-paper': {
            width: 320,
            background: 'linear-gradient(135deg, #f8fffe 0%, #ffffff 100%)',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.1)',
            borderLeft: '1px solid rgba(46, 125, 50, 0.1)',
          }
        }}
      >
        <Slide direction="left" in={mobileMenuOpen} timeout={400}>
          <Box>
            {/* Drawer Header */}
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
              color: 'white',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalFlorist sx={{ mr: 1, fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    Menu
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    Navigate our store
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                onClick={handleMobileMenuToggle}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    transform: 'rotate(90deg)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Menu Items */}
            <List sx={{ px: 1, py: 2 }}>
              {menuItems.map((item, index) => (
                <Fade in={mobileMenuOpen} timeout={500 + index * 100} key={item.path}>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => handleMobileNavigation(item.path)}
                      selected={location.pathname === item.path}
                      sx={{
                        borderRadius: 3,
                        px: 2,
                        py: 1.5,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(46, 125, 50, 0.08)',
                          borderLeft: '4px solid #2e7d32',
                          '& .MuiListItemText-primary': {
                            color: '#2e7d32',
                            fontWeight: 700,
                          },
                          '& .MuiListItemText-secondary': {
                            color: '#388e3c',
                          },
                          '& .MuiListItemIcon-root': {
                            color: '#2e7d32',
                          }
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(46, 125, 50, 0.05)',
                          transform: 'translateX(8px)',
                          '& .MuiSvgIcon-root:last-child': {
                            transform: 'translateX(4px)',
                          }
                        }
                      }}
                    >
                      <ListItemIcon sx={{ 
                        minWidth: 48,
                        color: location.pathname === item.path ? '#2e7d32' : '#666666',
                        transition: 'color 0.3s ease'
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        secondary={item.description}
                        primaryTypographyProps={{
                          fontWeight: location.pathname === item.path ? 700 : 500,
                          fontSize: '1rem',
                          color: location.pathname === item.path ? '#2e7d32' : '#1a1a1a'
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.8rem',
                          color: location.pathname === item.path ? '#388e3c' : '#666666'
                        }}
                      />
                      <KeyboardArrowRight 
                        sx={{ 
                          color: '#ccc', 
                          fontSize: '1.2rem',
                          transition: 'transform 0.3s ease'
                        }} 
                      />
                    </ListItemButton>
                  </ListItem>
                </Fade>
              ))}
            </List>

            {/* Cart Status in Mobile Menu */}
            <Box sx={{ px: 3, pb: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Chip
                icon={<ShoppingCart />}
                label={`Cart (${itemCount} items)`}
                onClick={() => {
                  handleCartClick();
                  setMobileMenuOpen(false);
                }}
                sx={{
                  width: '100%',
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  backgroundColor: itemCount > 0 ? '#2e7d32' : '#e0e0e0',
                  color: itemCount > 0 ? 'white' : '#666666',
                  '&:hover': {
                    backgroundColor: itemCount > 0 ? '#1b5e20' : '#d0d0d0',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.3s ease'
                }}
              />
            </Box>
          </Box>
        </Slide>
      </Drawer>

      {/* Enhanced Stock Validation Alert */}
      <Snackbar
        open={showStockAlert}
        autoHideDuration={6000}
        onClose={handleCloseStockAlert}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        sx={{ 
          mt: 8,
          zIndex: 1400
        }}
      >
        <Alert
          onClose={handleCloseStockAlert}
          severity="warning"
          variant="filled"
          sx={{ 
            width: '100%',
            maxWidth: 500,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
              Stock Availability Issues
            </Typography>
            {stockErrors.map((error, index) => (
              <Typography key={index} variant="body2" sx={{ 
                fontSize: '0.875rem',
                opacity: 0.95,
                '&:not(:last-child)': { mb: 0.5 }
              }}>
                • {error}
              </Typography>
            ))}
          </Box>
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
