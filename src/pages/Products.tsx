import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
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
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  Close
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI, ordersAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { Product, Category, User, OrderItem } from '../types';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<User & { password: string }>({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [searchParams] = useSearchParams();
  const {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll()
        ]);
        setCategories(categoriesData);
        setProducts(productsData);

        // Set category from URL params if provided
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      if (selectedCategory) {
        try {
          const filteredProducts = await productsAPI.getAll(selectedCategory);
          setProducts(filteredProducts);
        } catch (err) {
          console.error('Error filtering products:', err);
        }
      } else {
        try {
          const allProducts = await productsAPI.getAll();
          setProducts(allProducts);
        } catch (err) {
          console.error('Error fetching all products:', err);
        }
      }
    };

    if (!loading) {
      fetchFilteredProducts();
    }
  }, [selectedCategory, loading]);

  const handleAddToCart = (product: Product) => {
    if (product.quantity > 0) {
      addItem(product);
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
      setUserInfo({ name: '', email: '', phone: '', address: '', password: '' });
      alert('Order placed successfully!');
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  const isFormValid = () => {
    return userInfo.name && userInfo.email && userInfo.phone && userInfo.address && userInfo.password;
  };

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
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        mb: { xs: 3, md: 4 }
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Our Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={() => setCartOpen(true)}
          disabled={itemCount === 0}
          sx={{
            alignSelf: { xs: 'stretch', sm: 'auto' },
            fontSize: { xs: '0.875rem', md: '0.875rem' },
            py: { xs: 1.5, md: 1 }
          }}
        >
          Cart ({itemCount})
        </Button>
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <FormControl 
          sx={{ 
            minWidth: { xs: '100%', sm: 250 },
            maxWidth: { xs: '100%', sm: 300 }
          }}
        >
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Filter by Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
            size={window.innerWidth < 600 ? "medium" : "medium"}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              '&:hover': {
                transform: { xs: 'none', md: 'translateY(-2px)' },
                transition: 'transform 0.2s'
              }
            }}>
              {product.image_url ? (
                <Box
                  sx={{
                    height: { xs: 180, md: 200 },
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  <img
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${product.image_url}`}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      // Handle failed image loads by hiding the image
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // Show "No Image" fallback
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #666; font-size: 14px;">Image not available</div>';
                      }
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: { xs: 180, md: 200 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    color: 'text.secondary'
                  }}
                >
                  <Typography variant="body2">No Image</Typography>
                </Box>
              )}
              <CardContent sx={{ 
                flexGrow: 1,
                p: { xs: 2, md: 2 }
              }}>
                <Typography 
                  variant="h6" 
                  component="h3" 
                  gutterBottom
                  sx={{
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    lineHeight: 1.3
                  }}
                >
                  {product.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    fontSize: { xs: '0.875rem', md: '0.875rem' },
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {product.description}
                </Typography>
                <Typography 
                  variant="h6" 
                  color="primary.main"
                  sx={{
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    fontWeight: 'bold'
                  }}
                >
                  ₹{product.price}
                </Typography>
                <Chip
                  label={product.quantity > 0 ? 'Available' : 'Sold Out'}
                  color={product.quantity > 0 ? 'success' : 'error'}
                  size="small"
                  sx={{ 
                    mt: 1,
                    fontSize: { xs: '0.75rem', md: '0.75rem' }
                  }}
                />
              </CardContent>
              <CardActions sx={{ p: { xs: 2, md: 2 }, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.quantity === 0}
                  sx={{
                    fontSize: { xs: '0.875rem', md: '0.875rem' },
                    py: { xs: 1, md: 1 }
                  }}
                >
                  {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Shopping Cart Drawer */}
      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        PaperProps={{ 
          sx: { 
            width: { xs: '100%', sm: 400 },
            maxWidth: 400
          } 
        }}
      >
        <Box sx={{ p: { xs: 2, md: 2 } }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Typography 
              variant="h6"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              Shopping Cart
            </Typography>
            <IconButton onClick={() => setCartOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {items.length === 0 ? (
            <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              Your cart is empty
            </Typography>
          ) : (
            <>
              <List sx={{ maxHeight: { xs: '60vh', md: 'none' }, overflow: 'auto' }}>
                {items.map((item) => (
                  <ListItem key={item.product._id} sx={{ px: 0, pb: 2 }}>
                    <Box sx={{ width: '100%' }}>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontSize: { xs: '0.95rem', md: '1rem' },
                              fontWeight: 500
                            }}
                          >
                            {item.product.name}
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontSize: { xs: '0.85rem', md: '0.875rem' }
                            }}
                          >
                            ₹{item.product.price} each
                          </Typography>
                        }
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        mt: 1,
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                        gap: 1
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          >
                            <Remove />
                          </IconButton>
                          <Typography 
                            sx={{ 
                              minWidth: 30, 
                              textAlign: 'center',
                              fontSize: { xs: '0.9rem', md: '1rem' }
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
                        <Button
                          size="small"
                          color="error"
                          onClick={() => removeItem(item.product._id)}
                          sx={{
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            minWidth: 'auto'
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mt: 1, 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.85rem', md: '0.875rem' }
                        }}
                      >
                        Subtotal: ₹{(item.product.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  fontWeight: 'bold'
                }}
              >
                Total: ₹{total.toFixed(2)}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                sx={{
                  py: { xs: 1.5, md: 1 },
                  fontSize: { xs: '0.9rem', md: '0.875rem' }
                }}
              >
                Proceed to Checkout
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {/* Checkout Dialog */}
      <Dialog 
        open={checkoutOpen} 
        onClose={() => setCheckoutOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={window.innerWidth < 600}
      >
        <DialogTitle sx={{
          fontSize: { xs: '1.1rem', md: '1.25rem' },
          pb: { xs: 1, md: 2 }
        }}>
          Checkout
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Grid container spacing={{ xs: 2, md: 2 }} sx={{ mt: { xs: 0.5, md: 1 } }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={userInfo.name}
                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                required
                size={window.innerWidth < 600 ? "medium" : "medium"}
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
                size={window.innerWidth < 600 ? "medium" : "medium"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={userInfo.phone}
                onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                required
                size={window.innerWidth < 600 ? "medium" : "medium"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={window.innerWidth < 600 ? 2 : 3}
                value={userInfo.address}
                onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                required
                size={window.innerWidth < 600 ? "medium" : "medium"}
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
                size={window.innerWidth < 600 ? "medium" : "medium"}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: { xs: 2, md: 3 } }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
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
                  <Typography 
                    sx={{ 
                      fontSize: { xs: '0.85rem', md: '0.875rem' },
                      flex: 1,
                      pr: 1
                    }}
                  >
                    {item.product.name} x {item.quantity}
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontSize: { xs: '0.85rem', md: '0.875rem' },
                      fontWeight: 500,
                      minWidth: 'fit-content'
                    }}
                  >
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 'bold' 
            }}>
              <Typography 
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                Total:
              </Typography>
              <Typography 
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                ₹{total.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 3, md: 3 }, 
          pb: { xs: 3, md: 2 },
          gap: 1
        }}>
          <Button 
            onClick={() => setCheckoutOpen(false)}
            sx={{
              fontSize: { xs: '0.85rem', md: '0.875rem' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCheckout}
            variant="contained"
            disabled={!isFormValid() || orderLoading}
            sx={{
              fontSize: { xs: '0.85rem', md: '0.875rem' },
              minWidth: { xs: 100, md: 'auto' }
            }}
          >
            {orderLoading ? <CircularProgress size={20} /> : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Products;
