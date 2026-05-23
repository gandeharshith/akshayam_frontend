import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Grid, Button, Chip,
  Alert, IconButton, Breadcrumbs,
  Divider, Skeleton
} from '@mui/material';
import {
  Add, Remove, ShoppingCart, ArrowBack, CheckCircle,
  LocalShipping, Verified, EmojiNature, Star,
  NavigateNext, Share, Autorenew as SubscribeIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import { cachedApiCall } from '../services/cache';
import { useCart } from '../contexts/CartContext';
import { Product, Category } from '../types';

declare const process: { env: { REACT_APP_API_URL?: string } };
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, addItem, updateQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgZoomed, setImgZoomed] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const [copied, setCopied] = useState(false);

  const cartItem = items.find(i => i.product._id === id);
  const cartQty = cartItem?.quantity || 0;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const [allProducts, allCategories] = await Promise.all([
          cachedApiCall('products', () => productsAPI.getAll(), 5 * 60 * 1000),
          cachedApiCall('categories', () => categoriesAPI.getAll(), 10 * 60 * 1000),
        ]);
        const found = allProducts.find((p: Product) => p._id === id);
        if (!found) { setError('Product not found'); setLoading(false); return; }
        setProduct(found);
        const cat = allCategories.find((c: Category) => c._id === found.category_id);
        setCategory(cat || null);
        const related = allProducts
          .filter((p: Product) => p._id !== id && p.category_id === found.category_id)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleInc = () => {
    if (!product) return;
    updateQuantity(product._id, cartQty + 1);
  };

  const handleDec = () => {
    if (!product) return;
    updateQuantity(product._id, cartQty - 1);
  };

  if (loading) return (
    <Box sx={{ background: '#f9fdf9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Skeleton variant="rectangular" height={40} width={300} sx={{ borderRadius: '10px', mb: 3 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rectangular" height={420} sx={{ borderRadius: '20px' }} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Skeleton variant="text" height={50} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={30} width="40%" sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '14px', mb: 2 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: '14px' }} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  if (error || !product) return (
    <Container sx={{ py: 6, textAlign: 'center' }}>
      <Box sx={{ fontSize: '4rem', mb: 2 }}>😕</Box>
      <Alert severity="error" sx={{ borderRadius: '14px', maxWidth: 400, mx: 'auto', mb: 3 }}>
        {error || 'Product not found'}
      </Alert>
      <Button onClick={() => navigate('/products')} startIcon={<ArrowBack />}
        sx={{ borderColor: '#1a6b2e', color: '#1a6b2e', borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
        variant="outlined">
        Back to Products
      </Button>
    </Container>
  );

  const oos = product.quantity === 0;

  return (
    <Box sx={{ background: '#f9fdf9', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <Box sx={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', py: 1.5 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Breadcrumbs separator={<NavigateNext sx={{ fontSize: '0.9rem' }} />} sx={{ fontSize: '0.82rem' }}>
            <Box component={Link} to="/" sx={{ color: '#71717a', textDecoration: 'none', '&:hover': { color: '#1a6b2e' } }}>Home</Box>
            <Box component={Link} to="/products" sx={{ color: '#71717a', textDecoration: 'none', '&:hover': { color: '#1a6b2e' } }}>Products</Box>
            {category && (
              <Box component={Link} to={`/products?category=${category._id}`} sx={{ color: '#71717a', textDecoration: 'none', '&:hover': { color: '#1a6b2e' } }}>
                {category.name}
              </Box>
            )}
            <Typography sx={{ fontSize: '0.82rem', color: '#18181b', fontWeight: 600 }}>
              {product.name.length > 30 ? product.name.slice(0, 30) + '…' : product.name}
            </Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
        <Grid container spacing={{ xs: 3, md: 5 }}>
          {/* ── Left: Image ── */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
              {/* Main Image */}
              <Box
                onClick={() => setImgZoomed(!imgZoomed)}
                sx={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  border: '1px solid rgba(26,107,46,0.1)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
                  aspectRatio: '1/1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'zoom-in',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: '0 16px 56px rgba(26,107,46,0.15)' },
                }}
              >
                {product.image_url ? (
                  <img
                    src={`${API_URL}${product.image_url}`}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                      transform: imgZoomed ? 'scale(1.15)' : 'scale(1)',
                    }}
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Box sx={{ fontSize: '6rem' }}>🌿</Box>
                )}

                {/* Badges overlay */}
                <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {product.best_seller && (
                    <Box sx={{ px: 1.5, py: 0.5, borderRadius: '20px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'white' }}>⭐ Best Seller</Typography>
                    </Box>
                  )}
                  {product.newly_launched && (
                    <Box sx={{ px: 1.5, py: 0.5, borderRadius: '20px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'white' }}>✨ New Launch</Typography>
                    </Box>
                  )}
                  {product.this_weeks_fresh && (
                    <Box sx={{ px: 1.5, py: 0.5, borderRadius: '20px', background: 'linear-gradient(135deg,#0891b2,#06b6d4)', boxShadow: '0 2px 8px rgba(8,145,178,0.4)' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'white' }}>🌱 This Week's Fresh</Typography>
                    </Box>
                  )}
                </Box>

                {/* Share / Copy-link button */}
                <IconButton
                  onClick={async e => {
                    e.stopPropagation();
                    const url = window.location.href;
                    if (navigator.share) {
                      try {
                        await navigator.share({ title: product.name, url });
                      } catch {
                        // User cancelled or share failed — fall back to clipboard
                        try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
                      }
                    } else {
                      try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
                    }
                  }}
                  title={copied ? 'Link copied!' : 'Share product'}
                  sx={{
                    position: 'absolute', top: 12, right: 12,
                    background: copied ? 'rgba(22,163,74,0.9)' : 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)', width: 36, height: 36,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': { background: copied ? 'rgba(22,163,74,1)' : 'white' }
                  }}
                >
                  {copied
                    ? <CheckCircle sx={{ fontSize: '1rem', color: 'white' }} />
                    : <Share sx={{ fontSize: '1rem', color: '#52525b' }} />
                  }
                </IconButton>
              </Box>

              {/* Trust badges */}
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, flexWrap: 'wrap' }}>
                {[
                  { icon: <EmojiNature sx={{ fontSize: '0.9rem', color: '#1a6b2e' }} />, label: '100% Organic' },
                  { icon: <Verified sx={{ fontSize: '0.9rem', color: '#1a6b2e' }} />, label: 'Quality Assured' },
                  { icon: <LocalShipping sx={{ fontSize: '0.9rem', color: '#1a6b2e' }} />, label: 'Sunday Delivery' },
                ].map(b => (
                  <Box key={b.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75, borderRadius: '10px', background: 'white', border: '1px solid rgba(26,107,46,0.12)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    {b.icon}
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#374151' }}>{b.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* ── Right: Details ── */}
          <Grid item xs={12} md={7}>
            {/* Category tag */}
            {category && (
              <Chip
                label={category.name}
                size="small"
                component={Link}
                to={`/products?category=${category._id}`}
                clickable
                sx={{ mb: 1.5, background: 'rgba(26,107,46,0.08)', color: '#1a6b2e', fontWeight: 700, fontSize: '0.72rem', border: '1px solid rgba(26,107,46,0.15)', '&:hover': { background: 'rgba(26,107,46,0.14)' } }}
              />
            )}

            {/* Product Name */}
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 800,
                fontSize: { xs: '1.6rem', md: '2.1rem' },
                color: '#18181b',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                mb: 1,
              }}
            >
              {product.name}
            </Typography>

            {/* Rating placeholder */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.25 }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} sx={{ fontSize: '1rem', color: s <= 4 ? '#f59e0b' : '#e5e7eb' }} />
                ))}
              </Box>
              <Typography sx={{ fontSize: '0.82rem', color: '#71717a', fontWeight: 500 }}>4.0 · Organic Certified</Typography>
            </Box>

            {/* Price */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2.5 }}>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#1a6b2e', letterSpacing: '-0.03em', lineHeight: 1 }}>
                ₹{product.price}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#71717a', fontWeight: 500 }}>per unit</Typography>
            </Box>

            {/* Stock status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                px: 1.5, py: 0.6, borderRadius: '20px',
                background: oos ? 'rgba(220,38,38,0.08)' : 'rgba(26,107,46,0.08)',
                border: `1px solid ${oos ? 'rgba(220,38,38,0.2)' : 'rgba(26,107,46,0.2)'}`,
              }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: oos ? '#dc2626' : '#16a34a', boxShadow: oos ? 'none' : '0 0 0 3px rgba(22,163,74,0.2)' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: oos ? '#dc2626' : '#16a34a' }}>
                  {oos ? 'Out of Stock' : 'In Stock'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3, borderColor: 'rgba(0,0,0,0.06)' }} />

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#18181b', mb: 1.5 }}>
                About this product
              </Typography>
              <Typography sx={{
                fontSize: '0.95rem', color: '#374151', lineHeight: 1.85,
                whiteSpace: 'pre-wrap',
              }}>
                {product.description || 'A premium organic product from Akshayam Wellness, carefully sourced and quality-checked for your health and wellbeing.'}
              </Typography>
            </Box>

            {/* Key highlights */}
            <Box sx={{ mb: 3, p: 2.5, borderRadius: '16px', background: 'linear-gradient(135deg,#f0fdf4,#f7fef9)', border: '1px solid rgba(26,107,46,0.1)' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a6b2e', mb: 1.5 }}>
                🌿 Why Choose This?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  'Naturally grown without harmful pesticides',
                  'Rich in essential nutrients and minerals',
                  'Freshly sourced and delivered every Sunday',
                  'Supports local organic farmers',
                ].map((point, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: '0.9rem', color: '#16a34a', mt: 0.2, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>{point}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Add to Cart */}
            {!oos ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {cartQty > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      background: 'linear-gradient(135deg,rgba(26,107,46,0.06),rgba(45,158,74,0.08))',
                      border: '2px solid rgba(26,107,46,0.2)',
                      borderRadius: '16px', px: 2, py: 1.25, flex: 1,
                      justifyContent: 'space-between',
                    }}>
                      <IconButton onClick={handleDec}
                        sx={{ width: 40, height: 40, background: 'white', border: '1.5px solid rgba(26,107,46,0.2)', borderRadius: '12px', color: '#1a6b2e', '&:hover': { background: '#f0fdf4' } }}>
                        <Remove />
                      </IconButton>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#1a6b2e', lineHeight: 1 }}>{cartQty}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 500 }}>in cart</Typography>
                      </Box>
                      <IconButton onClick={handleInc}
                        sx={{ width: 40, height: 40, background: 'linear-gradient(135deg,#1a6b2e,#2d9e4a)', borderRadius: '12px', color: 'white', '&:hover': { background: 'linear-gradient(135deg,#0d4a1e,#1a6b2e)' } }}>
                        <Add />
                      </IconButton>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/cart')}
                      endIcon={<ShoppingCart />}
                      sx={{
                        background: 'linear-gradient(135deg,#1a6b2e,#2d9e4a)',
                        color: 'white', fontWeight: 700, py: 1.75, px: 3,
                        borderRadius: '16px', textTransform: 'none', fontSize: '0.95rem',
                        boxShadow: '0 4px 16px rgba(26,107,46,0.3)',
                        '&:hover': { background: 'linear-gradient(135deg,#0d4a1e,#1a6b2e)' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      View Cart
                    </Button>
                  </Box>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddToCart}
                    startIcon={addedAnim ? <CheckCircle /> : <ShoppingCart />}
                    sx={{
                      background: addedAnim
                        ? 'linear-gradient(135deg,#16a34a,#22c55e)'
                        : 'linear-gradient(135deg,#1a6b2e,#2d9e4a)',
                      color: 'white', fontWeight: 800,
                      py: { xs: 1.75, md: 2 }, borderRadius: '16px',
                      textTransform: 'none', fontSize: '1.05rem',
                      boxShadow: '0 6px 24px rgba(26,107,46,0.35)',
                      transition: 'all 0.3s ease',
                      '&:hover': { background: 'linear-gradient(135deg,#0d4a1e,#1a6b2e)', transform: 'translateY(-2px)', boxShadow: '0 10px 32px rgba(26,107,46,0.4)' },
                    }}
                  >
                    {addedAnim ? 'Added to Cart!' : 'Add to Cart'}
                  </Button>
                )}

                {/* Subscribe Weekly button */}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SubscribeIcon />}
                  onClick={() => {
                    const params = new URLSearchParams({
                      product_id: product._id || '',
                      product_name: product.name,
                      price: String(product.price),
                    });
                    navigate(`/subscriptions?${params.toString()}`);
                  }}
                  sx={{
                    borderColor: '#7c3aed',
                    color: '#7c3aed',
                    fontWeight: 700,
                    py: 1.5,
                    borderRadius: '16px',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    background: 'rgba(124,58,237,0.04)',
                    '&:hover': { borderColor: '#6d28d9', color: '#6d28d9', background: 'rgba(124,58,237,0.08)' },
                  }}
                >
                  Subscribe Weekly 🔄
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/products')}
                  startIcon={<ArrowBack />}
                  sx={{
                    borderColor: 'rgba(0,0,0,0.12)', color: '#52525b',
                    fontWeight: 600, py: 1.5, borderRadius: '16px', textTransform: 'none',
                    '&:hover': { borderColor: '#1a6b2e', color: '#1a6b2e', background: '#f0fdf4' }
                  }}
                >
                  Continue Shopping
                </Button>
              </Box>
            ) : (
              <Box>
                <Button fullWidth disabled
                  sx={{ background: 'rgba(0,0,0,0.06)', color: '#a1a1aa', fontWeight: 700, py: 2, borderRadius: '16px', textTransform: 'none', fontSize: '1rem', mb: 1.5 }}>
                  Out of Stock
                </Button>
                <Button fullWidth variant="outlined" onClick={() => navigate('/products')} startIcon={<ArrowBack />}
                  sx={{ borderColor: 'rgba(0,0,0,0.12)', color: '#52525b', fontWeight: 600, py: 1.5, borderRadius: '16px', textTransform: 'none', '&:hover': { borderColor: '#1a6b2e', color: '#1a6b2e', background: '#f0fdf4' } }}>
                  Browse Other Products
                </Button>
              </Box>
            )}

            {/* Delivery info */}
            <Box sx={{ mt: 3, p: 2, borderRadius: '14px', background: 'white', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LocalShipping sx={{ color: '#1a6b2e', fontSize: '1.3rem' }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#18181b' }}>Free Sunday Delivery</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#71717a', lineHeight: 1.4 }}>
                  Orders placed before Wednesday 6 PM are delivered fresh every Sunday
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: { xs: 6, md: 8 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography sx={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: '#18181b', letterSpacing: '-0.02em' }}>
                You May Also Like
              </Typography>
              <Button component={Link} to="/products" endIcon={<NavigateNext />}
                sx={{ color: '#1a6b2e', fontWeight: 700, textTransform: 'none', fontSize: '0.875rem', '&:hover': { background: 'rgba(26,107,46,0.06)' } }}>
                View All
              </Button>
            </Box>
            <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
              {relatedProducts.map((rp, i) => {
                const rqty = items.find(it => it.product._id === rp._id)?.quantity || 0;
                const roos = rp.quantity === 0;
                return (
                  <Grid item xs={6} sm={6} md={3} key={rp._id}>
                    <Box
                      sx={{
                        borderRadius: '20px', overflow: 'hidden', background: 'white',
                        border: rqty > 0 ? '1.5px solid rgba(26,107,46,0.25)' : '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        display: 'flex', flexDirection: 'column', height: '100%',
                        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                        animation: `fadeInUp 0.5s ease ${i * 80}ms both`,
                        '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                        '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 40px rgba(26,107,46,0.15)', '& .rel-img': { transform: 'scale(1.06)' } }
                      }}
                    >
                      {/* Image — clickable */}
                      <Box
                        onClick={() => navigate(`/products/${rp._id}`)}
                        sx={{ height: { xs: 130, md: 160 }, overflow: 'hidden', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
                      >
                        {rp.image_url ? (
                          <img className="rel-img" src={`${API_URL}${rp.image_url}`} alt={rp.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🌿</Box>
                        )}
                        {rqty > 0 && (
                          <Box sx={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: '#1a6b2e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', border: '2px solid white' }}>
                            {rqty}
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ p: { xs: 1.25, md: 2 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          onClick={() => navigate(`/products/${rp._id}`)}
                          sx={{ fontWeight: 700, fontSize: { xs: '0.78rem', md: '0.9rem' }, color: '#18181b', mb: 0.5, lineHeight: 1.3, cursor: 'pointer', '&:hover': { color: '#1a6b2e' } }}
                        >
                          {rp.name}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.95rem', md: '1.1rem' }, color: '#1a6b2e', mb: 1 }}>₹{rp.price}</Typography>
                        {!roos ? (
                          rqty > 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(26,107,46,0.06)', border: '1px solid rgba(26,107,46,0.15)', borderRadius: '10px', p: 0.5 }}>
                              <IconButton size="small" onClick={() => updateQuantity(rp._id, rqty - 1)} sx={{ width: 28, height: 28, background: 'white', borderRadius: '8px', color: '#1a6b2e' }}><Remove sx={{ fontSize: '0.8rem' }} /></IconButton>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#1a6b2e' }}>{rqty}</Typography>
                              <IconButton size="small" onClick={() => updateQuantity(rp._id, rqty + 1)} sx={{ width: 28, height: 28, background: '#1a6b2e', borderRadius: '8px', color: 'white' }}><Add sx={{ fontSize: '0.8rem' }} /></IconButton>
                            </Box>
                          ) : (
                            <Button fullWidth variant="contained" size="small" onClick={() => addItem(rp)}
                              sx={{ background: 'linear-gradient(135deg,#1a6b2e,#2d9e4a)', color: 'white', fontWeight: 700, borderRadius: '10px', textTransform: 'none', fontSize: { xs: '0.7rem', md: '0.8rem' }, py: 0.75, '&:hover': { background: 'linear-gradient(135deg,#0d4a1e,#1a6b2e)' } }}>
                              + Add
                            </Button>
                          )
                        ) : (
                          <Button fullWidth disabled size="small" sx={{ background: 'rgba(0,0,0,0.04)', color: '#bdbdbd', fontWeight: 600, borderRadius: '10px', textTransform: 'none', fontSize: { xs: '0.7rem', md: '0.8rem' }, py: 0.75 }}>Sold Out</Button>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetail;
