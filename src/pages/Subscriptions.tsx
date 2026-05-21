import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, IconButton, Paper, Chip, Divider,
  CircularProgress, Alert, Skeleton, Grid
} from '@mui/material';
import {
  Autorenew as SubscribeIcon,
  Add, Remove, Delete as DeleteIcon,
  CheckCircle, Pause, PlayArrow,
  LocationOn, CalendarToday, ShoppingBag
} from '@mui/icons-material';
import { subscriptionsAPI, productsAPI } from '../services/api';
import { formatDateIST } from '../utils/dateFormat';
import { useUserAuth } from '../contexts/UserAuthContext';
import { Product } from '../types';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface SubItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Subscription {
  _id: string;
  user_name: string;
  user_phone: string;
  user_address: string;
  items: { product_id: string; product_name: string; quantity: number; price: number; total: number }[];
  total_amount: number;
  day_of_week: number;
  day_name: string;
  notes: string;
  active: boolean;
  last_processed_week: string | null;
  last_order_placed_at: string | null;
  created_at: string;
}

const Subscriptions: React.FC = () => {
  const { isLoggedIn, userEmail, userPassword } = useUserAuth();
  const location = useLocation();

  // Parse URL params (from "Subscribe Weekly" button on product page)
  const urlParams = new URLSearchParams(location.search);
  const prefilledProductId   = urlParams.get('product_id') || '';
  const prefilledProductName = urlParams.get('product_name') || '';
  const prefilledPrice       = parseFloat(urlParams.get('price') || '0');
  const hasPrefilledProduct  = !!prefilledProductId && !!prefilledProductName;

  const [authEmail, setAuthEmail] = useState(userEmail || '');
  const [authPassword, setAuthPassword] = useState(userPassword || '');
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(hasPrefilledProduct);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    user_name: '', user_phone: '', user_address: '', day_of_week: 0, notes: '',
  });
  const [selectedItems, setSelectedItems] = useState<SubItem[]>(
    hasPrefilledProduct
      ? [{ product_id: prefilledProductId, product_name: prefilledProductName, quantity: 1, price: prefilledPrice }]
      : []
  );
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated && authEmail && authPassword) fetchSubscriptions();
    // eslint-disable-next-line
  }, [isAuthenticated]);

  useEffect(() => {
    productsAPI.getAll().then(setProducts).catch(() => {});
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true); setError('');
    try {
      const data = await subscriptionsAPI.getMy(authEmail, authPassword);
      setSubscriptions(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load subscriptions');
    } finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const data = await subscriptionsAPI.getMy(authEmail, authPassword);
      setSubscriptions(data); setIsAuthenticated(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    const p = products[0];
    setSelectedItems(prev => [...prev, { product_id: p._id || '', product_name: p.name, quantity: 1, price: p.price }]);
  };

  const handleItemProductChange = (idx: number, productId: string) => {
    const p = products.find(pr => pr._id === productId);
    if (!p) return;
    setSelectedItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], product_id: p._id || '', product_name: p.name, price: p.price };
      return updated;
    });
  };

  const handleItemQtyChange = (idx: number, qty: number) => {
    setSelectedItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], quantity: Math.max(1, qty) };
      return updated;
    });
  };

  const handleRemoveItem = (idx: number) => setSelectedItems(prev => prev.filter((_, i) => i !== idx));

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) { setError('Please add at least one product'); return; }
    setSubmitting(true); setError('');
    try {
      await subscriptionsAPI.create({ email: authEmail, password: authPassword, ...formData, items: selectedItems });
      setSuccessMsg(`Subscription created! Orders will be placed automatically every ${DAY_NAMES[formData.day_of_week]}.`);
      setShowForm(false); setSelectedItems([]); fetchSubscriptions();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to create subscription');
    } finally { setSubmitting(false); }
  };

  const handleToggleActive = async (sub: Subscription) => {
    try {
      await subscriptionsAPI.update(sub._id, { active: !sub.active }, authEmail, authPassword);
      fetchSubscriptions();
    } catch (e: any) { setError(e?.response?.data?.detail || 'Failed to update'); }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this subscription? This cannot be undone.')) return;
    try {
      await subscriptionsAPI.cancel(id, authEmail, authPassword);
      fetchSubscriptions();
    } catch (e: any) { setError(e?.response?.data?.detail || 'Failed to cancel'); }
  };

  const totalForItems = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', maxWidth: 440, width: '100%', border: '1px solid rgba(26,107,46,0.1)', boxShadow: '0 8px 40px rgba(26,107,46,0.12)' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ width: 72, height: 72, borderRadius: '20px', background: 'linear-gradient(135deg,#1a6b2e,#2d9e4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 8px 24px rgba(26,107,46,0.3)' }}>
              <SubscribeIcon sx={{ color: 'white', fontSize: '2rem' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#18181b', mb: 0.5 }}>My Subscriptions</Typography>
            <Typography variant="body2" sx={{ color: '#71717a' }}>Sign in to manage your weekly auto-orders</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email" type="email" required fullWidth
              value={authEmail} onChange={e => setAuthEmail(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
              label="Password" type="password" required fullWidth
              value={authPassword} onChange={e => setAuthPassword(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <Button
              type="submit" variant="contained" fullWidth disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SubscribeIcon />}
              sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(135deg,#1a6b2e,#2d9e4a)', '&:hover': { background: 'linear-gradient(135deg,#0d4a1e,#1a6b2e)' } }}
            >
              {loading ? 'Signing in…' : 'View My Subscriptions'}
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // ── Authenticated ─────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', background: '#f9fdf9', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 2, md: 3 } }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em' }}>
              🔄 My Subscriptions
            </Typography>
            <Typography variant="body2" sx={{ color: '#71717a', mt: 0.5 }}>
              Weekly auto-orders placed on your chosen day
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => { setShowForm(true); setSuccessMsg(''); setError(''); }}
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', background: 'linear-gradient(135deg,#1a6b2e,#2d9e4a)', '&:hover': { background: 'linear-gradient(135deg,#0d4a1e,#1a6b2e)' }, boxShadow: '0 4px 16px rgba(26,107,46,0.3)', whiteSpace: 'nowrap' }}
          >
            New Subscription
          </Button>
        </Box>

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

        {/* ── Create Form ── */}
        {showForm && (
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: '24px', border: '1px solid rgba(26,107,46,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#18181b', mb: 3 }}>
              Create New Subscription
            </Typography>

            {/* Pre-filled product banner */}
            {hasPrefilledProduct && selectedItems.length > 0 && (
              <Box sx={{ p: 2, borderRadius: '14px', background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '1px solid #c4b5fd', display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SubscribeIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#5b21b6' }}>
                    Subscribing to: {prefilledProductName}
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#7c3aed' }}>
                    ₹{prefilledPrice} per unit · delivered weekly
                  </Typography>
                </Box>
              </Box>
            )}

            <Box component="form" onSubmit={handleCreateSubscription}>
              <Grid container spacing={2.5}>
                {/* Name & Phone */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name" required fullWidth value={formData.user_name}
                    onChange={e => setFormData(f => ({ ...f, user_name: e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number" required fullWidth value={formData.user_phone}
                    onChange={e => setFormData(f => ({ ...f, user_phone: e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                {/* Address */}
                <Grid item xs={12}>
                  <TextField
                    label="Delivery Address" required fullWidth multiline rows={2}
                    value={formData.user_address}
                    onChange={e => setFormData(f => ({ ...f, user_address: e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                {/* Day of week */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Order Day (every week)</InputLabel>
                    <Select
                      value={formData.day_of_week}
                      label="Order Day (every week)"
                      onChange={e => setFormData(f => ({ ...f, day_of_week: Number(e.target.value) }))}
                      sx={{ borderRadius: '12px' }}
                    >
                      {DAY_NAMES.map((d, i) => <MenuItem key={i} value={i}>{d}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" sx={{ color: '#71717a', mt: 0.5, display: 'block' }}>
                    Auto-order every {DAY_NAMES[formData.day_of_week]}
                  </Typography>
                </Grid>

                {/* Notes */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Notes (optional)" fullWidth value={formData.notes}
                    onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>

                {/* Products section */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#18181b' }}>
                      Products *
                    </Typography>
                    <Button
                      size="small" startIcon={<Add />} onClick={handleAddItem}
                      sx={{ color: '#1a6b2e', fontWeight: 700, textTransform: 'none', borderRadius: '8px', '&:hover': { background: 'rgba(26,107,46,0.06)' } }}
                    >
                      Add Product
                    </Button>
                  </Box>

                  {selectedItems.length === 0 ? (
                    <Box sx={{ p: 3, borderRadius: '14px', border: '2px dashed rgba(26,107,46,0.2)', textAlign: 'center' }}>
                      <ShoppingBag sx={{ color: '#a1a1aa', fontSize: '2rem', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#a1a1aa' }}>No products added yet. Click "Add Product".</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {selectedItems.map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', p: 1.5, borderRadius: '12px', background: 'rgba(26,107,46,0.04)', border: '1px solid rgba(26,107,46,0.1)' }}>
                          <FormControl size="small" sx={{ flex: 1 }}>
                            <Select
                              value={item.product_id}
                              onChange={e => handleItemProductChange(idx, e.target.value)}
                              sx={{ borderRadius: '10px', fontSize: '0.875rem' }}
                            >
                              {products.map(p => (
                                <MenuItem key={p._id} value={p._id}>{p.name} — ₹{p.price}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, background: 'white', borderRadius: '10px', border: '1px solid rgba(26,107,46,0.2)', px: 0.5 }}>
                            <IconButton size="small" onClick={() => handleItemQtyChange(idx, item.quantity - 1)} sx={{ color: '#1a6b2e', width: 28, height: 28 }}>
                              <Remove sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a6b2e', minWidth: 24, textAlign: 'center' }}>{item.quantity}</Typography>
                            <IconButton size="small" onClick={() => handleItemQtyChange(idx, item.quantity + 1)} sx={{ color: '#1a6b2e', width: 28, height: 28 }}>
                              <Add sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1a6b2e', minWidth: 64, textAlign: 'right' }}>
                            ₹{(item.price * item.quantity).toFixed(0)}
                          </Typography>
                          <IconButton size="small" onClick={() => handleRemoveItem(idx)} sx={{ color: '#dc2626', '&:hover': { background: 'rgba(220,38,38,0.08)' } }}>
                            <DeleteIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Box>
                      ))}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1a6b2e' }}>
                          Weekly Total: ₹{totalForItems.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>

                {/* Submit buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
                    <Button
                      type="submit" variant="contained" fullWidth disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
                      sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, textTransform: 'none', background: 'linear-gradient(135deg,#1a6b2e,#2d9e4a)', '&:hover': { background: 'linear-gradient(135deg,#0d4a1e,#1a6b2e)' } }}
                    >
                      {submitting ? 'Creating…' : 'Create Subscription'}
                    </Button>
                    <Button
                      variant="outlined" fullWidth onClick={() => setShowForm(false)}
                      sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, textTransform: 'none', borderColor: 'rgba(0,0,0,0.15)', color: '#52525b', '&:hover': { borderColor: '#1a6b2e', color: '#1a6b2e', background: '#f0fdf4' } }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}

        {/* ── Subscriptions List ── */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2].map(i => <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: '20px' }} />)}
          </Box>
        ) : subscriptions.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Box sx={{ fontSize: '4rem', mb: 2 }}>📦</Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#18181b', mb: 1 }}>No subscriptions yet</Typography>
            <Typography variant="body2" sx={{ color: '#71717a' }}>
              Create one to get weekly auto-orders delivered to your door
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {subscriptions.map(sub => (
              <Paper
                key={sub._id}
                elevation={0}
                sx={{
                  borderRadius: '20px',
                  border: `1px solid ${sub.active ? 'rgba(26,107,46,0.2)' : 'rgba(0,0,0,0.08)'}`,
                  borderLeft: `4px solid ${sub.active ? '#16a34a' : '#d1d5db'}`,
                  overflow: 'hidden',
                  boxShadow: sub.active ? '0 4px 20px rgba(26,107,46,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Card header */}
                <Box sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={sub.active ? '● Active' : '○ Paused'}
                        size="small"
                        sx={{
                          fontWeight: 700, fontSize: '0.72rem',
                          background: sub.active ? 'rgba(22,163,74,0.1)' : 'rgba(0,0,0,0.06)',
                          color: sub.active ? '#16a34a' : '#71717a',
                          border: `1px solid ${sub.active ? 'rgba(22,163,74,0.25)' : 'rgba(0,0,0,0.1)'}`,
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: '0.85rem', color: '#71717a' }} />
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                          Every {sub.day_name}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                      <LocationOn sx={{ fontSize: '0.85rem', color: '#71717a', mt: 0.2, flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: '#71717a', lineHeight: 1.4 }}>{sub.user_address}</Typography>
                    </Box>
                    {sub.last_order_placed_at && (
                      <Typography variant="caption" sx={{ color: '#a1a1aa', display: 'block', mt: 0.5 }}>
                        Last order: {formatDateIST(sub.last_order_placed_at)}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 2 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#1a6b2e', lineHeight: 1 }}>
                      ₹{sub.total_amount.toFixed(0)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#71717a' }}>per week</Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />

                {/* Items */}
                <Box sx={{ px: { xs: 2.5, md: 3 }, py: 2, background: 'rgba(0,0,0,0.015)' }}>
                  {sub.items.map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        {item.product_name} × {item.quantity}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a6b2e' }}>
                        ₹{item.total.toFixed(0)}
                      </Typography>
                    </Box>
                  ))}
                  {sub.notes && (
                    <Typography variant="caption" sx={{ color: '#71717a', fontStyle: 'italic', display: 'block', mt: 1 }}>
                      📝 {sub.notes}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />

                {/* Actions */}
                <Box sx={{ px: { xs: 2.5, md: 3 }, py: 2, display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="outlined" size="small" fullWidth
                    startIcon={sub.active ? <Pause /> : <PlayArrow />}
                    onClick={() => handleToggleActive(sub)}
                    sx={{
                      borderRadius: '10px', fontWeight: 700, textTransform: 'none', fontSize: '0.82rem',
                      borderColor: sub.active ? '#f59e0b' : '#16a34a',
                      color: sub.active ? '#d97706' : '#16a34a',
                      '&:hover': { background: sub.active ? 'rgba(245,158,11,0.06)' : 'rgba(22,163,74,0.06)' },
                    }}
                  >
                    {sub.active ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    variant="outlined" size="small" fullWidth
                    startIcon={<DeleteIcon />}
                    onClick={() => handleCancel(sub._id)}
                    sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', fontSize: '0.82rem', borderColor: '#fca5a5', color: '#dc2626', '&:hover': { background: 'rgba(220,38,38,0.06)' } }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Subscriptions;
