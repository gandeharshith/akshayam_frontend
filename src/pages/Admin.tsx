import React, { useState, useEffect, useCallback } from 'react';
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
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Logout,
  Add,
  Edit,
  Delete,
  PhotoCamera,
  Visibility,
  DragIndicator
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import {
  CSS
} from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import {
  authAPI,
  categoriesAPI,
  productsAPI,
  recipesAPI,
  ordersAPI,
  contentAPI,
  contactAPI,
  systemSettingsAPI
} from '../services/api';
import {
  Category,
  Product,
  Order,
  Content,
  Recipe,
  CategoryCreate,
  ProductCreate,
  RecipeCreate,
  OrderAnalytics,
  OrderEditRequest
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

// Sortable Item Component for Categories
interface SortableCategoryProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
  isMobile: boolean;
}

const SortableCategory: React.FC<SortableCategoryProps> = ({ 
  category, onEdit, onDelete, onImageUpload, isMobile 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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

  if (isMobile) {
    return (
      <Card ref={setNodeRef} style={style} elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <IconButton {...attributes} {...listeners} sx={{ cursor: 'grab', mr: 1, p: 0.5 }}>
              <DragIndicator />
            </IconButton>
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
                  if (file) onImageUpload(category._id, file);
                }}
              />
              <label htmlFor={`category-image-${category._id}`}>
                <Button component="span" size="small" startIcon={<PhotoCamera />}>
                  {category.image_url ? 'Change Image' : 'Add Image'}
                </Button>
              </label>
            </Box>
            <Box>
              <IconButton onClick={() => onEdit(category)} color="primary">
                <Edit />
              </IconButton>
              <IconButton onClick={() => onDelete(category._id)} color="error">
                <Delete />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton {...attributes} {...listeners} sx={{ cursor: 'grab', mr: 1, p: 0.5 }}>
            <DragIndicator />
          </IconButton>
          {category.name}
        </Box>
      </TableCell>
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
            if (file) onImageUpload(category._id, file);
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
        <IconButton onClick={() => onEdit(category)}>
          <Edit />
        </IconButton>
        <IconButton onClick={() => onDelete(category._id)}>
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

// Sortable Item Component for Products
interface SortableProductProps {
  product: Product;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
  isMobile: boolean;
}

const SortableProduct: React.FC<SortableProductProps> = ({ 
  product, categories, onEdit, onDelete, onImageUpload, isMobile 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const category = categories.find(c => c._id === product.category_id);

  if (isMobile) {
    return (
      <Card ref={setNodeRef} style={style} elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <IconButton {...attributes} {...listeners} sx={{ cursor: 'grab', mr: 1, p: 0.5 }}>
              <DragIndicator />
            </IconButton>
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
                  if (file) onImageUpload(product._id, file);
                }}
              />
              <label htmlFor={`product-image-${product._id}`}>
                <Button component="span" size="small" startIcon={<PhotoCamera />}>
                  {product.image_url ? 'Change Image' : 'Add Image'}
                </Button>
              </label>
            </Box>
            <Box>
              <IconButton onClick={() => onEdit(product)} color="primary">
                <Edit />
              </IconButton>
              <IconButton onClick={() => onDelete(product._id)} color="error">
                <Delete />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton {...attributes} {...listeners} sx={{ cursor: 'grab', mr: 1, p: 0.5 }}>
            <DragIndicator />
          </IconButton>
          {product.name}
        </Box>
      </TableCell>
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
            if (file) onImageUpload(product._id, file);
          }}
        />
        <label htmlFor={`product-image-${product._id}`}>
          <IconButton component="span" size="small">
            <PhotoCamera />
          </IconButton>
        </label>
      </TableCell>
      <TableCell>
        <IconButton onClick={() => onEdit(product)}>
          <Edit />
        </IconButton>
        <IconButton onClick={() => onDelete(product._id)}>
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const Admin: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [currentTab, setCurrentTab] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<OrderAnalytics[]>([]);
  const [homeContent, setHomeContent] = useState<Content | null>(null);
  const [aboutContent, setAboutContent] = useState<Content | null>(null);
  const [deliveryContent, setDeliveryContent] = useState<Content | null>(null);
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [orderEditDialogOpen, setOrderEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  
  // Enhanced Analytics states
  const [analyticsStartDate, setAnalyticsStartDate] = useState<string>('');
  const [analyticsEndDate, setAnalyticsEndDate] = useState<string>('');
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState<'product' | 'week' | 'month'>('product');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [orderSummary, setOrderSummary] = useState<any>({
    total_orders: 0,
    total_revenue: 0,
    avg_order_value: 0,
    total_items_sold: 0,
    min_order_value: 0,
    max_order_value: 0,
    status_counts: {}
  });
  
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
  const [recipeForm, setRecipeForm] = useState<RecipeCreate>({
    name: '',
    description: ''
  });
  const [contactForm, setContactForm] = useState({
    company_name: '',
    company_description: '',
    email: '',
    phone: '',
    address: ''
  });

  // System Settings states
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [minOrderValue, setMinOrderValue] = useState<number>(500);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    min_order_value: 500
  });

  // Order editing states
  const [editOrderItems, setEditOrderItems] = useState<any[]>([]);
  const [editOrderUserInfo, setEditOrderUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [orderEditError, setOrderEditError] = useState('');
  const [savingOrder, setSavingOrder] = useState(false);

  const navigate = useNavigate();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag end handlers
  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = categories.findIndex((item) => item._id === active.id);
    const newIndex = categories.findIndex((item) => item._id === over.id);
    
    if (oldIndex !== newIndex) {
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      
      // Optimistically update the UI
      setCategories(newCategories);
      
      // Update order in backend
      try {
        const reorderData = newCategories.map((category, index) => ({
          id: category._id,
          order: index
        }));
        
        console.log('Reordering categories:', reorderData);
        await categoriesAPI.reorder(reorderData);
        console.log('Categories reordered successfully');
        
        // Don't fetch data again, keep the current optimistic update
      } catch (error: any) {
        console.error('Failed to reorder categories:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Only revert on error by restoring original order
        const originalCategories = arrayMove(newCategories, newIndex, oldIndex);
        setCategories(originalCategories);
        
        // Show user-friendly error message with details
        const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
        setError(`Failed to reorder categories: ${errorMessage}`);
        setTimeout(() => setError(''), 5000);
      }
    }
  };

  const handleProductDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = products.findIndex((item) => item._id === active.id);
    const newIndex = products.findIndex((item) => item._id === over.id);
    
    if (oldIndex !== newIndex) {
      const newProducts = arrayMove(products, oldIndex, newIndex);
      
      // Optimistically update the UI
      setProducts(newProducts);
      
      // Update order in backend
      try {
        const reorderData = newProducts.map((product, index) => ({
          id: product._id,
          order: index
        }));
        
        console.log('Reordering products:', reorderData);
        await productsAPI.reorder(reorderData);
        console.log('Products reordered successfully');
        
        // Don't fetch data again, keep the current optimistic update
      } catch (error: any) {
        console.error('Failed to reorder products:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Only revert on error by restoring original order
        const originalProducts = arrayMove(newProducts, newIndex, oldIndex);
        setProducts(originalProducts);
        
        // Show user-friendly error message with details
        const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
        setError(`Failed to reorder products: ${errorMessage}`);
        setTimeout(() => setError(''), 5000);
      }
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesData, productsData, recipesData, ordersData, analyticsData, homeData, aboutData, deliveryData] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll(),
        recipesAPI.getAll(),
        ordersAPI.getAll(),
        ordersAPI.getAnalytics(),
        contentAPI.get('home'),
        contentAPI.get('about'),
        contentAPI.getSection('delivery', 'schedule').catch(() => null)
      ]);
      
      console.log('Fetched about data:', aboutData);
      
      setCategories(categoriesData);
      setProducts(productsData);
      setRecipes(recipesData);
      setOrders(ordersData);
      setAnalytics(analyticsData);
      setHomeContent(homeData);
      setAboutContent(aboutData);
      setDeliveryContent(deliveryData);
      
      console.log('About content state should be updated to:', aboutData);
      
      // Load system settings
      await fetchSystemSettings();
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!authAPI.isAuthenticated()) {
        navigate('/adddmin/login');
        return;
      }
      await fetchData();
    };
    checkAuth();
  }, [navigate, fetchData]); // fetchData is wrapped in useCallback, so it's stable

  const fetchSystemSettings = async () => {
    try {
      const minOrderSetting = await systemSettingsAPI.get('minimum_order_value');
      setMinOrderValue(minOrderSetting.value || 500);
      setSettingsForm({ min_order_value: minOrderSetting.value || 500 });
    } catch (err) {
      // If setting doesn't exist, use default value
      setMinOrderValue(500);
      setSettingsForm({ min_order_value: 500 });
    }
  };

  // Enhanced Analytics data fetching
  const fetchAnalyticsData = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      // Fetch analytics with date filtering and grouping
      const [analyticsData, summaryData] = await Promise.all([
        ordersAPI.getAnalytics(analyticsStartDate, analyticsEndDate, analyticsGroupBy),
        ordersAPI.getSummary(analyticsStartDate, analyticsEndDate)
      ]);
      
      setAnalytics(analyticsData);
      setOrderSummary(summaryData);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError('Failed to fetch analytics data');
      setTimeout(() => setError(''), 5000);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [analyticsStartDate, analyticsEndDate, analyticsGroupBy]);

  // Initialize analytics on component mount
  useEffect(() => {
    if (orders.length > 0) {
      fetchAnalyticsData();
    }
  }, [orders, fetchAnalyticsData]);

  // System Settings management
  const handleSystemSettingsSubmit = async () => {
    setSettingsLoading(true);
    try {
      await systemSettingsAPI.update('minimum_order_value', settingsForm.min_order_value, 'Minimum order value required for checkout');
      setMinOrderValue(settingsForm.min_order_value);
      setSettingsDialogOpen(false);
      alert('Minimum order value updated successfully!');
    } catch (err) {
      console.error('Failed to update system settings:', err);
      alert('Failed to update minimum order value. Please try again.');
    } finally {
      setSettingsLoading(false);
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

  const canEditOrder = (order: Order) => {
    return order.status === 'pending' || order.status === 'confirmed';
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditOrderItems([...order.items]);
    setEditOrderUserInfo({
      name: order.user_name,
      email: order.user_email,
      phone: order.user_phone,
      address: order.user_address,
      password: '' // Admin doesn't need the password field
    });
    setOrderEditError('');
    setOrderEditDialogOpen(true);
  };

  const handleAddProductToOrder = () => {
    if (products.length > 0) {
      const firstProduct = products[0];
      const newItem = {
        product_id: firstProduct._id,
        product_name: firstProduct.name,
        quantity: 1,
        price: firstProduct.price,
        total: firstProduct.price
      };
      setEditOrderItems([...editOrderItems, newItem]);
    }
  };

  const handleUpdateOrderItem = (index: number, field: string, value: any) => {
    const newItems = [...editOrderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'product_id') {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index].product_name = product.name;
        newItems[index].price = product.price;
        newItems[index].total = product.price * newItems[index].quantity;
      }
    } else if (field === 'quantity') {
      newItems[index].total = newItems[index].price * value;
    }
    
    setEditOrderItems(newItems);
  };

  const handleRemoveOrderItem = (index: number) => {
    const newItems = editOrderItems.filter((_, i) => i !== index);
    setEditOrderItems(newItems);
  };

  const calculateOrderTotal = () => {
    return editOrderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSaveOrderEdit = async () => {
    if (editOrderItems.length === 0) {
      setOrderEditError('Order must have at least one item');
      return;
    }

    if (!editOrderUserInfo.name.trim() || !editOrderUserInfo.email.trim() || 
        !editOrderUserInfo.phone.trim() || !editOrderUserInfo.address.trim()) {
      setOrderEditError('All user information fields are required');
      return;
    }

    setSavingOrder(true);
    setOrderEditError('');
    
    try {
      const orderEdit: OrderEditRequest = {
        items: editOrderItems,
        user_info: editOrderUserInfo
      };

      const updatedOrder = await ordersAPI.adminEditOrder(editingOrder!._id!, orderEdit);
      
      // Update the orders list
      setOrders(orders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
      
      setOrderEditDialogOpen(false);
      setEditingOrder(null);
    } catch (err: any) {
      console.error('Error updating order:', err);
      
      // Ensure we always set a string error message, never an object
      let errorMessage = 'Failed to update order. Please try again.';
      
      try {
        if (err.response?.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.detail) {
            if (typeof err.response.data.detail === 'string') {
              errorMessage = err.response.data.detail;
            } else if (Array.isArray(err.response.data.detail)) {
              // Handle validation errors array - ensure each item is converted to string
              const messages = err.response.data.detail.map((error: any) => {
                if (typeof error === 'string') {
                  return error;
                } else if (error && typeof error === 'object') {
                  return error.msg || error.message || 'Validation error';
                } else {
                  return String(error);
                }
              });
              errorMessage = messages.length > 0 ? messages.join(', ') : 'Validation error occurred';
            } else if (typeof err.response.data.detail === 'object') {
              // Convert object to string safely
              errorMessage = 'Validation error: Please check your input';
            } else {
              errorMessage = String(err.response.data.detail);
            }
          } else if (err.response.data.message) {
            errorMessage = String(err.response.data.message);
          } else {
            errorMessage = 'Failed to update order. Please check your input and try again.';
          }
        } else if (err.message) {
          errorMessage = String(err.message);
        }
      } catch (parseError) {
        // If parsing fails for any reason, use default message
        console.error('Error parsing error message:', parseError);
        errorMessage = 'Failed to update order. Please try again.';
      }
      
      // Final safety check - ensure errorMessage is always a string
      if (typeof errorMessage !== 'string') {
        errorMessage = 'Failed to update order. Please try again.';
      }
      
      setOrderEditError(errorMessage);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleCloseOrderEdit = () => {
    setOrderEditDialogOpen(false);
    setEditingOrder(null);
    setOrderEditError('');
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
      // Check if this is existing content with an ID
      const hasExistingId = editingContent._id && editingContent._id !== '';
      
      if (hasExistingId) {
        // Update existing content using ID-based endpoint for specific content items
        await contentAPI.updateById(editingContent._id, contentForm);
      } else {
        // Check if this is main page content (home, about) - these should always be updates
        const isMainPageContent = editingContent.page === 'home' || editingContent.page === 'about';
        
        if (isMainPageContent) {
          // Update existing main page content using page-based endpoint
          await contentAPI.update(editingContent.page, contentForm);
        } else {
          // Create new content (for delivery schedule or new sections)
          await contentAPI.create({
            page: editingContent.page,
            section: editingContent.section || '',
            title: contentForm.title,
            content: contentForm.content
          });
        }
      }
      setContentDialogOpen(false);
      setEditingContent(null);
      fetchData();
    } catch (err: any) {
      console.error('Failed to save content:', err);
      setError('Failed to save content. Please try again.');
      setTimeout(() => setError(''), 5000);
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

  // Recipe management
  const handleRecipeSubmit = async () => {
    try {
      if (editingRecipe) {
        // Update existing recipe using recipesAPI
        await recipesAPI.update(editingRecipe._id, recipeForm);
      } else {
        // Create new recipe using recipesAPI
        await recipesAPI.create(recipeForm);
      }
      setRecipeDialogOpen(false);
      setRecipeForm({ name: '', description: '' });
      setEditingRecipe(null);
      fetchData(); // Use main fetchData function to ensure consistency
    } catch (err) {
      console.error('Failed to save recipe:', err);
    }
  };

  const handleRecipeDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await recipesAPI.delete(id);
        fetchData(); // Use main fetchData function to ensure consistency
      } catch (err) {
        console.error('Failed to delete recipe:', err);
      }
    }
  };

  const handleRecipeImageUpload = async (recipeId: string, file: File) => {
    try {
      await recipesAPI.uploadImage(recipeId, file);
      fetchData(); // Use main fetchData function to ensure consistency
    } catch (err) {
      console.error('Failed to upload recipe image:', err);
    }
  };

  const handleRecipePdfUpload = async (recipeId: string, file: File) => {
    try {
      await recipesAPI.uploadPdf(recipeId, file);
      fetchData(); // Use main fetchData function to ensure consistency
    } catch (err) {
      console.error('Failed to upload recipe PDF:', err);
    }
  };

  const editRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setRecipeForm({ name: recipe.name, description: recipe.description });
    setRecipeDialogOpen(true);
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
    console.log('editContent called with:', content);
    setEditingContent(content);
    setContentForm({ title: content.title, content: content.content });
    console.log('contentForm set to:', { title: content.title, content: content.content });
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
            <Tab label={isMobile ? "Recipes" : "Recipes"} />
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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={categories.map(cat => cat._id)}
              strategy={verticalListSortingStrategy}
            >
              {isMobile ? (
                // Mobile Card Layout with Drag & Drop
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {categories.map((category) => (
                    <SortableCategory
                      key={category._id}
                      category={category}
                      onEdit={editCategory}
                      onDelete={handleCategoryDelete}
                      onImageUpload={handleCategoryImageUpload}
                      isMobile={isMobile}
                    />
                  ))}
                </Box>
              ) : (
                // Desktop Table Layout with Drag & Drop
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
                        <SortableCategory
                          key={category._id}
                          category={category}
                          onEdit={editCategory}
                          onDelete={handleCategoryDelete}
                          onImageUpload={handleCategoryImageUpload}
                          isMobile={isMobile}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </SortableContext>
          </DndContext>
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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleProductDragEnd}
          >
            <SortableContext
              items={products.map(product => product._id)}
              strategy={verticalListSortingStrategy}
            >
              {isMobile ? (
                // Mobile Card Layout with Drag & Drop
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {products.map((product) => (
                    <SortableProduct
                      key={product._id}
                      product={product}
                      categories={categories}
                      onEdit={editProduct}
                      onDelete={handleProductDelete}
                      onImageUpload={handleProductImageUpload}
                      isMobile={isMobile}
                    />
                  ))}
                </Box>
              ) : (
                // Desktop Table Layout with Drag & Drop
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
                      {products.map((product) => (
                        <SortableProduct
                          key={product._id}
                          product={product}
                          categories={categories}
                          onEdit={editProduct}
                          onDelete={handleProductDelete}
                          onImageUpload={handleProductImageUpload}
                          isMobile={isMobile}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </SortableContext>
          </DndContext>
        </TabPanel>

        {/* Recipes Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'stretch' : 'center',
            mb: 2,
            gap: isMobile ? 2 : 0 
          }}>
            <Typography variant={isMobile ? "h6" : "h5"}>Recipes Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setRecipeDialogOpen(true)}
              fullWidth={isMobile}
              size={isMobile ? "large" : "medium"}
            >
              Add Recipe
            </Button>
          </Box>

          {isMobile ? (
            // Mobile Card Layout for Recipes
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recipes.map((recipe) => (
                <Card key={recipe._id} elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>{recipe.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {recipe.description.length > 100 
                            ? `${recipe.description.substring(0, 100)}...` 
                            : recipe.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {formatDate(recipe.created_at)}
                        </Typography>
                        {recipe.pdf_url && (
                          <Chip
                            label="PDF Available"
                            size="small"
                            sx={{ mt: 1, display: 'block' }}
                          />
                        )}
                      </Box>
                      {recipe.image_url && (
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${recipe.image_url}`}
                          alt={recipe.name}
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
                          id={`recipe-image-${recipe._id}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleRecipeImageUpload(recipe._id, file);
                          }}
                        />
                        <label htmlFor={`recipe-image-${recipe._id}`}>
                          <Button component="span" size="small" startIcon={<PhotoCamera />}>
                            {recipe.image_url ? 'Change Image' : 'Add Image'}
                          </Button>
                        </label>
                      </Box>
                      <Box>
                        <IconButton onClick={() => editRecipe(recipe)} color="primary">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleRecipeDelete(recipe._id)} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            // Desktop Table Layout for Recipes
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>PDF</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recipes.map((recipe) => (
                    <TableRow key={recipe._id}>
                      <TableCell>{recipe.name}</TableCell>
                      <TableCell>
                        {recipe.description.length > 50 
                          ? `${recipe.description.substring(0, 50)}...` 
                          : recipe.description}
                      </TableCell>
                      <TableCell>
                        {recipe.image_url ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${recipe.image_url}`}
                            alt={recipe.name}
                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                          />
                        ) : (
                          'No image'
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`recipe-image-${recipe._id}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleRecipeImageUpload(recipe._id, file);
                          }}
                        />
                        <label htmlFor={`recipe-image-${recipe._id}`}>
                          <IconButton component="span" size="small">
                            <PhotoCamera />
                          </IconButton>
                        </label>
                      </TableCell>
                      <TableCell>
                        {recipe.pdf_url ? (
                          <Chip label="Available" color="success" size="small" />
                        ) : (
                          <Chip label="None" color="default" size="small" />
                        )}
                        <input
                          type="file"
                          accept=".pdf"
                          style={{ display: 'none' }}
                          id={`recipe-pdf-${recipe._id}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleRecipePdfUpload(recipe._id, file);
                          }}
                        />
                        <label htmlFor={`recipe-pdf-${recipe._id}`}>
                          <IconButton component="span" size="small" title="Upload PDF">
                            <PhotoCamera />
                          </IconButton>
                        </label>
                      </TableCell>
                      <TableCell>{formatDate(recipe.created_at)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => editRecipe(recipe)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleRecipeDelete(recipe._id)}>
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

        {/* Orders Tab */}
        <TabPanel value={currentTab} index={3}>
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
                          Order #{order._id?.slice(-8).toUpperCase()}
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
                          onChange={(e) => order._id && handleOrderStatusUpdate(order._id, e.target.value)}
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
                        {canEditOrder(order) && order._id && (
                          <IconButton 
                            onClick={() => handleEditOrder(order)}
                            color="secondary"
                            title="Edit Order"
                          >
                            <Edit />
                          </IconButton>
                        )}
                        {order._id && (
                          <IconButton 
                            onClick={() => handleOrderDelete(order._id!)} 
                            color="error"
                            title="Delete Order"
                          >
                            <Delete />
                          </IconButton>
                        )}
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
                      <TableCell>#{order._id?.slice(-8).toUpperCase()}</TableCell>
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
                            onChange={(e) => order._id && handleOrderStatusUpdate(order._id, e.target.value)}
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
                        {canEditOrder(order) && (
                          <IconButton 
                            onClick={() => handleEditOrder(order)}
                            title="Edit Order"
                            color="secondary"
                          >
                            <Edit />
                          </IconButton>
                        )}
                        {order._id && (
                          <IconButton onClick={() => handleOrderDelete(order._id!)} title="Delete Order">
                            <Delete />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={currentTab} index={4}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'stretch' : 'center',
            mb: 3,
            gap: isMobile ? 2 : 0 
          }}>
            <Typography variant={isMobile ? "h6" : "h5"}>Enhanced Analytics Dashboard</Typography>
            <Button
              variant="contained"
              onClick={fetchAnalyticsData}
              disabled={analyticsLoading}
              startIcon={analyticsLoading ? <CircularProgress size={16} /> : undefined}
              fullWidth={isMobile}
              size={isMobile ? "large" : "medium"}
            >
              {analyticsLoading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </Box>

          {/* Analytics Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Analytics Filters</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={analyticsStartDate}
                    onChange={(e) => setAnalyticsStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={analyticsEndDate}
                    onChange={(e) => setAnalyticsEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Group By</InputLabel>
                    <Select
                      value={analyticsGroupBy}
                      onChange={(e) => setAnalyticsGroupBy(e.target.value as 'product' | 'week' | 'month')}
                      label="Group By"
                    >
                      <MenuItem value="product">By Product</MenuItem>
                      <MenuItem value="week">By Week</MenuItem>
                      <MenuItem value="month">By Month</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={fetchAnalyticsData}
                    disabled={analyticsLoading}
                    size={isMobile ? "large" : "small"}
                  >
                    Apply Filters
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Enhanced Summary Cards */}
          <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom color="primary">Total Orders</Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} color="primary">
                    {analyticsLoading ? <CircularProgress size={30} /> : orderSummary.total_orders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom color="success.main">Total Revenue</Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} color="success.main">
                    {analyticsLoading ? <CircularProgress size={30} /> : `₹${orderSummary.total_revenue?.toFixed(2) || '0.00'}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom color="info.main">Avg Order Value</Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} color="info.main">
                    {analyticsLoading ? <CircularProgress size={30} /> : `₹${orderSummary.avg_order_value?.toFixed(2) || '0.00'}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom color="warning.main">Items Sold</Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} color="warning.main">
                    {analyticsLoading ? <CircularProgress size={30} /> : orderSummary.total_items_sold}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Additional Summary Cards */}
          <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>Min Order Value</Typography>
                  <Typography variant="h5" color="text.secondary">
                    ₹{orderSummary.min_order_value?.toFixed(2) || '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>Max Order Value</Typography>
                  <Typography variant="h5" color="text.secondary">
                    ₹{orderSummary.max_order_value?.toFixed(2) || '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Order Status Distribution</Typography>
                  <Box sx={{ mt: 2 }}>
                    {orderSummary.status_counts && Object.entries(orderSummary.status_counts).map(([status, count]) => (
                      <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip 
                          label={status.charAt(0).toUpperCase() + status.slice(1)} 
                          color={getStatusColor(status) as any}
                          size="small"
                        />
                        <Typography variant="body2">{String(count)}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Analytics Data Table/Cards */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'stretch' : 'center',
            mb: 2,
            gap: isMobile ? 2 : 0 
          }}>
            <Typography variant="h6">
              {analyticsGroupBy === 'product' && 'Product Sales Analytics'}
              {analyticsGroupBy === 'week' && 'Weekly Sales Summary'}
              {analyticsGroupBy === 'month' && 'Monthly Sales Summary'}
            </Typography>
            {analytics.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Showing {analytics.length} {analyticsGroupBy === 'product' ? 'products' : `${analyticsGroupBy}s`}
              </Typography>
            )}
          </Box>

          {analyticsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : analytics.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No analytics data available for the selected date range and grouping.
            </Alert>
          ) : isMobile ? (
            // Mobile Card Layout
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {analytics.map((item, index) => (
                <Card key={`${item.product_id || 'period'}-${index}`} elevation={1}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {analyticsGroupBy === 'product' ? item.product_name : 
                       analyticsGroupBy === 'week' ? `Week ${item.period || index + 1}` :
                       `Month ${item.period || index + 1}`}
                    </Typography>
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
                    {analyticsGroupBy !== 'product' && item.order_count && (
                      <Box sx={{ mt: 1, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.order_count} orders
                        </Typography>
                      </Box>
                    )}
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
                    <TableCell>
                      {analyticsGroupBy === 'product' && 'Product Name'}
                      {analyticsGroupBy === 'week' && 'Week'}
                      {analyticsGroupBy === 'month' && 'Month'}
                    </TableCell>
                    <TableCell align="right">Quantity Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    {analyticsGroupBy !== 'product' && <TableCell align="right">Orders</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.map((item, index) => (
                    <TableRow key={`${item.product_id || 'period'}-${index}`}>
                      <TableCell>
                        {analyticsGroupBy === 'product' ? item.product_name : 
                         analyticsGroupBy === 'week' ? `Week ${item.period || index + 1}` :
                         `Month ${item.period || index + 1}`}
                      </TableCell>
                      <TableCell align="right">{item.total_quantity}</TableCell>
                      <TableCell align="right">₹{item.total_revenue.toFixed(2)}</TableCell>
                      {analyticsGroupBy !== 'product' && (
                        <TableCell align="right">{item.order_count || 0}</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Content & Contact Management Tab */}
        <TabPanel value={currentTab} index={5}>
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

            {/* Delivery Schedule Content */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Delivery Schedule</Typography>
                  <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                    Order deadline and delivery information shown on cart page
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, maxHeight: 60, overflow: 'hidden' }}>
                    <strong>Current:</strong> {deliveryContent?.content || 'Orders should be placed before every Wednesday 6 PM and will be delivered on Sunday'}
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={async () => {
                      if (deliveryContent) {
                        // Edit existing content
                        setEditingContent(deliveryContent);
                        setContentForm({ title: deliveryContent.title || 'Delivery Schedule', content: deliveryContent.content });
                      } else {
                        // Create new content
                        setEditingContent({ 
                          _id: '', 
                          page: 'delivery', 
                          section: 'schedule',
                          title: 'Delivery Schedule', 
                          content: 'Orders should be placed before every Wednesday 6 PM and will be delivered on Sunday',
                          created_at: '',
                          updated_at: ''
                        } as Content);
                        setContentForm({ 
                          title: 'Delivery Schedule', 
                          content: 'Orders should be placed before every Wednesday 6 PM and will be delivered on Sunday' 
                        });
                      }
                      setContentDialogOpen(true);
                    }}
                  >
                    {deliveryContent ? 'Edit Schedule' : 'Create Schedule'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Home Page Content Sections */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Home Page Content Sections</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Categories Heading</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Main heading for product categories section
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setEditingContent({
                      _id: '', 
                      page: 'home', 
                      section: 'categories_heading',
                      title: 'Our Product Categories', 
                      content: '',
                      created_at: '',
                      updated_at: ''
                    } as Content);
                    setContentForm({ 
                      title: 'Our Product Categories', 
                      content: '' 
                    });
                    setContentDialogOpen(true);
                  }}
                >
                  Edit Heading
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Features Heading</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Main heading for "Why Choose Us" section
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setEditingContent({
                      _id: '', 
                      page: 'home', 
                      section: 'features_heading',
                      title: 'Why Choose Akshayam Wellness?', 
                      content: '',
                      created_at: '',
                      updated_at: ''
                    } as Content);
                    setContentForm({ 
                      title: 'Why Choose Akshayam Wellness?', 
                      content: '' 
                    });
                    setContentDialogOpen(true);
                  }}
                >
                  Edit Heading
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Feature 1</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  First feature box content
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setEditingContent({
                      _id: '', 
                      page: 'home', 
                      section: 'feature_1',
                      title: '100% Organic', 
                      content: 'All our products are certified organic and are self products',
                      created_at: '',
                      updated_at: ''
                    } as Content);
                    setContentForm({ 
                      title: '100% Organic', 
                      content: 'All our products are certified organic and are self products' 
                    });
                    setContentDialogOpen(true);
                  }}
                >
                  Edit Feature
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Feature 2</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Second feature box content
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setEditingContent({
                      _id: '', 
                      page: 'home', 
                      section: 'feature_2',
                      title: 'Quality Assured', 
                      content: 'Every product undergoes rigorous quality checks before reaching you',
                      created_at: '',
                      updated_at: ''
                    } as Content);
                    setContentForm({ 
                      title: 'Quality Assured', 
                      content: 'Every product undergoes rigorous quality checks before reaching you' 
                    });
                    setContentDialogOpen(true);
                  }}
                >
                  Edit Feature
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Feature 3</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Third feature box content
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setEditingContent({
                      _id: '', 
                      page: 'home', 
                      section: 'feature_3',
                      title: 'Delivery Schedule', 
                      content: 'Orders should be placed before every Wednesday 6 PM and the shipment will be delivered on Sunday',
                      created_at: '',
                      updated_at: ''
                    } as Content);
                    setContentForm({ 
                      title: 'Delivery Schedule', 
                      content: 'Orders should be placed before every Wednesday 6 PM and the shipment will be delivered on Sunday' 
                    });
                    setContentDialogOpen(true);
                  }}
                >
                  Edit Feature
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* About Page Content Sections */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>About Page Content Sections</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Mission Section</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Company mission statement
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setEditingContent({
                      _id: '', 
                      page: 'about', 
                      section: 'mission',
                      title: 'Our Mission', 
                      content: 'To promote healthier living by providing access to authentic, organic wellness products that nourish the body and mind while supporting sustainable farming practices.',
                      created_at: '',
                      updated_at: ''
                    } as Content);
                    setContentForm({ 
                      title: 'Our Mission', 
                      content: 'To promote healthier living by providing access to authentic, organic wellness products that nourish the body and mind while supporting sustainable farming practices.' 
                    });
                    setContentDialogOpen(true);
                  }}
                >
                  Edit Mission
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Values Section</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Company values and principles
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setEditingContent({
                      _id: '', 
                      page: 'about', 
                      section: 'values',
                      title: 'Our Values', 
                      content: '• Quality First: We source only the finest organic products\n• Sustainability: Supporting eco-friendly farming practices\n• Transparency: Clear information about product origins\n• Customer Care: Dedicated to your wellness journey',
                      created_at: '',
                      updated_at: ''
                    } as Content);
                    setContentForm({ 
                      title: 'Our Values', 
                      content: '• Quality First: We source only the finest organic products\n• Sustainability: Supporting eco-friendly farming practices\n• Transparency: Clear information about product origins\n• Customer Care: Dedicated to your wellness journey'
                    });
                    setContentDialogOpen(true);
                  }}
                >
                  Edit Values
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Why Organic</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Benefits of organic products
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setEditingContent({
                      _id: '', 
                      page: 'about', 
                      section: 'organic',
                      title: 'Why Choose Organic?', 
                      content: 'Organic products are grown without harmful pesticides, synthetic fertilizers, or GMOs. They\'re not only better for your health but also for the environment.',
                      created_at: '',
                      updated_at: ''
                    } as Content);
                    setContentForm({ 
                      title: 'Why Choose Organic?', 
                      content: 'Organic products are grown without harmful pesticides, synthetic fertilizers, or GMOs. They\'re not only better for your health but also for the environment.'
                    });
                    setContentDialogOpen(true);
                  }}
                >
                  Edit Content
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Certifications</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Product certification details
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setEditingContent({
                      _id: '', 
                      page: 'about', 
                      section: 'certifications',
                      title: 'Our Certifications', 
                      content: 'All our products are certified organic by recognized authorities, ensuring you receive genuine, high-quality wellness products.',
                      created_at: '',
                      updated_at: ''
                    } as Content);
                    setContentForm({ 
                      title: 'Our Certifications', 
                      content: 'All our products are certified organic by recognized authorities, ensuring you receive genuine, high-quality wellness products.'
                    });
                    setContentDialogOpen(true);
                  }}
                >
                  Edit Content
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Customer Satisfaction</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Customer satisfaction statement
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setEditingContent({
                      _id: '', 
                      page: 'about', 
                      section: 'satisfaction',
                      title: 'Customer Satisfaction', 
                      content: 'With thousands of happy customers, we take pride in our commitment to quality and service excellence.',
                      created_at: '',
                      updated_at: ''
                    } as Content);
                    setContentForm({ 
                      title: 'Customer Satisfaction', 
                      content: 'With thousands of happy customers, we take pride in our commitment to quality and service excellence.'
                    });
                    setContentDialogOpen(true);
                  }}
                >
                  Edit Content
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* System Settings Section */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>System Settings</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>System Settings</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Min Order Value:</strong> ₹{minOrderValue}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => setSettingsDialogOpen(true)}
                >
                  Edit Min Order
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* System Settings Section */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'stretch' : 'center',
                mb: 3,
                gap: isMobile ? 2 : 0 
              }}>
                <Typography variant="h6">System Settings</Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Edit />}
                  fullWidth={isMobile}
                  size={isMobile ? "large" : "medium"}
                  onClick={() => setSettingsDialogOpen(true)}
                >
                  Edit System Settings
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Minimum Order Value:</strong> ₹{minOrderValue}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Customers must place orders above this amount to checkout successfully.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Status:</strong> Active & enforced on cart page
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                    This setting affects both website display and order validation.
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
              Order Details - #{selectedOrder?._id?.slice(-8).toUpperCase()}
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
                  if (selectedOrder._id) {
                    handleOrderStatusUpdate(selectedOrder._id, e.target.value);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                  }
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

      {/* Recipe Dialog */}
      <Dialog 
        open={recipeDialogOpen} 
        onClose={() => setRecipeDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>{editingRecipe ? 'Edit Recipe' : 'Add Recipe'}</DialogTitle>
        <DialogContent sx={{ pb: isMobile ? 2 : 1 }}>
          <TextField
            fullWidth
            label="Recipe Name"
            value={recipeForm.name}
            onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={isMobile ? 6 : 4}
            value={recipeForm.description}
            onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
            placeholder="Enter detailed recipe instructions, ingredients, cooking time, etc."
          />
        </DialogContent>
        <DialogActions sx={{ 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          p: isMobile ? 2 : 1
        }}>
          <Button 
            onClick={() => {
              setRecipeDialogOpen(false);
              setEditingRecipe(null);
              setRecipeForm({ name: '', description: '' });
            }}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRecipeSubmit} 
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Edit Dialog */}
      <Dialog 
        open={orderEditDialogOpen} 
        onClose={handleCloseOrderEdit}
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Edit Order - #{editingOrder?._id?.slice(-8).toUpperCase()}</DialogTitle>
        <DialogContent sx={{ pb: isMobile ? 2 : 1 }}>
          {orderEditError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {orderEditError}
            </Alert>
          )}
          
          {/* User Information Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Customer Information</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={editOrderUserInfo.name}
                onChange={(e) => setEditOrderUserInfo({ ...editOrderUserInfo, name: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editOrderUserInfo.email}
                onChange={(e) => setEditOrderUserInfo({ ...editOrderUserInfo, email: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editOrderUserInfo.phone}
                onChange={(e) => setEditOrderUserInfo({ ...editOrderUserInfo, phone: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                value={editOrderUserInfo.address}
                onChange={(e) => setEditOrderUserInfo({ ...editOrderUserInfo, address: e.target.value })}
                multiline
                rows={2}
                size="small"
              />
            </Grid>
          </Grid>

          {/* Order Items Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Order Items</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={handleAddProductToOrder}
              disabled={products.length === 0}
            >
              Add Item
            </Button>
          </Box>

          {editOrderItems.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Order must have at least one item
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 2, maxHeight: isMobile ? 300 : 400 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center" sx={{ minWidth: 80 }}>Qty</TableCell>
                    {!isMobile && <TableCell align="right">Price</TableCell>}
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editOrderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={item.product_id}
                            onChange={(e) => handleUpdateOrderItem(index, 'product_id', e.target.value)}
                          >
                            {products.map((product) => (
                              <MenuItem key={product._id} value={product._id}>
                                {product.name} (₹{product.price})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          size="small"
                          inputProps={{ min: 1, style: { textAlign: 'center' } }}
                          sx={{ width: 70 }}
                        />
                      </TableCell>
                      {!isMobile && (
                        <TableCell align="right">
                          ₹{item.price.toFixed(2)}
                        </TableCell>
                      )}
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          ₹{item.total.toFixed(2)}
                        </Typography>
                        {isMobile && (
                          <Typography variant="caption" color="text.secondary">
                            ₹{item.price.toFixed(2)} each
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleRemoveOrderItem(index)}
                          color="error"
                          size="small"
                          disabled={editOrderItems.length === 1}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={isMobile ? 3 : 4}>
                      <Typography variant="h6">Total Amount:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="primary">
                        ₹{calculateOrderTotal().toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          p: isMobile ? 2 : 1
        }}>
          <Button 
            onClick={handleCloseOrderEdit}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            disabled={savingOrder}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveOrderEdit}
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            disabled={savingOrder || editOrderItems.length === 0}
            startIcon={savingOrder ? <CircularProgress size={16} /> : <Edit />}
          >
            {savingOrder ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* System Settings Dialog */}
      <Dialog 
        open={settingsDialogOpen} 
        onClose={() => setSettingsDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Edit System Settings</DialogTitle>
        <DialogContent sx={{ pb: isMobile ? 2 : 1 }}>
          <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
            The minimum order value is enforced during checkout. Customers must place orders above this amount to successfully complete their purchase.
          </Alert>
          
          <TextField
            fullWidth
            label="Minimum Order Value (₹)"
            type="number"
            value={settingsForm.min_order_value}
            onChange={(e) => setSettingsForm({ 
              ...settingsForm, 
              min_order_value: parseFloat(e.target.value) || 0 
            })}
            sx={{ mb: 2 }}
            helperText="Enter the minimum amount required for orders. Current value will be shown on cart page."
            inputProps={{ min: 0, step: 50 }}
          />
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
              Preview: Cart Page Message
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              "Minimum order value: ₹{settingsForm.min_order_value}. Please add more items to your cart."
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          p: isMobile ? 2 : 1
        }}>
          <Button 
            onClick={() => setSettingsDialogOpen(false)}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            disabled={settingsLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSystemSettingsSubmit} 
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            disabled={settingsLoading}
            startIcon={settingsLoading ? <CircularProgress size={16} /> : <Edit />}
          >
            {settingsLoading ? 'Updating...' : 'Update Settings'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin;
