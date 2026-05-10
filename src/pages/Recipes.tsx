import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Skeleton, Alert, TextField, InputAdornment, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Search, Clear, Timer, EmojiNature, PictureAsPdf, Download, Visibility, Close } from '@mui/icons-material';
import { recipesAPI } from '../services/api';
import { cachedApiCall } from '../services/cache';
import { Recipe } from '../types';

declare const process: { env: { REACT_APP_API_URL?: string } };
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filtered, setFiltered] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    cachedApiCall('recipes', () => recipesAPI.getAll(), 5 * 60 * 1000)
      .then(data => { setRecipes(data); setFiltered(data); setLoading(false); })
      .catch(() => { setError('Failed to load recipes'); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(recipes); return; }
    const s = search.toLowerCase();
    setFiltered(recipes.filter(r => r.name.toLowerCase().includes(s) || (r.description || '').toLowerCase().includes(s)));
  }, [search, recipes]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const downloadPdf = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = `${API_URL}${url}`;
    a.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.pdf`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return (
    <Box sx={{ background: '#f9fdf9', minHeight: '100vh' }}>
      <Box sx={{ background: 'linear-gradient(135deg,#0d4a1e,#2d9e4a)', height: 280 }} />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={2.5}>
          {[1,2,3,4,5,6].map(i => <Grid item xs={12} sm={6} md={4} key={i}><Skeleton variant="rectangular" height={360} sx={{ borderRadius: '20px' }} /></Grid>)}
        </Grid>
      </Container>
    </Box>
  );

  if (error) return <Container sx={{ py: 4 }}><Alert severity="error" sx={{ borderRadius: '14px' }}>{error}</Alert></Container>;

  return (
    <Box sx={{ background: '#f9fdf9', minHeight: '100vh' }}>
      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg,#0d4a1e 0%,#1a6b2e 50%,#2d9e4a 100%)', pt: { xs: 6, md: 10 }, pb: { xs: 10, md: 14 }, position: 'relative', overflow: 'hidden', '&::after': { content: '""', position: 'absolute', bottom: -2, left: 0, right: 0, height: { xs: 50, md: 70 }, background: '#f9fdf9', clipPath: 'ellipse(55% 100% at 50% 100%)' } }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2.5, py: 0.75, borderRadius: '100px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', mb: 3 }}>
            <EmojiNature sx={{ fontSize: '0.85rem', color: '#a8e6b8' }} />
            <Typography sx={{ color: 'rgba(168,230,184,0.95)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Wellness Kitchen</Typography>
          </Box>
          <Typography component="h1" sx={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 800, fontSize: { xs: '2.4rem', md: '3.5rem' }, color: 'white', mb: 2, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Healthy Recipes
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '1rem', md: '1.15rem' }, maxWidth: 520, mx: 'auto', lineHeight: 1.7, mb: 4 }}>
            Nourishing recipes crafted with our organic ingredients for a healthier, happier you
          </Typography>
          <Box sx={{ maxWidth: 480, mx: 'auto' }}>
            <TextField
              fullWidth placeholder="Search recipes..."
              value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }} /></InputAdornment>,
                endAdornment: search ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearch('')} sx={{ color: 'rgba(255,255,255,0.6)' }}><Clear sx={{ fontSize: '1rem' }} /></IconButton></InputAdornment> : null,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', '& fieldset': { border: 'none' }, '&:hover': { background: 'rgba(255,255,255,0.18)' }, '&.Mui-focused': { background: 'rgba(255,255,255,0.2)' } }, '& input::placeholder': { color: 'rgba(255,255,255,0.6)' }, '& input': { color: 'white' } }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: { xs: 8, md: 12 } }}>
            <Box sx={{ fontSize: '4rem', mb: 2 }}>🥗</Box>
            <Typography sx={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' }, color: '#374151', mb: 1.5 }}>
              {search ? 'No recipes found' : 'No Recipes Yet'}
            </Typography>
            <Typography sx={{ color: '#71717a', fontSize: '1rem', maxWidth: 400, mx: 'auto', lineHeight: 1.7 }}>
              {search ? `No recipes match "${search}". Try a different search.` : "We're working on adding delicious and healthy recipes. Check back soon!"}
            </Typography>
            {search && <Button onClick={() => setSearch('')} sx={{ mt: 3, borderColor: '#1a6b2e', color: '#1a6b2e', borderRadius: '12px', textTransform: 'none', fontWeight: 600 }} variant="outlined">Clear Search</Button>}
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, md: 4 }, flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontWeight: 600, color: '#71717a', fontSize: '0.9rem' }}>
                {filtered.length} recipe{filtered.length !== 1 ? 's' : ''} {search ? `for "${search}"` : 'available'}
              </Typography>
            </Box>
            <Grid container spacing={{ xs: 1.5, md: 3.5 }}>
              {filtered.map((recipe, index) => (
                <Grid item xs={6} sm={6} md={4} key={recipe._id}>
                  <Box sx={{ borderRadius: { xs: '16px', md: '20px' }, overflow: 'hidden', background: 'white', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeInUp 0.5s ease both', animationDelay: `${index * 80}ms`, '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } }, '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 48px rgba(26,107,46,0.15)', border: '1px solid rgba(26,107,46,0.12)', '& .recipe-img': { transform: 'scale(1.07)' } } }}>
                    {/* Image */}
                    <Box sx={{ height: { xs: 130, sm: 180, md: 220 }, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', flexShrink: 0 }}>
                      {recipe.image_url ? (
                        <img className="recipe-img" src={`${API_URL}${recipe.image_url}`} alt={recipe.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onError={e => { (e.target as HTMLImageElement).parentElement!.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem">🥗</div>'; }} />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🥗</Box>
                      )}
                      {recipe.pdf_url && (
                        <Box sx={{ position: 'absolute', top: 12, right: 12, px: 1.5, py: 0.5, borderRadius: '8px', background: 'rgba(220,38,38,0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PictureAsPdf sx={{ fontSize: '0.8rem', color: 'white' }} />
                          <Typography sx={{ color: 'white', fontSize: '0.65rem', fontWeight: 700 }}>PDF</Typography>
                        </Box>
                      )}
                    </Box>
                    {/* Content */}
                    <Box sx={{ p: { xs: 1.25, sm: 2, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.78rem', sm: '0.95rem', md: '1.1rem' }, color: '#18181b', mb: 0.5, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{recipe.name}</Typography>
                      <Typography sx={{ fontSize: { xs: '0.7rem', sm: '0.825rem', md: '0.875rem' }, color: '#71717a', lineHeight: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1 }}>{recipe.description}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: { xs: 1, md: 2 } }}>
                        <Timer sx={{ fontSize: '0.75rem', color: '#9e9e9e' }} />
                        <Typography sx={{ fontSize: '0.68rem', color: '#9e9e9e', fontWeight: 500 }}>{formatDate(recipe.created_at)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" size="small" onClick={() => setSelectedRecipe(recipe)}
                          sx={{ flex: 1, background: 'linear-gradient(135deg,#1a6b2e,#2d9e4a)', color: 'white', fontWeight: 700, borderRadius: '8px', textTransform: 'none', fontSize: { xs: '0.68rem', sm: '0.8rem' }, py: { xs: 0.75, sm: 1 }, minWidth: 0, '&:hover': { background: 'linear-gradient(135deg,#2d9e4a,#1a6b2e)' } }}>
                          View
                        </Button>
                        {recipe.pdf_url && (
                          <IconButton size="small" onClick={() => downloadPdf(recipe.pdf_url!, recipe.name)}
                            sx={{ width: { xs: 28, sm: 34 }, height: { xs: 28, sm: 34 }, borderRadius: '8px', background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)', flexShrink: 0 }}>
                            <Download sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onClose={() => setSelectedRecipe(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>
        {selectedRecipe && (
          <>
            <DialogTitle sx={{ p: 0, position: 'relative' }}>
              {selectedRecipe.image_url ? (
                <Box sx={{ height: { xs: 200, md: 260 }, overflow: 'hidden', position: 'relative' }}>
                  <img src={`${API_URL}${selectedRecipe.image_url}`} alt={selectedRecipe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 60%)' }} />
                  <Box sx={{ position: 'absolute', bottom: 16, left: 20, right: 56 }}>
                    <Typography sx={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 700, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: 'white', lineHeight: 1.2 }}>{selectedRecipe.name}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', mt: 0.5 }}>{formatDate(selectedRecipe.created_at)}</Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ p: 3, pb: 1 }}>
                  <Typography sx={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 700, fontSize: '1.5rem', color: '#18181b' }}>{selectedRecipe.name}</Typography>
                  <Typography sx={{ color: '#71717a', fontSize: '0.8rem', mt: 0.5 }}>{formatDate(selectedRecipe.created_at)}</Typography>
                </Box>
              )}
              <IconButton onClick={() => setSelectedRecipe(null)} sx={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.3)', color: 'white', backdropFilter: 'blur(8px)', width: 36, height: 36, '&:hover': { background: 'rgba(0,0,0,0.5)' } }}>
                <Close sx={{ fontSize: '1rem' }} />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography sx={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap', mb: selectedRecipe.pdf_url ? 3 : 0 }}>{selectedRecipe.description}</Typography>
              {selectedRecipe.pdf_url && (
                <Box sx={{ p: 2.5, borderRadius: '14px', background: 'linear-gradient(135deg,#f0faf2,#e8f5e9)', border: '1px solid rgba(26,107,46,0.12)' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a6b2e', mb: 1.5 }}>📄 Detailed PDF Guide Available</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button variant="outlined" startIcon={<Visibility />} onClick={() => setPdfUrl(`${API_URL}${selectedRecipe.pdf_url}`)} sx={{ borderColor: '#1a6b2e', color: '#1a6b2e', fontWeight: 600, borderRadius: '10px', textTransform: 'none', '&:hover': { background: 'rgba(26,107,46,0.06)' } }}>Preview PDF</Button>
                    <Button variant="contained" startIcon={<Download />} onClick={() => downloadPdf(selectedRecipe.pdf_url!, selectedRecipe.name)} sx={{ background: 'linear-gradient(135deg,#1a6b2e,#2d9e4a)', color: 'white', fontWeight: 700, borderRadius: '10px', textTransform: 'none', '&:hover': { background: 'linear-gradient(135deg,#2d9e4a,#1a6b2e)' } }}>Download PDF</Button>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: { xs: 2, md: 2.5 }, pt: 0 }}>
              <Button onClick={() => setSelectedRecipe(null)} variant="outlined" sx={{ borderColor: '#e0e0e0', color: '#374151', fontWeight: 600, borderRadius: '10px', textTransform: 'none' }}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog open={!!pdfUrl} onClose={() => setPdfUrl('')} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '20px', height: '90vh' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, px: 3, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#18181b' }}>Recipe PDF Preview</Typography>
          <IconButton onClick={() => setPdfUrl('')} sx={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(0,0,0,0.05)', '&:hover': { background: 'rgba(0,0,0,0.1)' } }}>
            <Close sx={{ fontSize: '1rem' }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {pdfUrl && <iframe src={pdfUrl} width="100%" height="100%" style={{ border: 'none' }} title="Recipe PDF Preview" />}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Recipes;
