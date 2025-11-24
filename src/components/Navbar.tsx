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
  Alert
} from '@mui/material';
import {
  ShoppingCart,
  Menu as MenuIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Store as StoreIcon,
  Assignment as OrdersIcon,
  Close as CloseIcon,
  MenuBook as RecipesIcon
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
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'About', path: '/about', icon: <InfoIcon /> },
    { text: 'Products', path: '/products', icon: <StoreIcon /> },
    { text: 'Healthy Recipes', path: '/recipes', icon: <RecipesIcon /> },
    { text: 'My Orders', path: '/my-orders', icon: <OrdersIcon /> }
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleCartClick = async () => {
    // If cart is empty, just navigate to cart
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    try {
      // Validate stock when user clicks on cart icon
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
        // Still navigate to cart so user can see the errors and adjust quantities
        navigate('/cart');
      } else {
        // If validation passes, navigate to cart normally
        navigate('/cart');
      }
    } catch (err) {
      console.error('Error validating stock:', err);
      // Still navigate to cart even if validation fails
      navigate('/cart');
    }
  };

  const handleCloseStockAlert = () => {
    setShowStockAlert(false);
    setStockErrors([]);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#4caf50' }}>
        <Container maxWidth="xl">
          <Toolbar>
            <Typography
              variant={isMobile ? "h6" : "h6"}
              component={Link}
              to="/"
              sx={{
                flexGrow: 1,
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 'bold',
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}
            >
              {isMobile ? "Akshayam" : "Akshayam Wellness"}
            </Typography>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    component={Link}
                    to={item.path}
                    sx={{
                      backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}
            
            {/* Cart Icon */}
            <IconButton
              color="inherit"
              onClick={handleCartClick}
              title="View Cart"
              sx={{ ml: isMobile ? 1 : 2 }}
            >
              <Badge badgeContent={itemCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={handleMobileMenuToggle}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
            Menu
          </Typography>
          <IconButton onClick={handleMobileMenuToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleMobileNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#e8f5e8',
                    '& .MuiListItemText-primary': {
                      color: '#2e7d32',
                      fontWeight: 'bold'
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? '#2e7d32' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Stock Validation Alert */}
      <Snackbar
        open={showStockAlert}
        autoHideDuration={5000}
        onClose={handleCloseStockAlert}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        sx={{ mt: 8 }} // Add margin to avoid navbar overlap
      >
        <Alert
          onClose={handleCloseStockAlert}
          severity="warning"
          variant="filled"
          sx={{ width: '100%' }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Stock Availability Issues:
            </Typography>
            {stockErrors.map((error, index) => (
              <Typography key={index} variant="body2" sx={{ fontSize: '0.875rem' }}>
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
