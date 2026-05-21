import React, { useState } from 'react';
import {
  Container, Typography, Box, Grid, Button, TextField,
  CircularProgress, Alert, Chip, Divider, IconButton, Collapse
} from '@mui/material';
import {
  ExpandMore, ExpandLess, LocalShipping, CheckCircle,
  HourglassEmpty, Cancel, Search, Receipt, Logout, Refresh
} from '@mui/icons-material';
import { useUserAuth } from '../contexts/UserAuthContext';
import { Order } from '../types';

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    color: '#d97706', bg: '#fef3c7', border: '#fcd34d', icon: <HourglassEmpty sx={{ fontSize: '0.9rem' }} /> },
  confirmed:  { label: 'Confirmed',  color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: <CheckCircle sx={{ fontSize: '0.9rem' }} /> },
  processing: { label: 'Processing', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: <HourglassEmpty sx={{ fontSize: '0.9rem' }} /> },
  shipped:    { label: 'Shipped',    color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', icon: <LocalShipping sx={{ fontSize: '0.9rem' }} /> },
  delivered:  { label: 'Delivered',  color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: <CheckCircle sx={{ fontSize: '0.9rem' }} /> },
  cancelled:  { label: 'Cancelled',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: <Cancel sx={{ fontSize: '0.9rem' }} /> },
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[order.status?.toLowerCase()] || statusConfig.pending;
  const date = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <Box sx={{ background: 'white', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', mb: 2, transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderColor: 'rgba(21,128,61,0.1)' } }}>
      {/* Header */}
      <Box sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
          {cfg.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.85rem', md: '0.95rem' }, color: '#18181b' }}>
              Order #{order._id?.slice(-8).toUpperCase()}
            </Typography>
            <Chip label={cfg.label} size="small" sx={{ background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.65rem', height: 20, border: `1px solid ${cfg.border}` }} />
          </Box>
          <Typography sx={{ fontSize: '0.78rem', color: '#71717a' }}>{date} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#15803d', letterSpacing: '-0.01em' }}>₹{order.total_amount.toFixed(0)}</Typography>
          <IconButton size="small" sx={{ mt: 0.25, color: '#71717a', width: 28, height: 28 }}>
            {expanded ? <ExpandLess sx={{ fontSize: '1.1rem' }} /> : <ExpandMore sx={{ fontSize: '1.1rem' }} />}
          </IconButton>
        </Box>
      </Box>

      {/* Expanded */}
      <Collapse in={expanded}>
        <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          {/* Items */}
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1.5 }}>Items Ordered</Typography>
          {order.items.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: i < order.items.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#15803d', flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>{item.product_name}</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#a1a1aa' }}>×{item.quantity}</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#18181b' }}>₹{item.total.toFixed(0)}</Typography>
            </Box>
          ))}

          <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.05)' }} />

          {/* Delivery info */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1 }}>Delivery To</Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#18181b', mb: 0.25 }}>{order.user_name}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#71717a', mb: 0.25 }}>{order.user_email}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#71717a', mb: 0.25 }}>{order.user_phone}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#71717a' }}>{order.user_address}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1 }}>Order Total</Typography>
              <Box sx={{ p: 2, borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#52525b' }}>Subtotal</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#18181b' }}>₹{order.total_amount.toFixed(0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#52525b' }}>Delivery</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>Free</Typography>
                </Box>
                <Divider sx={{ borderColor: '#bbf7d0', mb: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#18181b' }}>Total</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#15803d' }}>₹{order.total_amount.toFixed(0)}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
};

/* ─────────────────────────────────────────────
   Login Form (shown when user is not logged in)
───────────────────────────────────────────── */
const LoginForm: React.FC = () => {
  const { login } = useUserAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or no orders found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ background: 'white', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', p: { xs: 3, md: 5 }, mb: 4, maxWidth: 480, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
          <Receipt sx={{ color: '#15803d', fontSize: '1.5rem' }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#18181b', mb: 0.5 }}>View Your Orders</Typography>
        <Typography sx={{ fontSize: '0.875rem', color: '#71717a' }}>
          Enter your credentials to access your order history.
          <br />
          <Typography component="span" sx={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
            You'll stay logged in for 3 months.
          </Typography>
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 2.5, fontSize: '0.875rem' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', '&.Mui-focused fieldset': { borderColor: '#15803d', borderWidth: '1.5px' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#15803d' } }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', '&.Mui-focused fieldset': { borderColor: '#15803d', borderWidth: '1.5px' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#15803d' } }}
        />
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Search />}
          sx={{ background: 'linear-gradient(135deg,#15803d,#22c55e)', color: 'white', fontWeight: 700, py: 1.75, borderRadius: '14px', textTransform: 'none', fontSize: '1rem', boxShadow: '0 4px 16px rgba(21,128,61,0.3)', '&:hover': { background: 'linear-gradient(135deg,#14532d,#15803d)' }, '&.Mui-disabled': { background: '#e4e4e7', color: '#a1a1aa' } }}
        >
          {loading ? 'Signing in…' : 'View My Orders'}
        </Button>
      </Box>
    </Box>
  );
};

/* ─────────────────────────────────────────────
   Orders List (shown when user is logged in)
───────────────────────────────────────────── */
const OrdersList: React.FC = () => {
  const { userEmail, orders, ordersLoading, ordersError, logout, refreshOrders } = useUserAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  return (
    <Box>
      {/* Header bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#18181b' }}>
            {ordersLoading
              ? 'Loading orders…'
              : `${orders.length} Order${orders.length !== 1 ? 's' : ''} Found`}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#71717a' }}>{userEmail}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Refresh button */}
          <Button
            size="small"
            variant="outlined"
            onClick={handleRefresh}
            disabled={refreshing || ordersLoading}
            startIcon={refreshing ? <CircularProgress size={14} color="inherit" /> : <Refresh sx={{ fontSize: '1rem' }} />}
            sx={{ borderColor: 'rgba(0,0,0,0.12)', color: '#52525b', fontWeight: 600, borderRadius: '10px', textTransform: 'none', fontSize: '0.8rem', '&:hover': { borderColor: '#15803d', color: '#15803d', background: '#f0fdf4' } }}
          >
            Refresh
          </Button>

          {/* Logout button */}
          <Button
            size="small"
            variant="outlined"
            onClick={logout}
            startIcon={<Logout sx={{ fontSize: '1rem' }} />}
            sx={{ borderColor: '#fecaca', color: '#dc2626', fontWeight: 600, borderRadius: '10px', textTransform: 'none', fontSize: '0.8rem', '&:hover': { borderColor: '#dc2626', background: '#fef2f2' } }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {ordersError && (
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>{ordersError}</Alert>
      )}

      {/* Loading skeleton */}
      {ordersLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#15803d' }} />
        </Box>
      )}

      {/* Empty state */}
      {!ordersLoading && orders.length === 0 && !ordersError && (
        <Box sx={{ textAlign: 'center', py: { xs: 6, md: 8 }, background: 'white', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <Box sx={{ fontSize: '3.5rem', mb: 2 }}>📦</Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#18181b', mb: 1 }}>No orders yet</Typography>
          <Typography sx={{ color: '#71717a', fontSize: '0.9rem', mb: 3 }}>You haven't placed any orders with this account.</Typography>
          <Button
            variant="contained"
            href="/products"
            sx={{ background: 'linear-gradient(135deg,#15803d,#22c55e)', color: 'white', fontWeight: 700, px: 4, py: 1.5, borderRadius: '14px', textTransform: 'none', boxShadow: '0 4px 16px rgba(21,128,61,0.3)', '&:hover': { background: 'linear-gradient(135deg,#14532d,#15803d)' } }}
          >
            Start Shopping
          </Button>
        </Box>
      )}

      {/* Orders */}
      {!ordersLoading && orders.map(order => <OrderCard key={order._id} order={order} />)}
    </Box>
  );
};

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
const MyOrders: React.FC = () => {
  const { isLoggedIn } = useUserAuth();

  return (
    <Box sx={{ background: '#fafafa', minHeight: '100vh' }}>
      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg,#0f4c25 0%,#15803d 60%,#16a34a 100%)', pt: { xs: 5, md: 7 }, pb: { xs: 8, md: 10 }, position: 'relative', overflow: 'hidden', '&::after': { content: '""', position: 'absolute', bottom: -2, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom,transparent,#fafafa)' } }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: '100px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', mb: 2.5 }}>
            <Receipt sx={{ color: '#4ade80', fontSize: '0.9rem' }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Order History</Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.8rem' }, color: 'white', letterSpacing: '-0.02em', mb: 1.5 }}>My Orders</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.7 }}>
            Track and manage all your orders in one place
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
        {isLoggedIn ? <OrdersList /> : <LoginForm />}
      </Container>
    </Box>
  );
};

export default MyOrders;
