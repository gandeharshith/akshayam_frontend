import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Snackbar, Alert } from '@mui/material';
import { CartProvider, useCart } from './contexts/CartContext';
import './services/keepAlive'; // Import keep-alive service to auto-start it
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Recipes from './pages/Recipes';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

// Notification component
const CartNotification: React.FC = () => {
  const { notification, hideNotification } = useCart();

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={2000}
      onClose={hideNotification}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      <Alert
        onClose={hideNotification}
        severity="success"
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

// App content component that uses the cart context
const AppContent: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 140px)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/adddmin/login" element={<AdminLogin />} />
            <Route path="/adddmin/*" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        <CartNotification />
      </div>
    </Router>
  );
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // Green theme for wellness/organic
    },
    secondary: {
      main: '#81c784',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
