import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider
} from '@mui/material';
import {
  MenuBook as RecipeIcon,
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
  CalendarToday as DateIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { Recipe } from '../types';

// Placeholder API function - will be replaced with actual API call
const fetchRecipes = async (): Promise<Recipe[]> => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/recipes`);
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
};

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string>('');

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        const recipesData = await fetchRecipes();
        setRecipes(recipesData);
      } catch (err) {
        setError('Failed to load recipes. Please try again later.');
        console.error('Error loading recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRecipe(null);
  };

  const handlePreviewPdf = (pdfUrl: string) => {
    setPreviewPdfUrl(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${pdfUrl}`);
    setPdfPreviewOpen(true);
  };

  const handleDownloadPdf = (pdfUrl: string, recipeName: string) => {
    const fullUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${pdfUrl}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = `${recipeName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClosePdfPreview = () => {
    setPdfPreviewOpen(false);
    setPreviewPdfUrl('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} sx={{ color: '#4caf50' }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            color: '#2e7d32', 
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 2
          }}
        >
          <RecipeIcon sx={{ fontSize: 48, mr: 2, verticalAlign: 'middle' }} />
          Healthy Recipes
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            textAlign: 'center',
            color: '#666',
            mb: 4
          }}
        >
          Discover delicious and nutritious recipes for a healthier lifestyle
        </Typography>
      </Box>

      {recipes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <RecipeIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#999', mb: 2 }}>
            No Recipes Available
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            We're working on adding delicious and healthy recipes. Check back soon!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {recipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
              >
                {recipe.image_url ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${recipe.image_url}`}
                    alt={recipe.name}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#f5f5f5'
                    }}
                  >
                    <RecipeIcon sx={{ fontSize: 60, color: '#ccc' }} />
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    {recipe.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {recipe.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DateIcon sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(recipe.created_at)}
                    </Typography>
                  </Box>

                  {recipe.pdf_url && (
                    <Chip
                      icon={<PdfIcon />}
                      label="PDF Available"
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ 
                      backgroundColor: '#4caf50',
                      '&:hover': { backgroundColor: '#45a049' },
                      flexGrow: 1
                    }}
                    onClick={() => handleViewRecipe(recipe)}
                  >
                    View Recipe
                  </Button>
                  {recipe.pdf_url && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handlePreviewPdf(recipe.pdf_url!)}
                        sx={{ 
                          borderColor: '#4caf50',
                          color: '#4caf50',
                          '&:hover': { 
                            borderColor: '#45a049',
                            backgroundColor: 'rgba(76, 175, 80, 0.04)'
                          }
                        }}
                      >
                        View
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadPdf(recipe.pdf_url!, recipe.name)}
                        sx={{ 
                          color: '#4caf50',
                          '&:hover': { 
                            backgroundColor: 'rgba(76, 175, 80, 0.04)'
                          }
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Recipe Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        {selectedRecipe && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pb: 1
            }}>
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {selectedRecipe.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Added on {formatDate(selectedRecipe.created_at)}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
              {selectedRecipe.image_url && (
                <Box sx={{ mb: 3 }}>
                  <img
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${selectedRecipe.image_url}`}
                    alt={selectedRecipe.name}
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              )}
              
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedRecipe.description}
              </Typography>
              
              {selectedRecipe.pdf_url && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    📄 This recipe includes a detailed PDF guide with step-by-step instructions.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handlePreviewPdf(selectedRecipe.pdf_url!)}
                      sx={{ 
                        borderColor: '#4caf50',
                        color: '#4caf50',
                        '&:hover': { 
                          borderColor: '#45a049',
                          backgroundColor: 'rgba(76, 175, 80, 0.04)'
                        }
                      }}
                    >
                      Preview PDF
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadPdf(selectedRecipe.pdf_url!, selectedRecipe.name)}
                      sx={{ 
                        backgroundColor: '#4caf50',
                        '&:hover': { backgroundColor: '#45a049' }
                      }}
                    >
                      Download PDF
                    </Button>
                  </Box>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={handleCloseDialog}
                variant="outlined"
                sx={{ 
                  borderColor: '#4caf50',
                  color: '#4caf50',
                  '&:hover': { 
                    borderColor: '#45a049',
                    backgroundColor: 'rgba(76, 175, 80, 0.04)'
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog
        open={pdfPreviewOpen}
        onClose={handleClosePdfPreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Recipe PDF Preview
          </Typography>
          <IconButton onClick={handleClosePdfPreview}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 0, height: '100%' }}>
          {previewPdfUrl && (
            <iframe
              src={previewPdfUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Recipe PDF Preview"
            />
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClosePdfPreview}
            variant="outlined"
            sx={{ 
              borderColor: '#4caf50',
              color: '#4caf50',
              '&:hover': { 
                borderColor: '#45a049',
                backgroundColor: 'rgba(76, 175, 80, 0.04)'
              }
            }}
          >
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Recipes;
