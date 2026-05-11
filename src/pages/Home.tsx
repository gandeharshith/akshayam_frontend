import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Alert,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Park,
  VerifiedUser,
  ArrowForward,
  Star,
  Schedule,
  CheckCircle,
  LocalShipping,
  Spa,
  EmojiNature,
  Favorite,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { contentAPI, categoriesAPI, productsAPI } from '../services/api';
import { cachedApiCall } from '../services/cache';
import { Content, Category, Product } from '../types';
import LazyImage from '../components/LazyImage';

declare const process: { env: { REACT_APP_API_URL?: string } };
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/* ─── Animated Counter ─── */
const AnimatedNumber: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const duration = 1800;
        const step = (ts: number) => {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * value));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);
  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─── Featured Banner ─── */
const FeaturedBanner: React.FC<{
  newlyLaunched: Product | null;
  thisWeeksFresh: Product | null;
  onNavigate: (categoryId: string) => void;
  onProductNavigate: (productId: string) => void;
}> = ({ newlyLaunched, thisWeeksFresh, onNavigate, onProductNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const products = [newlyLaunched, thisWeeksFresh].filter(Boolean) as Product[];

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => setCurrentIndex(p => (p + 1) % products.length), 3500);
    return () => clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) return null;
  const current = products[currentIndex];
  const isNew = current === newlyLaunched;

  return (
    <Box
      onClick={() => onProductNavigate(current._id)}
      sx={{
        mb: { xs: 4, md: 6 },
        cursor: 'pointer',
        borderRadius: '20px',
        overflow: 'hidden',
        background: isNew
          ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)'
          : 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 50%, #4ade80 100%)',
        border: isNew ? '1px solid #fcd34d' : '1px solid #86efac',
        boxShadow: isNew ? '0 8px 32px rgba(245,158,11,0.2)' : '0 8px 32px rgba(34,197,94,0.2)',
        transition: 'all 0.4s ease',
        '&:hover': { transform: 'translateY(-3px)' },
      }}
    >
      <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          width: { xs: 52, md: 64 }, height: { xs: 52, md: 64 },
          borderRadius: '16px',
          background: isNew ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: { xs: '1.8rem', md: '2.2rem' }, flexShrink: 0,
        }}>
          {isNew ? '🎉' : '🌱'}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Chip
            label={isNew ? 'NEWLY LAUNCHED' : "THIS WEEK'S FRESH"}
            size="small"
            sx={{
              background: isNew ? '#f59e0b' : '#16a34a', color: 'white',
              fontWeight: 800, fontSize: '0.6rem', letterSpacing: '0.08em', height: 20, mb: 0.5,
            }}
          />
          <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.2rem' }, color: '#18181b', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {current.name}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#52525b', fontWeight: 600 }}>₹{current.price}</Typography>
        </Box>
        <Box sx={{
          width: { xs: 36, md: 44 }, height: { xs: 36, md: 44 }, borderRadius: '12px',
          background: isNew ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <ArrowForward sx={{ color: isNew ? '#d97706' : '#15803d', fontSize: '1.1rem' }} />
        </Box>
      </Box>
    </Box>
  );
};

/* ─── Feature Card ─── */
const FeatureCard: React.FC<{
  icon: React.ReactNode; title: string; description: string; gradient: string; delay?: number;
}> = ({ icon, title, description, gradient, delay = 0 }) => (
  <Box sx={{
    p: { xs: 3, md: 3.5 }, borderRadius: '20px', background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    height: '100%', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    position: 'relative', overflow: 'hidden',
    animation: 'fadeInUp 0.6s ease both', animationDelay: `${delay}ms`,
    '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
    '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: gradient, opacity: 0, transition: 'opacity 0.3s ease' },
    '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 48px rgba(0,0,0,0.12)', '&::before': { opacity: 1 } },
  }}>
    <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', color: 'white', fontSize: '1.5rem' }}>
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' }, color: '#18181b', mb: 1, letterSpacing: '-0.01em' }}>{title}</Typography>
    <Typography sx={{ fontSize: { xs: '0.875rem', md: '0.9rem' }, color: '#71717a', lineHeight: 1.6 }}>{description}</Typography>
  </Box>
);

/* ─── Category Card ─── */
const CategoryCard: React.FC<{ category: Category; onNavigate: (id: string) => void; index: number }> = ({ category, onNavigate, index }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      onClick={() => onNavigate(category._id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: hovered ? '0 20px 48px rgba(21,128,61,0.18)' : '0 2px 12px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        animation: 'fadeInUp 0.6s ease both', animationDelay: `${index * 120}ms`,
        height: '100%', display: 'flex', flexDirection: 'column',
      }}
    >
      <Box sx={{ height: { xs: 180, sm: 200, md: 220 }, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', flexShrink: 0 }}>
        {category.image_url ? (
          <LazyImage
            src={`${API_URL}${category.image_url}`}
            alt={category.name}
            height={220}
            sx={{ transform: hovered ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.5s ease', width: '100%', height: '100%' }}
          />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🌿</Box>
        )}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(15,76,37,0.7) 0%, transparent 60%)',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease',
          display: 'flex', alignItems: 'flex-end', p: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'white', fontWeight: 700, fontSize: '0.875rem', transform: hovered ? 'translateY(0)' : 'translateY(8px)', transition: 'transform 0.3s ease' }}>
            Shop Now <ArrowForward sx={{ fontSize: '1rem' }} />
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: { xs: 2.5, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.05rem', md: '1.15rem' }, color: '#18181b', mb: 1, letterSpacing: '-0.01em' }}>{category.name}</Typography>
        <Typography sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' }, color: '#71717a', lineHeight: 1.6, flex: 1 }}>
          {category.description || 'Discover our organic products in this category'}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5, color: '#15803d', fontWeight: 600, fontSize: '0.85rem' }}>
          Explore <ArrowForward sx={{ fontSize: '0.9rem' }} />
        </Box>
      </Box>
    </Box>
  );
};

/* ─── Stat Card ─── */
const StatCard: React.FC<{ value: number; suffix: string; label: string; icon: React.ReactNode }> = ({ value, suffix, label, icon }) => (
  <Box sx={{
    textAlign: 'center', p: { xs: 2.5, md: 3 }, borderRadius: '20px',
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s ease',
    '&:hover': { background: 'rgba(255,255,255,0.18)', transform: 'translateY(-4px)' },
  }}>
    <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, color: 'white' }}>
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' }, color: 'white', lineHeight: 1, mb: 0.5, letterSpacing: '-0.02em' }}>
      <AnimatedNumber value={value} suffix={suffix} />
    </Typography>
    <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.8rem' }, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{label}</Typography>
  </Box>
);

/* ─── Section Header ─── */
const SectionHeader: React.FC<{ eyebrow: string; title: string; subtitle?: string; icon?: React.ReactNode }> = ({ eyebrow, title, subtitle, icon }) => (
  <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2.5, py: 0.75, borderRadius: '100px', background: 'rgba(26,107,46,0.08)', border: '1px solid rgba(26,107,46,0.15)', mb: 2 }}>
      {icon || <Spa sx={{ fontSize: '0.85rem', color: '#1a6b2e' }} />}
      <Typography sx={{ color: '#1a6b2e', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{eyebrow}</Typography>
    </Box>
    <Typography component="h2" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: { xs: '1.9rem', sm: '2.4rem', md: '2.8rem' }, color: '#1a1a1a', letterSpacing: '-0.02em', mb: subtitle ? 1.5 : 0, lineHeight: 1.2 }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography sx={{ color: '#666', maxWidth: 560, mx: 'auto', fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.7 }}>{subtitle}</Typography>
    )}
  </Box>
);

/* ─── Main Home ─── */
const Home: React.FC = () => {
  const [content, setContent] = useState<Content | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<{ newly_launched: Product | null; this_weeks_fresh: Product | null }>({ newly_launched: null, this_weeks_fresh: null });
  const [deliveryContent, setDeliveryContent] = useState<Content | null>(null);
  const [feature1, setFeature1] = useState<Content | null>(null);
  const [feature2, setFeature2] = useState<Content | null>(null);
  const [feature3, setFeature3] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeContent, categoriesData] = await Promise.all([
          cachedApiCall('home-content', () => contentAPI.get('home'), 10 * 60 * 1000),
          cachedApiCall('categories', () => categoriesAPI.getAll(), 5 * 60 * 1000),
        ]);
        setContent(homeContent);
        setCategories(categoriesData);
        cachedApiCall('featured-products', () => productsAPI.getFeatured(), 5 * 60 * 1000).then(setFeaturedProducts).catch(() => {});
        Promise.all([
          cachedApiCall('delivery-schedule', () => contentAPI.getSection('delivery', 'schedule'), 30 * 60 * 1000).catch(() => null),
          cachedApiCall('feature-1', () => contentAPI.getSection('home', 'feature_1'), 30 * 60 * 1000).catch(() => null),
          cachedApiCall('feature-2', () => contentAPI.getSection('home', 'feature_2'), 30 * 60 * 1000).catch(() => null),
          cachedApiCall('feature-3', () => contentAPI.getSection('home', 'feature_3'), 30 * 60 * 1000).catch(() => null),
        ]).then(([d, f1, f2, f3]) => { setDeliveryContent(d); setFeature1(f1); setFeature2(f2); setFeature3(f3); }).catch(() => {});
      } catch {
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={isMobile ? 300 : 420} sx={{ borderRadius: '24px', mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: '20px', mb: 2 }} />
              <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} width="70%" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) return <Container sx={{ py: 4 }}><Alert severity="error" sx={{ borderRadius: '14px' }}>{error}</Alert></Container>;

  const features = [
    { icon: <Park fontSize="inherit" />, title: feature1?.title || '100% Organic', description: feature1?.content || 'All our products are certified organic or self-produced from cow-based natural farming practices.', gradient: 'linear-gradient(135deg,#1a6b2e,#2d9e4a)' },
    { icon: <VerifiedUser fontSize="inherit" />, title: feature2?.title || 'Quality Assured', description: feature2?.content || 'Every product undergoes rigorous quality checks before reaching you — no compromises.', gradient: 'linear-gradient(135deg,#0277bd,#0288d1)' },
    { icon: <Schedule fontSize="inherit" />, title: feature3?.title || 'Delivery Schedule', description: feature3?.content || deliveryContent?.content || 'Order before Wednesday 6 PM and receive your delivery on Sunday.', gradient: 'linear-gradient(135deg,#e65100,#f57c00)' },
  ];

  const stats = [
    { value: 100, suffix: '%', label: 'Organic Products', icon: <EmojiNature /> },
    { value: 500, suffix: '+', label: 'Happy Customers', icon: <Favorite /> },
    { value: 50, suffix: '+', label: 'Product Varieties', icon: <TrendingUp /> },
    { value: 5, suffix: '★', label: 'Customer Rating', icon: <Star /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#f9fdf9' }}>

      {/* ═══ HERO ═══ */}
      <Box sx={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg,#0d4a1e 0%,#1a6b2e 40%,#2d9e4a 80%,#3db85a 100%)',
        pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 },
        '&::before': { content: '""', position: 'absolute', top: -100, right: -100, width: { xs: 300, md: 500 }, height: { xs: 300, md: 500 }, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,0.06) 0%,transparent 70%)', pointerEvents: 'none' },
        '&::after': { content: '""', position: 'absolute', bottom: -80, left: -80, width: { xs: 200, md: 350 }, height: { xs: 200, md: 350 }, borderRadius: '50%', background: 'radial-gradient(circle,rgba(240,165,0,0.08) 0%,transparent 70%)', pointerEvents: 'none' },
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            {content?.logo_url && (
              <Box sx={{ mb: { xs: 3, md: 4 }, display: 'flex', justifyContent: 'center', animation: 'scaleIn 0.7s ease both', '@keyframes scaleIn': { from: { opacity: 0, transform: 'scale(0.8)' }, to: { opacity: 1, transform: 'scale(1)' } } }}>
                <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                  <LazyImage src={`${API_URL}${content.logo_url}`} alt="Akshayam Wellness Logo" height={isMobile ? 80 : 110} width="auto" sx={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' }} />
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2.5, py: 0.75, borderRadius: '100px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', mb: { xs: 2.5, md: 3 }, animation: 'fadeInDown 0.6s ease 0.1s both', '@keyframes fadeInDown': { from: { opacity: 0, transform: 'translateY(-16px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
              <Spa sx={{ fontSize: '0.9rem', color: '#a8e6b8' }} />
              <Typography sx={{ color: 'rgba(168,230,184,0.95)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Certified Organic Wellness</Typography>
            </Box>

            <Typography component="h1" sx={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 800, fontSize: { xs: '2.2rem', sm: '3rem', md: '3.8rem', lg: '4.4rem' }, lineHeight: { xs: 1.15, md: 1.1 }, color: '#ffffff', mb: { xs: 2, md: 2.5 }, letterSpacing: '-0.02em', textShadow: '0 4px 16px rgba(0,0,0,0.15)', animation: 'fadeInUp 0.7s ease 0.2s both', '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
              {content?.title || 'Welcome to Akshayam Wellness'}
            </Typography>

            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }, fontWeight: 400, maxWidth: 680, mx: 'auto', lineHeight: 1.7, mb: { xs: 4, md: 5 }, px: { xs: 1, md: 0 }, animation: 'fadeInUp 0.7s ease 0.35s both' }}>
              {content?.content || 'Your trusted partner in organic wellness — pure, natural products crafted with care for your health and the planet.'}
            </Typography>

            <Box sx={{ display: 'flex', gap: { xs: 2, md: 2.5 }, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', px: { xs: 2, sm: 0 }, animation: 'fadeInUp 0.7s ease 0.5s both' }}>
              <Button variant="contained" size="large" onClick={() => navigate('/products')} endIcon={<ArrowForward />}
                sx={{ background: 'linear-gradient(135deg,#f0a500,#ffc53d)', color: '#0d4a1e', fontWeight: 800, fontSize: { xs: '1rem', md: '1.05rem' }, px: { xs: 4, md: 5 }, py: { xs: 1.6, md: 1.8 }, borderRadius: '14px', textTransform: 'none', boxShadow: '0 8px 32px rgba(240,165,0,0.4)', minWidth: { xs: '200px', sm: 'auto' }, '&:hover': { background: 'linear-gradient(135deg,#ffc53d,#f0a500)', transform: 'translateY(-3px)', boxShadow: '0 12px 40px rgba(240,165,0,0.5)' } }}>
                Shop Now
              </Button>
              <Button variant="outlined" size="large" onClick={() => navigate('/about')}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: { xs: '1rem', md: '1.05rem' }, px: { xs: 4, md: 5 }, py: { xs: 1.6, md: 1.8 }, borderRadius: '14px', textTransform: 'none', backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.08)', minWidth: { xs: '200px', sm: 'auto' }, '&:hover': { borderColor: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', transform: 'translateY(-2px)' } }}>
                Our Story
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, justifyContent: 'center', flexWrap: 'wrap', mt: { xs: 4, md: 5 }, animation: 'fadeInUp 0.7s ease 0.65s both' }}>
              {[
                { icon: <CheckCircle sx={{ fontSize: '0.9rem' }} />, label: 'Certified Organic' },
                { icon: <Star sx={{ fontSize: '0.9rem' }} />, label: 'Premium Quality' },
                { icon: <LocalShipping sx={{ fontSize: '0.9rem' }} />, label: 'Weekly Delivery' },
              ].map(badge => (
                <Box key={badge.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 2, py: 0.75, borderRadius: '100px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: '0.78rem', fontWeight: 600, backdropFilter: 'blur(10px)' }}>
                  {badge.icon}{badge.label}
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
        <Box sx={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: { xs: 40, md: 60 }, background: '#f9fdf9', clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>

        {/* ═══ FEATURED BANNER ═══ */}
        {(featuredProducts.newly_launched || featuredProducts.this_weeks_fresh) && (
          <FeaturedBanner
            newlyLaunched={featuredProducts.newly_launched}
            thisWeeksFresh={featuredProducts.this_weeks_fresh}
            onNavigate={categoryId => navigate(`/products?category=${categoryId}`)}
            onProductNavigate={productId => navigate(`/products/${productId}`)}
          />
        )}

        {/* ═══ STATS ═══ */}
        <Box sx={{ borderRadius: '20px', background: 'linear-gradient(135deg,#0d4a1e 0%,#1a6b2e 50%,#2d9e4a 100%)', mb: { xs: 6, md: 10 }, overflow: 'hidden', boxShadow: '0 8px 40px rgba(26,107,46,0.25)', p: { xs: 2, md: 3 } }}>
          <Grid container spacing={2}>
            {stats.map((stat, i) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <StatCard {...stat} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ═══ CATEGORIES ═══ */}
        <Box sx={{ mb: { xs: 6, md: 10 } }}>
          <SectionHeader eyebrow="Our Collections" title="Product Categories" subtitle="Explore our carefully curated selection of organic wellness products" />
          <Grid container spacing={{ xs: 2.5, md: 3.5 }}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <CategoryCard category={category} onNavigate={id => navigate(`/products?category=${id}`)} index={index} />
              </Grid>
            ))}
          </Grid>
          {categories.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: { xs: 4, md: 5 } }}>
              <Button variant="outlined" size="large" onClick={() => navigate('/products')} endIcon={<ArrowForward />}
                sx={{ borderColor: '#1a6b2e', color: '#1a6b2e', fontWeight: 700, px: 4, py: 1.5, borderRadius: '12px', textTransform: 'none', fontSize: '0.95rem', borderWidth: '2px', '&:hover': { borderWidth: '2px', background: 'rgba(26,107,46,0.06)', transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(26,107,46,0.15)' } }}>
                View All Products
              </Button>
            </Box>
          )}
        </Box>

        {/* ═══ WHY CHOOSE US ═══ */}
        <Box sx={{ borderRadius: '28px', background: 'linear-gradient(135deg,#f0faf2 0%,#ffffff 50%,#f0f8ff 100%)', border: '1px solid rgba(26,107,46,0.06)', py: { xs: 5, md: 8 }, px: { xs: 3, md: 6 }, mb: { xs: 6, md: 10 } }}>
          <SectionHeader eyebrow="Why Choose Us" title="The Akshayam Difference" subtitle="Experience the difference of authentic organic products with our unwavering commitment to quality" icon={<CheckCircle sx={{ fontSize: '0.85rem', color: '#1a6b2e' }} />} />
          <Grid container spacing={{ xs: 2.5, md: 3.5 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} gradient={feature.gradient} delay={index * 150} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ═══ CTA ═══ */}
        <Box sx={{ borderRadius: '28px', background: 'linear-gradient(135deg,#0d4a1e 0%,#1a6b2e 50%,#2d9e4a 100%)', py: { xs: 5, md: 7 }, px: { xs: 3, md: 6 }, textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 50px rgba(26,107,46,0.3)', '&::before': { content: '""', position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' } }}>
          <Typography sx={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 700, fontSize: { xs: '1.7rem', md: '2.4rem' }, color: 'white', mb: 1.5, lineHeight: 1.2, position: 'relative', zIndex: 1 }}>
            Ready to Start Your Wellness Journey?
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.95rem', md: '1.05rem' }, mb: { xs: 3.5, md: 4 }, maxWidth: 500, mx: 'auto', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
            Browse our full collection of organic products and experience the purity of nature.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Button variant="contained" size="large" onClick={() => navigate('/products')} endIcon={<ArrowForward />}
              sx={{ background: 'linear-gradient(135deg,#f0a500,#ffc53d)', color: '#0d4a1e', fontWeight: 800, px: { xs: 4, md: 5 }, py: 1.7, borderRadius: '14px', textTransform: 'none', fontSize: '1rem', boxShadow: '0 8px 28px rgba(240,165,0,0.4)', minWidth: { xs: '200px', sm: 'auto' }, '&:hover': { background: 'linear-gradient(135deg,#ffc53d,#f0a500)', transform: 'translateY(-3px)', boxShadow: '0 12px 36px rgba(240,165,0,0.5)' } }}>
              Explore Products
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/recipes')}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', fontWeight: 600, px: { xs: 4, md: 5 }, py: 1.7, borderRadius: '14px', textTransform: 'none', fontSize: '1rem', background: 'rgba(255,255,255,0.08)', minWidth: { xs: '200px', sm: 'auto' }, '&:hover': { borderColor: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', transform: 'translateY(-2px)' } }}>
              Healthy Recipes
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
