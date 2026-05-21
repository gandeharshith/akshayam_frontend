import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Badge,
  IconButton,
  Box,
  Container,
  Drawer,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Tooltip,
  Button
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
  ArrowForward,
  Spa,
  Logout as LogoutIcon,
  AccountCircle
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useUserAuth } from '../contexts/UserAuthContext';
import { stockAPI } from '../services/api';
import { StockValidationItem } from '../types';

const Navbar: React.FC = () => {
  const { itemCount, items, total, minOrderValue } = useCart();
  const { isLoggedIn, userEmail, logout } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stockErrors, setStockErrors] = useState<string[]>([]);
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdminContext = location.pathname.startsWith('/adddmin');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { text: 'Home',            path: '/',          icon: <HomeIcon fontSize="small" />,   emoji: '🏠' },
    { text: 'About',           path: '/about',     icon: <InfoIcon fontSize="small" />,   emoji: '🌿' },
    { text: 'Products',        path: '/products',  icon: <StoreIcon fontSize="small" />,  emoji: '🛒' },
    { text: 'Healthy Recipes', path: '/recipes',   icon: <RecipesIcon fontSize="small" />,emoji: '🥗' },
    { text: 'My Orders',       path: '/my-orders', icon: <OrdersIcon fontSize="small" />, emoji: '📦' },
  ];

  const handleCartClick = async () => {
    if (items.length === 0) { navigate('/cart'); return; }
    try {
      if (!isAdminContext && total < minOrderValue) {
        setStockErrors([`Minimum order value is ₹${minOrderValue}. Current: ₹${total.toFixed(2)}`]);
        setShowStockAlert(true);
        navigate('/cart');
        return;
      }
      const stockValidationItems: StockValidationItem[] = items.map(item => ({
        product_id: item.product._id,
        quantity: item.quantity
      }));
      const result = await stockAPI.validateStock({ items: stockValidationItems });
      if (!result.valid) {
        setStockErrors(result.invalid_items.map(i => i.error));
        setShowStockAlert(true);
      }
      navigate('/cart');
    } catch {
      navigate('/cart');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: scrolled
            ? 'rgba(15, 76, 37, 0.97)'
            : 'linear-gradient(135deg, #0f4c25 0%, #15803d 50%, #16a34a 100%)',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.2)' : 'none',
          zIndex: 1200,
        }}
      >
        <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 3 } }}>
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: '64px', md: '72px' },
              gap: 1,
            }}
          >
            {/* ── Logo ── */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                flexGrow: 1,
                transition: 'opacity 0.2s ease',
                '&:hover': { opacity: 0.9 },
              }}
            >
              <Box
                sx={{
                  width: { xs: 38, md: 44 },
                  height: { xs: 38, md: 44 },
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Spa sx={{ color: 'white', fontSize: { xs: '1.3rem', md: '1.5rem' } }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.05rem', sm: '1.2rem', md: '1.3rem' },
                    color: '#ffffff',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Akshayam
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: '0.65rem', md: '0.72rem' },
                    color: 'rgba(255,255,255,0.65)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  Wellness
                </Typography>
              </Box>
            </Box>

            {/* ── Desktop Nav ── */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {menuItems.map((item) => (
                  <Box
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 2,
                      py: 1,
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: isActive(item.path) ? '#ffffff' : 'rgba(255,255,255,0.75)',
                      fontWeight: isActive(item.path) ? 700 : 500,
                      fontSize: '0.875rem',
                      letterSpacing: '0.01em',
                      background: isActive(item.path)
                        ? 'rgba(255,255,255,0.18)'
                        : 'transparent',
                      border: isActive(item.path)
                        ? '1px solid rgba(255,255,255,0.25)'
                        : '1px solid transparent',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        color: '#ffffff',
                        background: 'rgba(255,255,255,0.12)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {item.icon}
                    {item.text}
                  </Box>
                ))}
              </Box>
            )}

            {/* ── User Session Pill (Desktop) ── */}
            {!isMobile && isLoggedIn && (
              <Tooltip title={`Logged in as ${userEmail}`} arrow>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    ml: 0.5,
                    maxWidth: 180,
                  }}
                >
                  <AccountCircle sx={{ color: '#4ade80', fontSize: '1.1rem', flexShrink: 0 }} />
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {userEmail}
                  </Typography>
                  <Tooltip title="Logout" arrow>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); logout(); }}
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        p: 0.25,
                        ml: 0.25,
                        borderRadius: '6px',
                        '&:hover': { color: '#fca5a5', background: 'rgba(239,68,68,0.15)' },
                      }}
                    >
                      <LogoutIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Tooltip>
            )}

            {/* ── Cart Button ── */}
            <Box
              onClick={handleCartClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: { xs: 1.5, md: 2 },
                py: { xs: 0.75, md: 1 },
                borderRadius: '12px',
                background: itemCount > 0
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                ml: 1,
                '&:hover': {
                  background: 'rgba(255,255,255,0.25)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                },
                '&:active': { transform: 'translateY(0)' },
              }}
            >
              <Badge
                badgeContent={itemCount}
                sx={{
                  '& .MuiBadge-badge': {
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    minWidth: '18px',
                    height: '18px',
                    border: '2px solid rgba(15,76,37,0.8)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  },
                }}
              >
                <ShoppingCart sx={{ color: 'white', fontSize: { xs: '1.2rem', md: '1.3rem' } }} />
              </Badge>
              {!isMobile && itemCount > 0 && (
                <Typography sx={{ color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
                  ₹{total.toFixed(0)}
                </Typography>
              )}
            </Box>

            {/* ── Mobile Hamburger ── */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{
                  ml: 0.5,
                  width: 42,
                  height: 42,
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* ══════════════════════════════════════════
          PREMIUM MOBILE DRAWER
      ══════════════════════════════════════════ */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        transitionDuration={350}
        sx={{
          '& .MuiDrawer-paper': {
            width: '85vw',
            maxWidth: 340,
            background: '#ffffff',
            boxShadow: '-8px 0 48px rgba(0,0,0,0.15)',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
          },
          '& .MuiBackdrop-root': {
            backdropFilter: 'blur(4px)',
            background: 'rgba(0,0,0,0.4)',
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0f4c25 0%, #15803d 60%, #16a34a 100%)',
            px: 3,
            pt: 3,
            pb: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -40,
              right: -40,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -20,
              left: -20,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Spa sx={{ color: 'white', fontSize: '1.4rem' }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '1.1rem', lineHeight: 1.1 }}>
                  Akshayam
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Wellness
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                color: 'white',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                width: 36,
                height: 36,
                borderRadius: '10px',
                '&:hover': { background: 'rgba(255,255,255,0.22)' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Cart summary in header */}
          {itemCount > 0 && (
            <Box
              onClick={() => { handleCartClick(); setMobileMenuOpen(false); }}
              sx={{
                mt: 2.5,
                p: 1.5,
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.2s ease',
                '&:hover': { background: 'rgba(255,255,255,0.2)' },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingCart sx={{ color: 'white', fontSize: '1.1rem' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2 }}>
                  {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>
                  ₹{total.toFixed(2)} total
                </Typography>
              </Box>
              <ArrowForward sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }} />
            </Box>
          )}
        </Box>

        {/* Nav Items */}
        <Box sx={{ flex: 1, px: 2, py: 2.5, overflowY: 'auto' }}>
          <Typography
            sx={{
              px: 1,
              mb: 1.5,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#a1a1aa',
            }}
          >
            Navigation
          </Typography>

          {menuItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <Box
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  mb: 0.5,
                  borderRadius: '14px',
                  textDecoration: 'none',
                  background: active
                    ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
                    : 'transparent',
                  border: active
                    ? '1px solid #bbf7d0'
                    : '1px solid transparent',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeInUp 0.4s ease both`,
                  animationDelay: `${index * 60}ms`,
                  '&:hover': {
                    background: active ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : '#f4f4f5',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                {/* Icon container */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    background: active
                      ? 'linear-gradient(135deg, #15803d, #22c55e)'
                      : '#f4f4f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 4px 12px rgba(21,128,61,0.3)' : 'none',
                  }}
                >
                  <Box sx={{ color: active ? 'white' : '#71717a', display: 'flex' }}>
                    {item.icon}
                  </Box>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.95rem',
                      color: active ? '#15803d' : '#18181b',
                      lineHeight: 1.2,
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>

                {active && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#15803d',
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Drawer Footer */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderTop: '1px solid #f4f4f5',
            background: '#fafafa',
          }}
        >
          {/* Logged-in user section in mobile drawer */}
          {isLoggedIn && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '1px solid #bbf7d0',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                <AccountCircle sx={{ color: '#15803d', fontSize: '1.2rem' }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Signed In
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userEmail}
                  </Typography>
                </Box>
              </Box>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<LogoutIcon sx={{ fontSize: '0.9rem' }} />}
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                sx={{
                  borderColor: '#fca5a5',
                  color: '#dc2626',
                  fontWeight: 600,
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  py: 0.75,
                  '&:hover': { borderColor: '#dc2626', background: '#fef2f2' },
                }}
              >
                Logout
              </Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
              }}
            />
            <Typography sx={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 500 }}>
              Organic • Natural • Pure
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Stock Alert */}
      <Snackbar
        open={showStockAlert}
        autoHideDuration={6000}
        onClose={() => { setShowStockAlert(false); setStockErrors([]); }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 9, zIndex: 1400 }}
      >
        <Alert
          onClose={() => { setShowStockAlert(false); setStockErrors([]); }}
          severity="warning"
          variant="filled"
          sx={{
            width: '100%',
            maxWidth: 480,
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(245,158,11,0.3)',
            '& .MuiAlert-icon': { fontSize: '1.4rem' },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Stock Availability Issues
          </Typography>
          {stockErrors.map((err, i) => (
            <Typography key={i} variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.95 }}>
              • {err}
            </Typography>
          ))}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
