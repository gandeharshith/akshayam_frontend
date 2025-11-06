# Akshayam Wellness - Frontend

React TypeScript frontend for the Akshayam Wellness e-commerce platform specializing in organic products.

## Features

- **Modern UI**: Material-UI components with responsive design
- **Product Catalog**: Browse products by categories with shopping cart
- **Order Management**: Password-protected order placement and tracking
- **Admin Panel**: Comprehensive management interface (hidden access)
- **Content Management**: Dynamic home and about page content
- **Image Uploads**: Support for product, category, and logo images
- **Authentication**: Secure JWT-based admin authentication

## Tech Stack

- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Build Tool**: Create React App

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd akshayam-wellness-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   The app is configured to connect to `http://localhost:8000` for the backend API.
   Update the API base URL in `src/services/api.ts` if needed.

4. **Start development server**
   ```bash
   npm start
   ```

The app will run on `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar
│   └── Footer.tsx      # Footer component
├── contexts/           # React contexts
│   └── CartContext.tsx # Shopping cart state management
├── pages/              # Page components
│   ├── Home.tsx        # Home page
│   ├── About.tsx       # About page
│   ├── Products.tsx    # Product catalog and checkout
│   ├── MyOrders.tsx    # Order tracking (password-protected)
│   ├── AdminLogin.tsx  # Admin login page
│   └── Admin.tsx       # Admin panel (full management)
├── services/           # API services
│   └── api.ts          # Axios API client and endpoints
├── types/              # TypeScript type definitions
│   └── index.ts        # Application types
├── App.tsx             # Main app component
├── index.tsx           # App entry point
└── index.css           # Global styles
```

## Key Features

### Customer Features
- **Browse Products**: View products by category with detailed information
- **Shopping Cart**: Add/remove items with quantity management
- **Secure Checkout**: Order placement with password setup
- **Order Tracking**: View order history using email + password authentication

### Admin Features (Access via `/adddmin/login`)
- **Category Management**: Create, edit, delete categories with image uploads
- **Product Management**: Full CRUD operations with inventory tracking
- **Order Management**: 
  - View all orders with customer details
  - Update order status (pending, confirmed, shipped, delivered, cancelled)
  - Delete orders
  - Detailed order modal with itemized breakdown
- **Content Management**: Edit home and about page content and logos
- **Analytics**: View sales reports and product performance metrics

## Routes

### Public Routes
- `/` - Home page
- `/about` - About page
- `/products` - Product catalog and shopping
- `/my-orders` - Password-protected order tracking

### Admin Routes (Hidden)
- `/adddmin/login` - Admin login
- `/adddmin` - Admin dashboard (requires authentication)

## Authentication

### Admin Access
- **Login URL**: `/adddmin/login` (not visible in navigation)
- **Credentials**: Contact administrator
- **Token Storage**: JWT tokens stored in localStorage
- **Session Management**: Automatic redirect to login if unauthorized

### Customer Authentication
- **Order Tracking**: Email + password authentication
- **Password Setup**: During checkout process
- **Secure**: Passwords hashed on backend

## API Integration

The frontend communicates with the FastAPI backend via:
- **Base URL**: `http://localhost:8000/api`
- **Authentication**: Bearer token for admin routes
- **File Uploads**: Multipart form data for images
- **Error Handling**: Centralized error management

## Security Features

- **Hidden Admin Access**: No visible navigation to admin panel
- **JWT Authentication**: Secure token-based admin sessions
- **Password Protection**: Customer orders require authentication
- **Input Validation**: Form validation and sanitization
- **CORS Protection**: Configured for secure API communication

## Building for Production

```bash
npm run build
```

This creates an optimized build in the `build/` folder ready for deployment.

## Deployment Notes

- Update API base URL in `api.ts` for production backend
- Configure proper CORS settings on backend
- Set up HTTPS for production
- Consider CDN for static assets
