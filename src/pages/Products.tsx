import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Grid, Button,
  Select, MenuItem, Drawer, Divider, TextField, Dialog,
  DialogContent, DialogActions, CircularProgress, Alert,
  Chip, IconButton, InputAdornment, Skeleton,
} from '@mui/material';
import {
  Add, Remove, ShoppingCart, Close, Search, Clear,
  ArrowForward, Store, FilterList, CheckCircle
} from '@mui/icons-material';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI, ordersAPI, stockAPI } from '../services/api';
import { cachedApiCall } from '../services/cache';
import { useCart } from '../contexts/CartContext';
import { Product, Category, User } from '../types';

declare const process: { env: { REACT_APP_API_URL?: string } };
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/* ─── Product Card ─────────────────────────────────────────── */
const ProductCard: React.FC<{
  product: Product;
  onAddToCart: (p: Product) => void;
  cartQty: number;
  onInc: (p: Product) => void;
  onDec: (id: string) => void;
  onNavigate: (id: string) => void;
  delay?: number;
}> = ({ product, onAddToCart, cartQty, onInc, onDec, onNavigate, delay = 0 }) => {
  const [imgErr, setImgErr] = useState(false);
  const oos = product.quantity === 0;

  return (
    <Box
      sx={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'white',
        border: cartQty > 0
          ? '1.5px solid rgba(26,107,46,0.25)'
          : '1px solid rgba(0,0,0,0.06)',
        boxShadow: cartQty > 0
          ? '0 4px 20px rgba(26,107,46,0.12)'
          : '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        animation: `fadeInUp 0.5s ease ${delay}ms both`,
        '@keyframes fadeInUp': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        '&:hover': {
          boxShadow: '0 20px 56px rgba(26,107,46,0.18)',
          transform: 'translateY(-6px)',
          border: '1.5px solid rgba(26,107,46,0.2)',
          '& .prod-img': { transform: 'scale(1.06)' },
        }
      }}
    >
      {/* Image — clickable → detail page */}
      <Box
        onClick={() => onNavigate(product._id)}
        sx={{
          height: { xs: 190, md: 210 },
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        {product.image_url && !imgErr ? (
          <img
            src={`${API_URL}${product.image_url}`}
            alt={product.name}
            onError={() => setImgErr(true)}
            className="prod-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>
            🌿
          </Box>
        )}

        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {product.best_seller && (
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              px: 1.25, py: 0.4, borderRadius: '20px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
            }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'white', letterSpacing: '0.04em' }}>
                ⭐ Best Seller
              </Typography>
            </Box>
          )}
          {product.newly_launched && (
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              px: 1.25, py: 0.4, borderRadius: '20px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
            }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'white', letterSpacing: '0.04em' }}>
                ✨ New
              </Typography>
            </Box>
          )}
          {oos && (
            <Box sx={{
              px: 1.25, py: 0.4, borderRadius: '20px',
              background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
            }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'white' }}>Sold Out</Typography>
            </Box>
          )}
        </Box>

        {/* Cart qty badge */}
        {cartQty > 0 && (
          <Box sx={{
            position: 'absolute', top: 10, right: 10,
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a6b2e, #2d9e4a)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.8rem',
            boxShadow: '0 2px 10px rgba(26,107,46,0.5)',
            border: '2px solid white',
          }}>
            {cartQty}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: { xs: 1.25, sm: 2, md: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{
          fontWeight: 700, fontSize: { xs: '0.78rem', sm: '0.9rem', md: '1rem' },
          color: '#212121', mb: 0.5, lineHeight: 1.3, letterSpacing: '-0.01em'
        }}>
          {product.name}
        </Typography>
        <Typography sx={{
          fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.825rem' }, color: '#9e9e9e',
          lineHeight: 1.5, flex: 1, mb: 1,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {product.description}
        </Typography>

        {/* Price + Stock */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{
            fontWeight: 800, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
            color: '#1a6b2e', letterSpacing: '-0.02em'
          }}>
            ₹{product.price}
          </Typography>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.4,
            px: { xs: 0.75, sm: 1.25 }, py: 0.35, borderRadius: '20px',
            background: oos ? 'rgba(198,40,40,0.08)' : 'rgba(26,107,46,0.08)',
            border: `1px solid ${oos ? 'rgba(198,40,40,0.2)' : 'rgba(26,107,46,0.2)'}`,
          }}>
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: oos ? '#c62828' : '#1a6b2e' }} />
            <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, fontWeight: 700, color: oos ? '#c62828' : '#1a6b2e' }}>
              {oos ? 'Out' : 'In Stock'}
            </Typography>
          </Box>
        </Box>

        {/* Cart Controls */}
        {!oos && (
          cartQty > 0 ? (
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(26,107,46,0.06), rgba(45,158,74,0.08))',
              border: '1.5px solid rgba(26,107,46,0.2)',
              borderRadius: '12px', p: { xs: 0.5, sm: 0.75 },
            }}>
              <IconButton size="small" onClick={() => onDec(product._id)}
                sx={{ width: { xs: 30, sm: 36 }, height: { xs: 30, sm: 36 }, background: 'white', border: '1px solid rgba(26,107,46,0.15)', borderRadius: '8px', color: '#1a6b2e' }}>
                <Remove sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />
              </IconButton>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', sm: '1rem' }, color: '#1a6b2e', minWidth: 24, textAlign: 'center' }}>
                {cartQty}
              </Typography>
              <IconButton size="small" onClick={() => onInc(product)}
                sx={{ width: { xs: 30, sm: 36 }, height: { xs: 30, sm: 36 }, background: 'linear-gradient(135deg, #1a6b2e, #2d9e4a)', borderRadius: '8px', color: 'white' }}>
                <Add sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />
              </IconButton>
            </Box>
          ) : (
            <Button fullWidth variant="contained" onClick={() => onAddToCart(product)}
              sx={{
                background: 'linear-gradient(135deg, #1a6b2e, #2d9e4a)',
                color: 'white', fontWeight: 700,
                fontSize: { xs: '0.72rem', sm: '0.875rem' },
                py: { xs: 1, sm: 1.25 }, borderRadius: '10px', textTransform: 'none',
                boxShadow: '0 4px 16px rgba(26,107,46,0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #0d4a1e, #1a6b2e)', transform: 'translateY(-1px)' }
              }}>
              + Add
            </Button>
          )
        )}
        {oos && (
          <Button fullWidth disabled
            sx={{ background: 'rgba(0,0,0,0.04)', color: '#bdbdbd', fontWeight: 600, fontSize: { xs: '0.72rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.25 }, borderRadius: '10px', textTransform: 'none' }}>
            Sold Out
          </Button>
        )}
      </Box>
    </Box>
  );
};

/* ─── Main Products Component ──────────────────────────────── */
const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [stockErrors, setStockErrors] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<User & { password: string }>({
    name: '', email: '', phone: '', address: '', password: ''
  });
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminContext = location.pathname.startsWith('/adddmin');
  const { items, total, itemCount, addItem, updateQuantity, clearCart, minOrderValue } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const [cats, prods] = await Promise.all([
          cachedApiCall('categories', () => categoriesAPI.getAll(), 10 * 60 * 1000),
          cachedApiCall('products', () => productsAPI.getAll(), 5 * 60 * 1000),
        ]);
        setCategories(cats);
        setAllProducts(prods);
        setProducts(prods);
        const cat = searchParams.get('category');
        if (cat) setSelectedCategory(cat);
      } catch {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  useEffect(() => {
    let f = [...allProducts];
    if (selectedCategory) f = f.filter(p => p.category_id === selectedCategory);
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      f = f.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    setProducts(f);
  }, [selectedCategory, searchTerm, allProducts]);

  const getQty = (id: string) => items.find(i => i.product._id === id)?.quantity || 0;

  const handleCheckoutOpen = async () => {
    if (!isAdminContext && total < minOrderValue) {
      setStockErrors([`Minimum order ₹${minOrderValue}. Current: ₹${total.toFixed(2)}`]);
      return;
    }
    try {
      const r = await stockAPI.validateStock({ items: items.map(i => ({ product_id: i.product._id, quantity: i.quantity })) });
      if (!r.valid) { setStockErrors(r.invalid_items.map(i => i.error)); return; }
      setStockErrors([]);
      setCartOpen(false);
      setCheckoutOpen(true);
    } catch {
      alert('Error validating stock.');
    }
  };

  const handleCheckout = async () => {
    setOrderLoading(true);
    try {
      await ordersAPI.create({
        user_info: userInfo,
        items: items.map(i => ({
          product_id: i.product._id,
          product_name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
          total: i.product.price * i.quantity
        }))
      });
      clearCart();
      setOrderSuccess(true);
      setTimeout(() => {
        setCheckoutOpen(false);
        setOrderSuccess(false);
        setUserInfo({ name: '', email: '', phone: '', address: '', password: '' });
      }, 2500);
    } catch {
      alert('Failed to place order.');
    } finally {
      setOrderLoading(false);
    }
  };

  const isFormValid = () => userInfo.name && userInfo.email && userInfo.phone && userInfo.address && userInfo.password;

  if (loading) return (
    <Box sx={{ background: '#f9fdf9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '20px', mb: 3 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={360} sx={{ borderRadius: '20px' }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );

  if (error) return (
    <Container sx={{ py: 4 }}>
      <Alert severity="error" sx={{ borderRadius: '16px' }}>{error}</Alert>
    </Container>
  );

  return (
    <Box sx={{ background: '#f9fdf9', minHeight: '100vh' }}>
      {/* Hero Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0d4a1e 0%, #1a6b2e 50%, #2d9e4a 100%)',
        pt: { xs: 5, md: 8 }, pb: { xs: 7, md: 10 },
        position: 'relative', overflow: 'hidden',
        '&::after': {
          content: '""', position: 'absolute', bottom: -2, left: 0, right: 0,
          height: { xs: 40, md: 60 }, background: '#f9fdf9',
          clipPath: 'ellipse(55% 100% at 50% 100%)'
        }
      }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                px: 2, py: 0.6, borderRadius: '30px',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', mb: 1.5
              }}>
                <Store sx={{ fontSize: '0.85rem', color: '#a8e6b8' }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Our Store
                </Typography>
              </Box>
              <Typography sx={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' },
                color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1
              }}>
                All Products
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', mt: 0.75 }}>
                {allProducts.length} organic products available
              </Typography>
            </Box>

            {/* Cart Button */}
            <Box
              onClick={() => itemCount > 0 && setCartOpen(true)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2.5, py: 1.5, borderRadius: '16px',
                background: itemCount > 0
                  ? 'linear-gradient(135deg, rgba(240,165,0,0.9), rgba(255,197,61,0.9))'
                  : 'rgba(255,255,255,0.12)',
                border: itemCount > 0
                  ? '1px solid rgba(255,197,61,0.4)'
                  : '1px solid rgba(255,255,255,0.18)',
                cursor: itemCount > 0 ? 'pointer' : 'default',
                transition: 'all 0.25s ease',
                boxShadow: itemCount > 0 ? '0 4px 20px rgba(240,165,0,0.35)' : 'none',
                '&:hover': itemCount > 0 ? {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 28px rgba(240,165,0,0.45)',
                } : {}
              }}
            >
              <ShoppingCart sx={{ fontSize: '1.2rem', color: itemCount > 0 ? '#0d4a1e' : 'rgba(255,255,255,0.7)' }} />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: itemCount > 0 ? '#0d4a1e' : 'rgba(255,255,255,0.7)', lineHeight: 1.1 }}>
                  {itemCount > 0 ? `${itemCount} item${itemCount !== 1 ? 's' : ''}` : 'Cart empty'}
                </Typography>
                {itemCount > 0 && (
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d4a1e' }}>
                    ₹{total.toFixed(0)} total
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
        {/* Filters */}
        <Box sx={{
          background: 'white', borderRadius: '20px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          p: { xs: 2, md: 2.5 }, mb: { xs: 3, md: 4 }
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={5}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#bdbdbd', fontSize: '1.1rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <Clear sx={{ fontSize: '1rem', color: '#9e9e9e' }} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px', background: '#fafafa',
                    '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(26,107,46,0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#1a6b2e', borderWidth: '1.5px' }
                  },
                  '& .MuiInputBase-input': { fontSize: '0.9rem', py: 1.5 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Select
                fullWidth
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                displayEmpty
                startAdornment={<FilterList sx={{ ml: 1, mr: 0.5, color: '#9e9e9e', fontSize: '1.1rem' }} />}
                sx={{
                  borderRadius: '12px', background: '#fafafa', fontSize: '0.9rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.08)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(26,107,46,0.3)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1a6b2e', borderWidth: '1.5px' },
                  '& .MuiSelect-select': { py: 1.5 }
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                {(searchTerm || selectedCategory) && (
                  <Button
                    size="small"
                    onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
                    sx={{ color: '#9e9e9e', fontSize: '0.8rem', textTransform: 'none', borderRadius: '8px' }}
                  >
                    Clear filters
                  </Button>
                )}
                <Box sx={{
                  px: 2, py: 0.75, borderRadius: '20px',
                  background: 'rgba(26,107,46,0.06)',
                  border: '1px solid rgba(26,107,46,0.12)',
                }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#1a6b2e', fontWeight: 700 }}>
                    {products.length} product{products.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Category chips */}
        {categories.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            <Chip
              label="All"
              onClick={() => setSelectedCategory('')}
              sx={{
                fontWeight: 600, fontSize: '0.8rem', height: 32,
                background: !selectedCategory ? 'linear-gradient(135deg, #1a6b2e, #2d9e4a)' : 'white',
                color: !selectedCategory ? 'white' : '#616161',
                border: !selectedCategory ? 'none' : '1px solid rgba(0,0,0,0.1)',
                boxShadow: !selectedCategory ? '0 2px 8px rgba(26,107,46,0.3)' : 'none',
                '&:hover': { background: !selectedCategory ? 'linear-gradient(135deg, #0d4a1e, #1a6b2e)' : 'rgba(0,0,0,0.04)' }
              }}
            />
            {categories.map(cat => (
              <Chip
                key={cat._id}
                label={cat.name}
                onClick={() => setSelectedCategory(cat._id)}
                sx={{
                  fontWeight: 600, fontSize: '0.8rem', height: 32,
                  background: selectedCategory === cat._id ? 'linear-gradient(135deg, #1a6b2e, #2d9e4a)' : 'white',
                  color: selectedCategory === cat._id ? 'white' : '#616161',
                  border: selectedCategory === cat._id ? 'none' : '1px solid rgba(0,0,0,0.1)',
                  boxShadow: selectedCategory === cat._id ? '0 2px 8px rgba(26,107,46,0.3)' : 'none',
                  '&:hover': { background: selectedCategory === cat._id ? 'linear-gradient(135deg, #0d4a1e, #1a6b2e)' : 'rgba(0,0,0,0.04)' }
                }}
              />
            ))}
          </Box>
        )}

        {/* Product Grid */}
        {products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: { xs: 6, md: 10 } }}>
            <Box sx={{ fontSize: '4rem', mb: 2 }}>🌿</Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#212121', mb: 1 }}>
              No products found
            </Typography>
            <Typography sx={{ color: '#9e9e9e', mb: 3 }}>
              {searchTerm || selectedCategory ? 'Try adjusting your filters' : 'No products available'}
            </Typography>
            {(searchTerm || selectedCategory) && (
              <Button
                variant="outlined"
                onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
                sx={{ borderColor: '#1a6b2e', color: '#1a6b2e', borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
            {products.map((p, i) => (
              <Grid item xs={6} sm={6} md={4} lg={3} key={p._id}>
                <ProductCard
                  product={p}
                  onAddToCart={addItem}
                  cartQty={getQty(p._id)}
                  onInc={prod => updateQuantity(prod._id, getQty(prod._id) + 1)}
                  onDec={id => updateQuantity(id, getQty(id) - 1)}
                  onNavigate={id => navigate(`/products/${id}`)}
                  delay={i * 50}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* ── Cart Drawer ─────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 420 },
            background: '#f9fdf9',
            border: 'none',
            boxShadow: '-8px 0 48px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column',
          },
          '& .MuiBackdrop-root': {
            backdropFilter: 'blur(4px)',
            background: 'rgba(0,0,0,0.35)'
          }
        }}
      >
        {/* Drawer Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #0d4a1e, #1a6b2e)',
          px: 3, py: 2.5, flexShrink: 0,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ShoppingCart sx={{ color: 'white', fontSize: '1.3rem' }} />
              <Box>
                <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '1.1rem', lineHeight: 1.1 }}>
                  Your Cart
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                  {itemCount} item{itemCount !== 1 ? 's' : ''} · ₹{total.toFixed(0)}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setCartOpen(false)}
              sx={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: '10px', width: 36, height: 36 }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Cart Items */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ fontSize: '3.5rem', mb: 2 }}>🛒</Box>
              <Typography sx={{ fontWeight: 700, color: '#424242', mb: 0.5 }}>Your cart is empty</Typography>
              <Typography sx={{ color: '#9e9e9e', fontSize: '0.875rem' }}>Add some organic products!</Typography>
            </Box>
          ) : (
            <>
              {items.map(item => (
                <Box
                  key={item.product._id}
                  sx={{
                    background: 'white', borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    p: 2, mb: 1.5,
                    display: 'flex', gap: 1.5, alignItems: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid rgba(26,107,46,0.1)' }
                  }}
                >
                  <Box sx={{
                    width: 56, height: 56, borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', flexShrink: 0, overflow: 'hidden',
                    border: '1px solid rgba(26,107,46,0.1)',
                  }}>
                    {item.product.image_url
                      ? <img src={`${API_URL}${item.product.image_url}`} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '🌿'
                    }
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#212121', lineHeight: 1.3, mb: 0.25 }}>
                      {item.product.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#9e9e9e' }}>₹{item.product.price} each</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      sx={{ width: 28, height: 28, background: 'rgba(0,0,0,0.04)', borderRadius: '8px', color: '#616161' }}
                    >
                      <Remove sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', minWidth: 24, textAlign: 'center', color: '#212121' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      sx={{ width: 28, height: 28, background: '#1a6b2e', borderRadius: '8px', color: 'white' }}
                    >
                      <Add sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#1a6b2e', minWidth: 56, textAlign: 'right' }}>
                    ₹{(item.product.price * item.quantity).toFixed(0)}
                  </Typography>
                </Box>
              ))}
              {stockErrors.length > 0 && (
                <Alert severity="warning" sx={{ borderRadius: '12px', mb: 2 }}>
                  {stockErrors.map((e, i) => <div key={i}>• {e}</div>)}
                </Alert>
              )}
            </>
          )}
        </Box>

        {/* Cart Footer */}
        {items.length > 0 && (
          <Box sx={{ p: 2.5, background: 'white', borderTop: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
            {!isAdminContext && total < minOrderValue && (
              <Box sx={{
                p: 1.5, borderRadius: '12px', mb: 2,
                background: 'rgba(230,81,0,0.06)', border: '1px solid rgba(230,81,0,0.15)',
              }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#e65100', fontWeight: 600 }}>
                  Add ₹{(minOrderValue - total).toFixed(0)} more to reach minimum order (₹{minOrderValue})
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 600, color: '#616161' }}>Total</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#1a6b2e' }}>₹{total.toFixed(2)}</Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              onClick={handleCheckoutOpen}
              endIcon={<ArrowForward />}
              sx={{
                background: 'linear-gradient(135deg, #1a6b2e, #2d9e4a)',
                color: 'white', fontWeight: 700, py: 1.75,
                borderRadius: '14px', textTransform: 'none', fontSize: '1rem',
                boxShadow: '0 4px 16px rgba(26,107,46,0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #0d4a1e, #1a6b2e)', transform: 'translateY(-1px)' }
              }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        )}
      </Drawer>

      {/* ── Checkout Dialog ─────────────────────────────────── */}
      <Dialog
        open={checkoutOpen}
        onClose={() => !orderLoading && setCheckoutOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: '24px' },
            overflow: 'hidden',
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' },
          }
        }}
      >
        {/* Dialog Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #0d4a1e, #1a6b2e)',
          px: 3, py: 2.5,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>
            {orderSuccess ? '🎉 Order Placed!' : 'Complete Your Order'}
          </Typography>
          {!orderLoading && !orderSuccess && (
            <IconButton
              onClick={() => setCheckoutOpen(false)}
              sx={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: '10px', width: 36, height: 36 }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>

        <DialogContent sx={{ p: { xs: 2.5, md: 3 } }}>
          {orderSuccess ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 64, color: '#1a6b2e', mb: 2 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#212121', mb: 1 }}>
                Order Placed Successfully!
              </Typography>
              <Typography sx={{ color: '#9e9e9e', fontSize: '0.95rem' }}>
                Thank you for your order. We'll deliver it on Sunday.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mt: 0 }}>
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Email Address', key: 'email', type: 'email' },
                  { label: 'Phone Number', key: 'phone', type: 'tel' },
                  { label: 'Delivery Address', key: 'address', type: 'text', multiline: true, rows: 2 },
                  { label: 'Password (for order tracking)', key: 'password', type: 'password', helper: "You'll need this to check your order status" }
                ].map(f => (
                  <Grid item xs={12} key={f.key}>
                    <TextField
                      fullWidth
                      label={f.label}
                      type={f.type}
                      multiline={f.multiline}
                      rows={f.rows}
                      value={(userInfo as any)[f.key]}
                      onChange={e => setUserInfo({ ...userInfo, [f.key]: e.target.value })}
                      helperText={f.helper}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&.Mui-focused fieldset': { borderColor: '#1a6b2e' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#1a6b2e' }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Order Summary */}
              <Box sx={{
                mt: 3, p: 2.5, background: 'rgba(26,107,46,0.04)',
                borderRadius: '16px', border: '1px solid rgba(26,107,46,0.12)'
              }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a6b2e', mb: 1.5 }}>
                  Order Summary
                </Typography>
                {items.map(item => (
                  <Box key={item.product._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography sx={{ fontSize: '0.85rem', color: '#616161' }}>
                      {item.product.name} × {item.quantity}
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#212121' }}>
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1.5, borderColor: 'rgba(26,107,46,0.12)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 700, color: '#1a6b2e' }}>Total</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a6b2e' }}>₹{total.toFixed(2)}</Typography>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>

        {!orderSuccess && (
          <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
            <Button
              onClick={() => setCheckoutOpen(false)}
              disabled={orderLoading}
              sx={{ color: '#9e9e9e', borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              variant="contained"
              disabled={!isFormValid() || orderLoading}
              sx={{
                background: 'linear-gradient(135deg, #1a6b2e, #2d9e4a)',
                color: 'white', fontWeight: 700, px: 4, py: 1.5,
                borderRadius: '12px', textTransform: 'none', flex: 1,
                boxShadow: '0 4px 16px rgba(26,107,46,0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #0d4a1e, #1a6b2e)' }
              }}
            >
              {orderLoading ? <CircularProgress size={20} color="inherit" /> : 'Place Order'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default Products;
