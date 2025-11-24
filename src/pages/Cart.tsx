import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCartOutlined,
  ArrowBack
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ordersAPI, stockAPI } from '../services/api';
import { User, OrderItem, StockValidationItem, OrderCreateError } from '../types';

const Cart: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [stockValidationErrors, setStockValidationErrors] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<User & { password: string }>({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  const {
    items,
    total,
    itemCount,
    removeItem,
    updateQuantity,
    clearCart
  } = useCart();

  const validateStock = async () => {
    if (items.length === 0) return true;

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
        setStockValidationErrors(errorMessages);
        return false;
      }

      setStockValidationErrors([]);
      return true;
    } catch (err) {
      console.error('Error validating stock:', err);
      setStockValidationErrors(['Unable to validate stock availability. Please try again.']);
      return false;
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setOrderLoading(true);
    
    try {
      const orderItems: OrderItem[] = items.map(item => ({
        product_id: item.product._id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        total: item.product.price * item.quantity
      }));

      await ordersAPI.create({
        user_info: userInfo,
        items: orderItems
      });

      clearCart();
      setCheckoutOpen(false);
      setStockValidationErrors([]);
      setUserInfo({ name: '', email: '', phone: '', address: '', password: '' });
      alert('Order placed successfully!');
      navigate('/my-orders');
    } catch (err: any) {
      console.error('Error placing order:', err);
      
      // Handle detailed stock validation errors from the backend
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        setStockValidationErrors(Array.isArray(backendErrors) ? backendErrors : [backendErrors]);
      } else if (err.response?.data?.detail?.errors) {
        setStockValidationErrors(err.response.data.detail.errors);
      } else {
        setStockValidationErrors(['Failed to place order. Please try again.']);
      }
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCheckoutOpen = async () => {
    if (items.length === 0) return;
    
    setStockValidationErrors([]);
    
    try {
      // Validate stock when user clicks "Proceed to Checkout"
      const stockValidationItems: StockValidationItem[] = items.map(item => ({
        product_id: item.product._id,
        quantity: item.quantity
      }));

      const validationResult = await stockAPI.validateStock({
        items: stockValidationItems
      });

      if (!validationResult.valid) {
        const errorMessages = validationResult.invalid_items.map(item => item.error);
        setStockValidationErrors(errorMessages);
        return; // Don't open checkout dialog if validation fails
      }

      // If validation passes, open checkout dialog
      setStockValidationErrors([]);
      setCheckoutOpen(true);
    } catch (err) {
      console.error('Error validating stock:', err);
      setStockValidationErrors(['Unable to validate stock availability. Please try again.']);
    }
  };

  const isFormValid = () => {
    return userInfo.name && userInfo.email && userInfo.phone && userInfo.address && userInfo.password;
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: { xs: 3, md: 4 },
        gap: 2
      }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          variant="outlined"
          size={isMobile ? "medium" : "medium"}
        >
          Continue Shopping
        </Button>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1"
          sx={{ flex: 1, textAlign: 'center' }}
        >
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </Typography>
      </Box>

      {items.length === 0 ? (
        /* Empty Cart */
        <Box sx={{ 
          textAlign: 'center', 
          py: { xs: 4, md: 8 },
          px: 2 
        }}>
          <ShoppingCartOutlined 
            sx={{ 
              fontSize: { xs: 60, md: 80 }, 
              color: 'text.secondary', 
              mb: 2 
            }} 
          />
          <Typography 
            variant="h5" 
            color="text.secondary" 
            gutterBottom
            sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
          >
            Your cart is empty
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 3 }}
          >
            Add some products to get started
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/products"
            sx={{ 
              px: { xs: 3, md: 4 },
              py: { xs: 1.5, md: 1.5 }
            }}
          >
            Browse Products
          </Button>
        </Box>
      ) : (
        /* Cart with Items */
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Card elevation={isMobile ? 1 : 2}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
                >
                  Cart Items
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List sx={{ p: 0 }}>
                  {items.map((item, index) => (
                    <React.Fragment key={item.product._id}>
                      <ListItem 
                        sx={{ 
                          px: 0, 
                          py: 2,
                          flexDirection: isMobile ? 'column' : 'row',
                          alignItems: isMobile ? 'stretch' : 'center',
                          gap: isMobile ? 2 : 0
                        }}
                      >
                        {/* Product Image */}
                        {item.product.image_url && (
                          <Box
                            sx={{
                              width: { xs: '100%', sm: 80 },
                              height: { xs: 120, sm: 80 },
                              mr: { xs: 0, sm: 2 },
                              mb: { xs: 1, sm: 0 },
                              borderRadius: 1,
                              overflow: 'hidden',
                              backgroundColor: '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <img
                              src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${item.product.image_url}`}
                              alt={item.product.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </Box>
                        )}
                        
                        {/* Product Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontSize: { xs: '1rem', md: '1.1rem' },
                                  fontWeight: 500,
                                  mb: 0.5
                                }}
                              >
                                {item.product.name}
                              </Typography>
                            }
                            secondary={
                              <Typography 
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.875rem', md: '0.875rem' } }}
                              >
                                ₹{item.product.price} each
                              </Typography>
                            }
                          />
                        </Box>

                        {/* Quantity Controls */}
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: isMobile ? 'row' : 'row',
                          alignItems: 'center',
                          justifyContent: isMobile ? 'space-between' : 'flex-end',
                          gap: 2,
                          width: isMobile ? '100%' : 'auto'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Remove />
                            </IconButton>
                            <Typography 
                              sx={{ 
                                minWidth: 40, 
                                textAlign: 'center',
                                fontSize: { xs: '1rem', md: '1rem' },
                                fontWeight: 500
                              }}
                            >
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            >
                              <Add />
                            </IconButton>
                          </Box>
                          
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              minWidth: 80,
                              textAlign: 'right',
                              fontSize: { xs: '1rem', md: '1.1rem' },
                              fontWeight: 'bold'
                            }}
                          >
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </Typography>
                          
                          <IconButton
                            color="error"
                            onClick={() => removeItem(item.product._id)}
                            size={isMobile ? "medium" : "small"}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </ListItem>
                      {index < items.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card elevation={isMobile ? 1 : 2} sx={{ position: { md: 'sticky' }, top: { md: 20 } }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
                >
                  Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Items ({itemCount}):</Typography>
                    <Typography variant="body2">₹{total.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Shipping:</Typography>
                    <Typography variant="body2" color="success.main">Free</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography 
                      variant="h6"
                      sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
                    >
                      Total:
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="primary"
                      sx={{ 
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                        fontWeight: 'bold'
                      }}
                    >
                      ₹{total.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {/* Stock Validation Error Messages */}
                {stockValidationErrors.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {stockValidationErrors.map((error, index) => (
                      <Alert key={index} severity="error" sx={{ mb: 1, fontSize: '0.875rem' }}>
                        {error}
                      </Alert>
                    ))}
                  </Box>
                )}

                <Alert severity="info" sx={{ mb: 3, fontSize: '0.875rem' }}>
                  Orders should be placed before every Wednesday 6 PM and will be delivered on Sunday
                </Alert>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleCheckoutOpen}
                  sx={{
                    py: { xs: 1.5, md: 1.5 },
                    fontSize: { xs: '1rem', md: '1rem' },
                    fontWeight: 'bold'
                  }}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Checkout Dialog */}
      <Dialog 
        open={checkoutOpen} 
        onClose={() => setCheckoutOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{
          fontSize: { xs: '1.1rem', md: '1.25rem' },
          pb: { xs: 1, md: 2 }
        }}>
          Checkout
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          {/* Stock Validation Error Messages */}
          {stockValidationErrors.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {stockValidationErrors.map((error, index) => (
                <Alert key={index} severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              ))}
            </Box>
          )}
          
          <Grid container spacing={{ xs: 2, md: 2 }} sx={{ mt: { xs: 0.5, md: 1 } }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={userInfo.name}
                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userInfo.email}
                onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={userInfo.phone}
                onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={isMobile ? 3 : 2}
                value={userInfo.address}
                onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password (for order tracking)"
                type="password"
                value={userInfo.password}
                onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                required
                helperText="You'll need this password to check your order status"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: { xs: 2, md: 3 } }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
            >
              Order Summary
            </Typography>
            <Box sx={{ 
              maxHeight: { xs: 150, md: 200 }, 
              overflow: 'auto',
              mb: 2
            }}>
              {items.map((item) => (
                <Box key={item.product._id} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 1,
                  alignItems: 'flex-start'
                }}>
                  <Typography sx={{ fontSize: '0.875rem', flex: 1, pr: 1 }}>
                    {item.product.name} x {item.quantity}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Total:
              </Typography>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                ₹{total.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 3, md: 3 }, 
          pb: { xs: 3, md: 2 },
          gap: 1,
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <Button 
            onClick={() => setCheckoutOpen(false)}
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCheckout}
            variant="contained"
            disabled={!isFormValid() || orderLoading}
            fullWidth={isMobile}
            sx={{ minWidth: { xs: 'auto', md: 120 } }}
          >
            {orderLoading ? <CircularProgress size={20} /> : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cart;
