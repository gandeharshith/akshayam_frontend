import React, { useState } from 'react';
import {
  Container, Typography, Box, Grid, Button, TextField,
  CircularProgress, Alert, IconButton, Divider, Chip
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCart, ArrowForward, ArrowBack, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ordersAPI, stockAPI } from '../services/api';
import { User } from '../types';

const API_URL = (process.env as any).REACT_APP_API_URL || 'http://localhost:8000';

const Cart: React.FC = () => {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart, minOrderValue } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<User & { password: string }>({ name: '', email: '', phone: '', address: '', password: '' });

  const handleProceed = async () => {
    if (total < minOrderValue) { setError(`Minimum order value is ₹${minOrderValue}. Add ₹${(minOrderValue - total).toFixed(2)} more.`); return; }
    try {
      const r = await stockAPI.validateStock({ items: items.map(i => ({ product_id: i.product._id, quantity: i.quantity })) });
      if (!r.valid) { setError(r.invalid_items.map(i => i.error).join(', ')); return; }
      setError(''); setStep('checkout');
    } catch { setError('Error validating stock. Please try again.'); }
  };

  const handleOrder = async () => {
    if (!userInfo.name || !userInfo.email || !userInfo.phone || !userInfo.address || !userInfo.password) { setError('All fields are required.'); return; }
    setLoading(true); setError('');
    try {
      await ordersAPI.create({ user_info: userInfo, items: items.map(i => ({ product_id: i.product._id, product_name: i.product.name, quantity: i.quantity, price: i.product.price, total: i.product.price * i.quantity })) });
      clearCart(); setStep('success');
    } catch { setError('Failed to place order. Please try again.'); } finally { setLoading(false); }
  };

  /* ── Success ── */
  if (step === 'success') return (
    <Box sx={{ background: '#fafafa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ textAlign: 'center', maxWidth: 480, animation: 'fadeInUp 0.6s ease both' }}>
        <Box sx={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg,#15803d,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, boxShadow: '0 16px 48px rgba(21,128,61,0.35)' }}>
          <CheckCircle sx={{ color: 'white', fontSize: '3rem' }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.2rem' }, color: '#18181b', mb: 1.5, letterSpacing: '-0.02em' }}>Order Placed!</Typography>
        <Typography sx={{ color: '#71717a', fontSize: '1rem', lineHeight: 1.7, mb: 4 }}>
          Your order has been placed successfully. You'll receive a confirmation soon. Track your order in My Orders.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button variant="contained" onClick={() => navigate('/products')} sx={{ background: 'linear-gradient(135deg,#15803d,#22c55e)', color: 'white', fontWeight: 700, px: 4, py: 1.5, borderRadius: '14px', textTransform: 'none', boxShadow: '0 4px 16px rgba(21,128,61,0.3)', '&:hover': { background: 'linear-gradient(135deg,#14532d,#15803d)' } }}>
            Continue Shopping
          </Button>
          <Button variant="outlined" onClick={() => navigate('/my-orders')} sx={{ borderColor: '#15803d', color: '#15803d', fontWeight: 700, px: 4, py: 1.5, borderRadius: '14px', textTransform: 'none', '&:hover': { background: '#f0fdf4' } }}>
            Track Orders
          </Button>
        </Box>
      </Box>
    </Box>
  );

  /* ── Empty Cart ── */
  if (items.length === 0 && step === 'cart') return (
    <Box sx={{ background: '#fafafa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
        <Box sx={{ fontSize: '5rem', mb: 2 }}>🛒</Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: '#18181b', mb: 1.5, letterSpacing: '-0.02em' }}>Your cart is empty</Typography>
        <Typography sx={{ color: '#71717a', mb: 4, lineHeight: 1.7 }}>Looks like you haven't added any products yet. Explore our organic collection!</Typography>
        <Button variant="contained" onClick={() => navigate('/products')} endIcon={<ArrowForward />} sx={{ background: 'linear-gradient(135deg,#15803d,#22c55e)', color: 'white', fontWeight: 700, px: 4, py: 1.75, borderRadius: '14px', textTransform: 'none', boxShadow: '0 4px 16px rgba(21,128,61,0.3)', '&:hover': { background: 'linear-gradient(135deg,#14532d,#15803d)' } }}>
          Shop Now
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ background: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg,#0f4c25 0%,#15803d 60%,#16a34a 100%)', pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 8 }, position: 'relative', overflow: 'hidden', '&::after': { content: '""', position: 'absolute', bottom: -2, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom,transparent,#fafafa)' } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5 }}>
            {step === 'cart' ? 'Your Cart' : 'Checkout'}
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.5rem' }, color: 'white', letterSpacing: '-0.02em' }}>
            {step === 'cart' ? `${itemCount} Item${itemCount !== 1 ? 's' : ''}` : 'Delivery Details'}
          </Typography>
          {/* Step indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            {['Cart', 'Checkout'].map((s, i) => (
              <React.Fragment key={s}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: (step === 'cart' && i === 0) || (step === 'checkout' && i <= 1) ? 'white' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: (step === 'cart' && i === 0) || (step === 'checkout' && i <= 1) ? '#15803d' : 'rgba(255,255,255,0.6)' }}>{i + 1}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: (step === 'cart' && i === 0) || (step === 'checkout' && i <= 1) ? 'white' : 'rgba(255,255,255,0.5)' }}>{s}</Typography>
                </Box>
                {i < 1 && <Box sx={{ width: 32, height: 1, background: 'rgba(255,255,255,0.3)' }} />}
              </React.Fragment>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
        {error && <Alert severity="error" sx={{ borderRadius: '14px', mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

        <Grid container spacing={{ xs: 2.5, md: 4 }}>
          {/* Left: Items / Form */}
          <Grid item xs={12} md={7}>
            {step === 'cart' ? (
              <Box>
                {items.map(item => (
                  <Box key={item.product._id} sx={{ background: 'white', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', p: { xs: 2, md: 2.5 }, mb: 2, display: 'flex', gap: 2, alignItems: 'center', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderColor: 'rgba(21,128,61,0.12)' } }}>
                    <Box sx={{ width: { xs: 64, md: 80 }, height: { xs: 64, md: 80 }, borderRadius: '14px', background: '#f0fdf4', overflow: 'hidden', flexShrink: 0 }}>
                      {item.product.image_url ? <img src={`${API_URL}${item.product.image_url}`} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🌿</Box>}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', md: '1rem' }, color: '#18181b', lineHeight: 1.3, mb: 0.5 }}>{item.product.name}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#71717a' }}>₹{item.product.price} per unit</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                      <IconButton size="small" onClick={() => updateQuantity(item.product._id, item.quantity - 1)} sx={{ width: 32, height: 32, background: '#f4f4f5', borderRadius: '10px', color: '#52525b', '&:hover': { background: '#e4e4e7' } }}><Remove sx={{ fontSize: '0.9rem' }} /></IconButton>
                      <Typography sx={{ fontWeight: 800, fontSize: '1rem', minWidth: 28, textAlign: 'center', color: '#18181b' }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => updateQuantity(item.product._id, item.quantity + 1)} sx={{ width: 32, height: 32, background: '#15803d', borderRadius: '10px', color: 'white', '&:hover': { background: '#14532d' } }}><Add sx={{ fontSize: '0.9rem' }} /></IconButton>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0, minWidth: 64 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#15803d' }}>₹{(item.product.price * item.quantity).toFixed(0)}</Typography>
                      <IconButton size="small" onClick={() => removeItem(item.product._id)} sx={{ mt: 0.5, color: '#ef4444', width: 28, height: 28, '&:hover': { background: '#fee2e2' }, borderRadius: '8px' }}><Delete sx={{ fontSize: '0.9rem' }} /></IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ background: 'white', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', p: { xs: 2.5, md: 4 } }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#18181b', mb: 3 }}>Delivery Information</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Full Name', key: 'name', type: 'text', xs: 12 },
                    { label: 'Email Address', key: 'email', type: 'email', xs: 12, sm: 6 },
                    { label: 'Phone Number', key: 'phone', type: 'tel', xs: 12, sm: 6 },
                    { label: 'Delivery Address', key: 'address', type: 'text', xs: 12, multiline: true, rows: 3 },
                    { label: 'Password (for order tracking)', key: 'password', type: 'password', xs: 12, helper: "Set a password to track your orders later" },
                  ].map(f => (
                    <Grid item xs={f.xs} sm={(f as any).sm} key={f.key}>
                      <TextField fullWidth label={f.label} type={f.type} multiline={f.multiline} rows={f.rows} value={(userInfo as any)[f.key]} onChange={e => setUserInfo({ ...userInfo, [f.key]: e.target.value })} helperText={f.helper} required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', '&.Mui-focused fieldset': { borderColor: '#15803d', borderWidth: '1.5px' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#15803d' } }} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>

          {/* Right: Summary */}
          <Grid item xs={12} md={5}>
            <Box sx={{ background: 'white', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', p: { xs: 2.5, md: 3.5 }, position: { md: 'sticky' }, top: { md: 24 } }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#18181b', mb: 2.5 }}>Order Summary</Typography>

              {items.map(item => (
                <Box key={item.product._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#52525b', flex: 1, mr: 1 }}>{item.product.name} <span style={{ color: '#a1a1aa' }}>×{item.quantity}</span></Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#18181b', flexShrink: 0 }}>₹{(item.product.price * item.quantity).toFixed(0)}</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.06)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.875rem', color: '#71717a' }}>Subtotal</Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#18181b' }}>₹{total.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '0.875rem', color: '#71717a' }}>Delivery</Typography>
                <Chip label="Free" size="small" sx={{ background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
              </Box>

              <Divider sx={{ mb: 2, borderColor: 'rgba(0,0,0,0.06)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#18181b' }}>Total</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#15803d', letterSpacing: '-0.02em' }}>₹{total.toFixed(2)}</Typography>
              </Box>

              {total < minOrderValue && (
                <Box sx={{ p: 2, borderRadius: '12px', background: '#fef3c7', border: '1px solid #fcd34d', mb: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>
                    Add ₹{(minOrderValue - total).toFixed(2)} more to meet the minimum order of ₹{minOrderValue}
                  </Typography>
                </Box>
              )}

              {step === 'cart' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button fullWidth variant="contained" onClick={handleProceed} endIcon={<ArrowForward />} disabled={total < minOrderValue}
                    sx={{ background: 'linear-gradient(135deg,#15803d,#22c55e)', color: 'white', fontWeight: 700, py: 1.75, borderRadius: '14px', textTransform: 'none', fontSize: '1rem', boxShadow: '0 4px 16px rgba(21,128,61,0.3)', '&:hover': { background: 'linear-gradient(135deg,#14532d,#15803d)' }, '&.Mui-disabled': { background: '#e4e4e7', color: '#a1a1aa' } }}>
                    Proceed to Checkout
                  </Button>
                  <Button fullWidth variant="outlined" onClick={() => navigate('/products')} startIcon={<ArrowBack />}
                    sx={{ borderColor: 'rgba(0,0,0,0.12)', color: '#52525b', fontWeight: 600, py: 1.5, borderRadius: '14px', textTransform: 'none', '&:hover': { borderColor: '#15803d', color: '#15803d', background: '#f0fdf4' } }}>
                    Continue Shopping
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button fullWidth variant="contained" onClick={handleOrder} disabled={loading || !userInfo.name || !userInfo.email || !userInfo.phone || !userInfo.address || !userInfo.password}
                    sx={{ background: 'linear-gradient(135deg,#15803d,#22c55e)', color: 'white', fontWeight: 700, py: 1.75, borderRadius: '14px', textTransform: 'none', fontSize: '1rem', boxShadow: '0 4px 16px rgba(21,128,61,0.3)', '&:hover': { background: 'linear-gradient(135deg,#14532d,#15803d)' }, '&.Mui-disabled': { background: '#e4e4e7', color: '#a1a1aa' } }}>
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Place Order'}
                  </Button>
                  <Button fullWidth variant="outlined" onClick={() => setStep('cart')} startIcon={<ArrowBack />}
                    sx={{ borderColor: 'rgba(0,0,0,0.12)', color: '#52525b', fontWeight: 600, py: 1.5, borderRadius: '14px', textTransform: 'none', '&:hover': { borderColor: '#15803d', color: '#15803d', background: '#f0fdf4' } }}>
                    Back to Cart
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Cart;
