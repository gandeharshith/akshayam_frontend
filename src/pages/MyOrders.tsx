import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Edit,
  Add,
  Remove,
  Delete,
  Close
} from '@mui/icons-material';
import { ordersAPI, productsAPI } from '../services/api';
import { Order, OrderItem, OrderEditRequest, UserLogin, Product } from '../types';

const MyOrders: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searched, setSearched] = useState(false);

  // Order editing states
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [editUserInfo, setEditUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const handleSearch = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const userOrders = await ordersAPI.getUserOrders(email, password);
      setOrders(userOrders);
      setSearched(true);
    } catch (err) {
      setError('Failed to fetch orders. Please check your email and password and try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load products for editing
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await productsAPI.getAll();
        setProducts(allProducts);
      } catch (err) {
        console.error('Error loading products:', err);
      }
    };
    loadProducts();
  }, []);

  const canEditOrder = (order: Order) => {
    return order.status === 'pending' || order.status === 'confirmed';
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditItems([...order.items]);
    setEditUserInfo({
      name: order.user_name,
      email: order.user_email,
      phone: order.user_phone,
      address: order.user_address,
      password: password // Use the current password
    });
    setEditError('');
    setEditDialogOpen(true);
  };

  const handleAddProduct = () => {
    if (products.length > 0) {
      const firstProduct = products[0];
      const newItem: OrderItem = {
        product_id: firstProduct._id,
        product_name: firstProduct.name,
        quantity: 1,
        price: firstProduct.price,
        total: firstProduct.price
      };
      setEditItems([...editItems, newItem]);
    }
  };

  const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...editItems];
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
    
    setEditItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editItems.filter((_, i) => i !== index);
    setEditItems(newItems);
  };

  const calculateTotal = () => {
    return editItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSaveOrder = async () => {
    if (editItems.length === 0) {
      setEditError('Order must have at least one item');
      return;
    }

    if (!editUserInfo.name.trim() || !editUserInfo.email.trim() || !editUserInfo.phone.trim() || !editUserInfo.address.trim()) {
      setEditError('All user information fields are required');
      return;
    }

    setSaving(true);
    setEditError('');
    
    try {
      const orderEdit: OrderEditRequest = {
        items: editItems,
        user_info: editUserInfo
      };
      
      const userLogin: UserLogin = {
        email: editUserInfo.email,
        password: editUserInfo.password
      };

      const updatedOrder = await ordersAPI.editOrder(editingOrder!._id!, orderEdit, userLogin);
      
      // Update the orders list
      setOrders(orders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
      
      setEditDialogOpen(false);
      setEditingOrder(null);
    } catch (err: any) {
      console.error('Error updating order:', err);
      
      // Handle different types of error responses
      let errorMessage = 'Failed to update order. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle FastAPI validation errors (422 status)
        if (err.response.status === 422 && Array.isArray(errorData.detail)) {
          // Extract validation error messages
          const validationErrors = errorData.detail.map((error: any) => {
            if (error.msg) return error.msg;
            if (error.type) return `${error.type}: ${error.input}`;
            return 'Validation error';
          });
          errorMessage = validationErrors.join(', ');
        }
        // Handle string error messages
        else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
        // Handle object error responses with message field
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Handle other object responses
        else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      setEditError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setEditingOrder(null);
    setEditError('');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Track Your Orders
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your email address and password to view all your orders and track their status
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              disabled={loading}
              helperText="Password you set during checkout"
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Search />}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {searched && orders.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No orders found for this email address.
        </Alert>
      )}

      {orders.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Found {orders.length} order{orders.length !== 1 ? 's' : ''}
          </Typography>

          {orders.map((order) => (
            <Accordion key={order._id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" component="div">
                      Order #{order._id?.slice(-8).toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(order.created_at)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                    {canEditOrder(order) && (
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOrder(order);
                        }}
                        variant="outlined"
                      >
                        Edit
                      </Button>
                    )}
                    <Typography variant="h6" color="primary">
                      ₹{order.total_amount.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Order Items
                    </Typography>
                    <List dense>
                      {order.items.map((item, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={item.product_name}
                            secondary={
                              <Box>
                                <Typography variant="body2" component="span">
                                  Quantity: {item.quantity} × ₹{item.price} = ₹{item.total.toFixed(2)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Delivery Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {order.user_name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {order.user_email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {order.user_phone}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Address:</strong> {order.user_address}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box>
                      <Typography variant="body2">
                        <strong>Order Date:</strong> {formatDate(order.created_at)}
                      </Typography>
                      {order.updated_at !== order.created_at && (
                        <Typography variant="body2">
                          <strong>Last Updated:</strong> {formatDate(order.updated_at)}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Edit Order Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEdit} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Order {editingOrder?._id?.slice(-8).toUpperCase()}
          <IconButton onClick={handleCloseEdit}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}

          {/* Order Items */}
          <Typography variant="h6" gutterBottom>
            Order Items
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {editItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={item.product_id}
                          onChange={(e) => handleUpdateItem(index, 'product_id', e.target.value)}
                        >
                          {products.map((product) => (
                            <MenuItem key={product._id} value={product._id}>
                              {product.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="right">
                      ₹{item.price.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleUpdateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          size="small"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          sx={{ width: 70 }}
                          inputProps={{ min: 1 }}
                        />
                        <IconButton 
                          size="small"
                          onClick={() => handleUpdateItem(index, 'quantity', item.quantity + 1)}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      ₹{item.total.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button 
              startIcon={<Add />} 
              onClick={handleAddProduct}
              variant="outlined"
            >
              Add Product
            </Button>
            <Typography variant="h6" color="primary">
              Total: ₹{calculateTotal().toFixed(2)}
            </Typography>
          </Box>

          {/* User Information */}
          <Typography variant="h6" gutterBottom>
            Delivery Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={editUserInfo.name}
                onChange={(e) => setEditUserInfo({...editUserInfo, name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editUserInfo.email}
                onChange={(e) => setEditUserInfo({...editUserInfo, email: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editUserInfo.phone}
                onChange={(e) => setEditUserInfo({...editUserInfo, phone: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={editUserInfo.password}
                onChange={(e) => setEditUserInfo({...editUserInfo, password: e.target.value})}
                required
                helperText="Required for authentication"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={editUserInfo.address}
                onChange={(e) => setEditUserInfo({...editUserInfo, address: e.target.value})}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseEdit}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveOrder}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyOrders;
