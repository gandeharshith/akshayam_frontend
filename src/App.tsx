import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CartProvider } from './contexts/CartContext';

// Import pages
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
        <Router>
          <div className="App">
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 140px)' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/products" element={<Products />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/adddmin/login" element={<AdminLogin />} />
                <Route path="/adddmin/*" element={<Admin />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
