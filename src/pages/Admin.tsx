import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Input,
  useTheme,
  useMediaQuery,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack
} from '@mui/material';
import {
  Logout,
  Add,
  Edit,
  Delete,
  PhotoCamera,
  Visibility,
  Save
} from '@mui/icons-material';
import { useNavigate, Routes, Route } from 'react-router-dom';
import {
  authAPI,
  categoriesAPI,
  productsAPI,
  ordersAPI,
  contentAPI,
  contactAPI
} from '../services/api';
import {
  Category,
  Product,
  Order,
  Content,
  CategoryCreate,
  ProductCreate,
  OrderAnalytics
} from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Admin: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [currentTab, setCurrentTab] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<OrderAnalytics[]>([]);
  const [homeContent, setHomeContent] = useState<Content | null>(null);
  const [aboutContent, setAboutContent] = useState<Content | null>(null);
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState<CategoryCreate>({
    name: '',
    description: ''
  });
  const [productForm, setProductForm] = useState<ProductCreate>({
    name: '',
    description: '',
    category_id: '',
    price: 0,
    quantity: 0
  });
  const [contentForm, setContentForm] = useState({
    title: '',
    content: ''
  });
  const [contactForm, setContactForm] = useState({
    company_name: '',
    company_description: '',
    email: '',
    phone: '',
    address: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!authAPI.isAuthenticated()) {
        navigate('/adddmin/login');
        return;
      }
      await fetchData();
    };
    checkAuth();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesData, productsData, ordersData, analyticsData, homeData, aboutData] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll(),
        ordersAPI.getAll(),
        ordersAPI.getAnalytics(),
        contentAPI.get('home'),
        contentAPI.get('about')
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
      setOrders(ordersData);
      setAnalytics(analyticsData);
      setHomeContent(homeData);
      setAboutContent(aboutData);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };

  // Category management
  const handleCategorySubmit = async () => {
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, categoryForm);
      } else {
        await categoriesAPI.create(categoryForm);
      }
      setCategoryDialogOpen(false);
      setCategoryForm({ name: '', description: '' });
      setEditingCategory(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoriesAPI.delete(id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCategoryImageUpload = async (categoryId: string, file: File) => {
    try {
      await categoriesAPI.uploadImage(categoryId, file);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Product management
  const handleProductSubmit = async () => {
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct._id, productForm);
      } else {
        await productsAPI.create(productForm);
      }
      setProductDialogOpen(false);
      setProductForm({ name: '', description: '', category_id: '', price: 0, quantity: 0 });
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleProductImageUpload = async (productId: string, file: File) => {
    try {
      await productsAPI.uploadImage(productId, file);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Order management
  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await ordersAPI.delete(id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Content management
  const handleContentSubmit = async () => {
    if (!editingContent) return;
    try {
      await contentAPI.update(editingContent.page, contentForm);
      setContentDialogOpen(false);
      setEditingContent(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoUpload = async (page: string, file: File) => {
    try {
      await contentAPI.uploadLogo(page, file);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Contact management
  const handleContactSubmit = async () => {
    try {
      const updatedContact = await contactAPI.update(contactForm);
      setContactInfo(updatedContact);
      setContactDialogOpen(false);
      // Also refresh the contact info display
      const contact = await contactAPI.get();
      setContactInfo(contact);
    } catch (err) {
      console.error('Failed to update contact info:', err);
    }
  };

  const editCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, description: category.description });
    setCategoryDialogOpen(true);
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      price: product.price,
      quantity: product.quantity
    });
    setProductDialogOpen(true);
  };

  const editContent = (content: Content) => {
    setEditingContent(content);
    setContentForm({ title: content.title, content: content.content });
    setContentDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Admin Header */}
      <AppBar position="static" sx={{ backgroundColor: '#2e7d32' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Akshayam Wellness - Admin Panel
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: isMobile ? 1 : 3, px: isMobile ? 1 : 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={currentTab} 
            onChange={(_, value) => setCurrentTab(value)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minWidth: isMobile ? 80 : 160,
                fontSize: isMobile ? '0.8rem' : '0.875rem'
              }
            }}
          >
            <Tab label={isMobile ? "Categories" : "Categories"} />
            <Tab label={isMobile ? "Products" : "Products"} />
            <Tab label={isMobile ? "Orders" : "Orders"} />
            <Tab label={isMobile ? "Analytics" : "Analytics"} />
            <Tab label={isMobile ? "Content" : "Content & Contact"} />
          </Tabs>
        </Box>

        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto' }} />}

        {/* Categories Tab */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'stretch' : 'center',
            mb: 2,
            gap: isMobile ? 2 : 0 
          }}>
            <Typography variant={isMobile ? "h6" : "h5"}>Categories Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCategoryDialogOpen(true)}
              fullWidth={isMobile}
              size={isMobile ? "large" : "medium"}
            >
              Add Category
            </Button>
          </Box>

          {isMobile ? (
            // Mobile Card Layout
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {categories.map((category) => (
                <Card key={category._id} elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>{category.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {category.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {formatDate(category.created_at)}
                        </Typography>
                      </Box>
                      {category.image_url && (
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${category.image_url}`}
                          alt={category.name}
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginLeft: 16 }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`category-image-${category._id}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCategoryImageUpload(category._id, file);
                          }}
                        />
                        <label htmlFor={`category-image-${category._id}`}>
                          <Button component="span" size="small" startIcon={<PhotoCamera />}>
                            {category.image_url ? 'Change Image' : 'Add Image'}
                          </Button>
                        </label>
                      </Box>
                      <Box>
                        <IconButton onClick={() => editCategory(category)} color="primary">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleCategoryDelete(category._id)} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            // Desktop Table Layout
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>
                        {category.image_url ? (
                          <img
                              src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${category.image_url}`}
                            alt={category.name}
                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                          />
                        ) : (
                          'No image'
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`category-image-${category._id}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCategoryImageUpload(category._id, file);
                          }}
                        />
                        <label htmlFor={`category-image-${category._id}`}>
                          <IconButton component="span" size="small">
                            <PhotoCamera />
                          </IconButton>
                        </label>
                      </TableCell>
                      <TableCell>{formatDate(category.created_at)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => editCategory(category)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleCategoryDelete(category._id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Products Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'stretch' : 'center',
            mb: 2,
            gap: isMobile ? 2 : 0 
          }}>
            <Typography variant={isMobile ? "h6" : "h5"}>Products Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setProductDialogOpen(true)}
              fullWidth={isMobile}
              size={isMobile ? "large" : "medium"}
            >
              Add Product
            </Button>
          </Box>

          {isMobile ? (
            // Mobile Card Layout
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {products.map((product) => {
                const category = categories.find(c => c._id === product.category_id);
                return (
                  <Card key={product._id} elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>{product.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Category: {category?.name || 'Unknown'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Price:</strong> ₹{product.price}
                          </Typography>
                          <Chip
                            label={`Stock: ${product.quantity}`}
                            color={product.quantity > 0 ? 'success' : 'error'}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {product.description.length > 100 
                              ? `${product.description.substring(0, 100)}...` 
                              : product.description}
                          </Typography>
                        </Box>
                        {product.image_url && (
                          <img
                            src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${product.image_url}`}
                            alt={product.name}
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginLeft: 16 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            id={`product-image-${product._id}`}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleProductImageUpload(product._id, file);
                            }}
                          />
                          <label htmlFor={`product-image-${product._id}`}>
                            <Button component="span" size="small" startIcon={<PhotoCamera />}>
                              {product.image_url ? 'Change Image' : 'Add Image'}
                            </Button>
                          </label>
                        </Box>
                        <Box>
                          <IconButton onClick={() => editProduct(product)} color="primary">
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleProductDelete(product._id)} color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          ) : (
            // Desktop Table Layout
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => {
                    const category = categories.find(c => c._id === product.category_id);
                    return (
                      <TableRow key={product._id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{category?.name || 'Unknown'}</TableCell>
                        <TableCell>₹{product.price}</TableCell>
                        <TableCell>
                          <Chip
                            label={product.quantity}
                            color={product.quantity > 0 ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {product.image_url ? (
                            <img
                              src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${product.image_url}`}
                              alt={product.name}
                              style={{ width: 50, height: 50, objectFit: 'cover' }}
                            />
                          ) : (
                            'No image'
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            id={`product-image-${product._id}`}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleProductImageUpload(product._id, file);
                            }}
                          />
                          <label htmlFor={`product-image-${product._id}`}>
                            <IconButton component="span" size="small">
                              <PhotoCamera />
                            </IconButton>
                          </label>
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => editProduct(product)}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleProductDelete(product._id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Orders Tab */}
        <TabPanel value={currentTab} index={2}>
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 2 }}>Orders Management</Typography>
          
          {isMobile ? (
            // Mobile Card Layout
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {orders.map((order) => (
                <Card key={order._id} elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          Order #{order._id.slice(-8).toUpperCase()}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Customer:</strong> {order.user_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {order.user_email}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Items:</strong> {order.items.length} items
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Total:</strong> ₹{order.total_amount.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(order.created_at)}
                        </Typography>
                      </Box>
                      <Chip
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={order.status}
                          onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                          label="Status"
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="confirmed">Confirmed</MenuItem>
                          <MenuItem value="shipped">Shipped</MenuItem>
                          <MenuItem value="delivered">Delivered</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                      <Box>
                        <IconButton 
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderDetailsOpen(true);
                          }}
                          color="primary"
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleOrderDelete(order._id)} 
                          color="error"
                          title="Delete Order"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            // Desktop Table Layout
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>#{order._id.slice(-8).toUpperCase()}</TableCell>
                      <TableCell>
                        <div>{order.user_name}</div>
                        <div style={{ fontSize: '0.8em', color: 'gray' }}>{order.user_email}</div>
                      </TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>₹{order.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={order.status}
                            onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="confirmed">Confirmed</MenuItem>
                            <MenuItem value="shipped">Shipped</MenuItem>
                            <MenuItem value="delivered">Delivered</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderDetailsOpen(true);
                          }}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton onClick={() => handleOrderDelete(order._id)} title="Delete Order">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={currentTab} index={3}>
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 2 }}>Analytics</Typography>
          
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>Total Orders</Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} color="primary">{orders.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>Total Revenue</Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} color="primary">
                    ₹{orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Product Sales Analytics</Typography>
          {isMobile ? (
            // Mobile Card Layout
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {analytics.map((item) => (
                <Card key={item.product_id} elevation={1}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{item.product_name}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Quantity Sold</Typography>
                        <Typography variant="h6">{item.total_quantity}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">Revenue</Typography>
                        <Typography variant="h6" color="primary">₹{item.total_revenue.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            // Desktop Table Layout
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Total Quantity Sold</TableCell>
                    <TableCell>Total Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.total_quantity}</TableCell>
                      <TableCell>₹{item.total_revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Content & Contact Management Tab */}
        <TabPanel value={currentTab} index={4}>
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 3 }}>Content & Contact Management</Typography>
          
          {/* Contact Information Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'stretch' : 'center',
                mb: 3,
                gap: isMobile ? 2 : 0 
              }}>
                <Typography variant="h6">Contact Information</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Edit />}
                  fullWidth={isMobile}
                  size={isMobile ? "large" : "medium"}
                  onClick={async () => {
                    try {
                      const contact = await contactAPI.get();
                      setContactInfo(contact);
                      setContactForm({
                        company_name: contact.company_name || '',
                        company_description: contact.company_description || '',
                        email: contact.email || '',
                        phone: contact.phone || '',
                        address: contact.address || ''
                      });
                      setContactDialogOpen(true);
                    } catch (err) {
                      console.error('Failed to load contact info:', err);
                    }
                  }}
                >
                  Edit Contact Info
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Company:</strong> {contactInfo?.company_name || 'Akshayam Wellness'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Email:</strong> {contactInfo?.email || 'info@akshayamwellness.com'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Phone:</strong> {contactInfo?.phone || '+91-9876543210'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Address:</strong> {contactInfo?.address || '123 Wellness Street, Organic City'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Description:</strong> {contactInfo?.company_description || 'Your trusted partner in organic wellness products.'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Page Content Management */}
          <Grid container spacing={3}>
            {/* Home Page Content */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Home Page Content</Typography>
                  <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                    Main hero section content
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Title:</strong> {homeContent?.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, maxHeight: 60, overflow: 'hidden' }}>
                    <strong>Content:</strong> {homeContent?.content?.substring(0, 100)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => homeContent && editContent(homeContent)}
                    >
                      Edit Content
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="home-logo-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload('home', file);
                      }}
                    />
                    <label htmlFor="home-logo-upload">
                      <Button variant="outlined" size="small" component="span">
                        Upload Logo
                      </Button>
                    </label>
                  </Box>
                  
                  {homeContent?.logo_url && (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${homeContent.logo_url}`}
                      alt="Home Logo"
                      style={{ maxWidth: '100%', height: 'auto', maxHeight: 100 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* About Page Content */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>About Page Content</Typography>
                  <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                    Company information and story
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Title:</strong> {aboutContent?.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, maxHeight: 60, overflow: 'hidden' }}>
                    <strong>Content:</strong> {aboutContent?.content?.substring(0, 100)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => aboutContent && editContent(aboutContent)}
                    >
                      Edit Content
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="about-logo-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload('about', file);
                      }}
                    />
                    <label htmlFor="about-logo-upload">
                      <Button variant="outlined" size="small" component="span">
                        Upload Logo
                      </Button>
                    </label>
                  </Box>
                  
                  {aboutContent?.logo_url && (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${aboutContent.logo_url}`}
                      alt="About Logo"
                      style={{ maxWidth: '100%', height: 'auto', maxHeight: 100 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Additional Content Sections */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Editable Content Sections</Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            All website content including home page features, about page sections, and footer information can now be managed through the admin panel. 
            Changes will be reflected immediately on the website.
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>Home Features</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  "Why Choose Us" section content
                </Typography>
                <Button variant="outlined" size="small" disabled>
                  Coming Soon
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>Footer Content</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Footer links and descriptions
                </Typography>
                <Button variant="outlined" size="small" disabled>
                  Coming Soon
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>Meta Information</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  SEO titles and descriptions
                </Typography>
                <Button variant="outlined" size="small" disabled>
                  Coming Soon
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Container>

      {/* Category Dialog */}
      <Dialog 
        open={categoryDialogOpen} 
        onClose={() => setCategoryDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent sx={{ pb: isMobile ? 2 : 1 }}>
          <TextField
            fullWidth
            label="Category Name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={isMobile ? 4 : 3}
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          p: isMobile ? 2 : 1
        }}>
          <Button 
            onClick={() => setCategoryDialogOpen(false)}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCategorySubmit} 
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Dialog */}
      <Dialog 
        open={productDialogOpen} 
        onClose={() => setProductDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent sx={{ pb: isMobile ? 2 : 1 }}>
          <TextField
            fullWidth
            label="Product Name"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={isMobile ? 4 : 3}
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={productForm.category_id}
              onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
            />
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={productForm.quantity}
              onChange={(e) => setProductForm({ ...productForm, quantity: parseInt(e.target.value) })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          p: isMobile ? 2 : 1
        }}>
          <Button 
            onClick={() => setProductDialogOpen(false)}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleProductSubmit} 
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Content Dialog */}
      <Dialog 
        open={contentDialogOpen} 
        onClose={() => setContentDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Edit {editingContent?.page} Page Content</DialogTitle>
        <DialogContent sx={{ pb: isMobile ? 2 : 1 }}>
          <TextField
            fullWidth
            label="Title"
            value={contentForm.title}
            onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Content"
            multiline
            rows={isMobile ? 8 : 6}
            value={contentForm.content}
            onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          p: isMobile ? 2 : 1
        }}>
          <Button 
            onClick={() => setContentDialogOpen(false)}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleContentSubmit} 
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Update Content
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog 
        open={orderDetailsOpen} 
        onClose={() => setOrderDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 1 }}>
            <Typography variant="h6" component="span">
              Order Details - #{selectedOrder?._id.slice(-8).toUpperCase()}
            </Typography>
            <Chip
              label={selectedOrder?.status ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) : 'Unknown'}
              color={getStatusColor(selectedOrder?.status || '') as any}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={isMobile ? 2 : 3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Customer Information</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {selectedOrder.user_name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {selectedOrder.user_email}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Phone:</strong> {selectedOrder.user_phone}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Address:</strong> {selectedOrder.user_address}
                </Typography>
                
                <Typography variant="h6" gutterBottom>Order Information</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Order Date:</strong> {formatDate(selectedOrder.created_at)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Last Updated:</strong> {formatDate(selectedOrder.updated_at)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Total Amount:</strong> ₹{selectedOrder.total_amount.toFixed(2)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Order Items ({selectedOrder.items.length})</Typography>
                <TableContainer component={Paper} sx={{ maxHeight: isMobile ? 400 : 300 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        {!isMobile && <TableCell align="right">Price</TableCell>}
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {item.product_name}
                            </Typography>
                            {isMobile && (
                              <Typography variant="caption" color="text.secondary">
                                ₹{item.price.toFixed(2)} each
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          {!isMobile && <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>}
                          <TableCell align="right">₹{item.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={isMobile ? 2 : 3}>
                          <Typography variant="h6">Total:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6">₹{selectedOrder.total_amount.toFixed(2)}</Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          p: isMobile ? 2 : 1,
          alignItems: isMobile ? 'stretch' : 'center'
        }}>
          {selectedOrder && (
            <FormControl 
              sx={{ 
                minWidth: 120,
                width: isMobile ? '100%' : 'auto',
                order: isMobile ? 1 : 2
              }}
            >
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedOrder.status}
                onChange={(e) => {
                  handleOrderStatusUpdate(selectedOrder._id, e.target.value);
                  setSelectedOrder({ ...selectedOrder, status: e.target.value });
                }}
                size="small"
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          )}
          <Button 
            onClick={() => setOrderDetailsOpen(false)}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ order: isMobile ? 2 : 1 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Information Dialog */}
      <Dialog 
        open={contactDialogOpen} 
        onClose={() => setContactDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Edit Contact Information</DialogTitle>
        <DialogContent sx={{ pb: isMobile ? 2 : 1 }}>
          <TextField
            fullWidth
            label="Company Name"
            value={contactForm.company_name}
            onChange={(e) => setContactForm({ ...contactForm, company_name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Company Description"
            multiline
            rows={isMobile ? 4 : 3}
            value={contactForm.company_description}
            onChange={(e) => setContactForm({ ...contactForm, company_description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={contactForm.email}
            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={contactForm.phone}
            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={isMobile ? 3 : 2}
            value={contactForm.address}
            onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          p: isMobile ? 2 : 1
        }}>
          <Button 
            onClick={() => setContactDialogOpen(false)}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleContactSubmit} 
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Update Contact Info
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin;
