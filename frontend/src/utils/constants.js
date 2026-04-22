// User types
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  VERIFIED: 'verified',
};

// Booking types
export const BOOKING_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PAYMENT_METHOD = {
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
};

// Step types for multi-step form
export const BOOKING_STEPS = [
  { id: 1, name: 'Service', route: 'service' },
  { id: 2, name: 'Location', route: 'location' },
  { id: 3, name: 'Product', route: 'product' },
  { id: 4, name: 'Upload', route: 'upload' },
  { id: 5, name: 'Factory', route: 'factory' },
  { id: 6, name: 'Contact', route: 'contact' },
  { id: 7, name: 'AQL', route: 'aql' },
  { id: 8, name: 'Overview', route: 'overview' },
  { id: 9, name: 'Payment', route: 'payment' },
];

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    VERIFY_EMAIL: '/auth/verify-email',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  BOOKING: {
    CREATE: '/bookings',
    LIST: '/bookings',
    GET: (id) => `/bookings/${id}`,
    UPDATE: (id) => `/bookings/${id}`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
  },
  PAYMENT: {
    CREATE: '/payments',
    STATUS: (id) => `/payments/${id}`,
    VERIFY: '/payments/verify',
  },
  UPLOAD: {
    DOCUMENT: '/upload/document',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    BOOKINGS: '/admin/bookings',
    PAYMENTS: '/admin/payments',
  },
};

// Validation patterns
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^[\d\s\-\+\(\)]{10,}$/,
};

// File upload constraints
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  MAX_FILES: 5,
};

// Stepper component constants
export const STEPPER_CONFIG = {
  COLORS: {
    ACTIVE: 'bg-blue-600',
    COMPLETED: 'bg-green-500',
    PENDING: 'bg-gray-300',
  },
};

// Definitions for services, products, and factories
export const services = [
  {
    id: 'pre-production',
    name: 'Pre-Production Inspection',
    description: 'Check materials and components before manufacturing begins',
    price: 299,
  },
  {
    id: 'during-production',
    name: 'During Production Inspection',
    description: 'Monitor quality during the manufacturing process',
    price: 399,
  },
  {
    id: 'pre-shipment',
    name: 'Pre-Shipment Inspection',
    description: 'Final inspection before goods are shipped',
    price: 499,
  },
  {
    id: 'container-loading',
    name: 'Container Loading Supervision',
    description: 'Supervise loading and verify container integrity',
    price: 199,
  },
  {
    id: 'audit',
    name: 'Factory Audit',
    description: 'Comprehensive evaluation of factory capabilities',
    price: 799,
  },
];

export const products = [
  {
    id: 'electronics',
    name: 'Electronics',
    category: 'Consumer Electronics',
    commonMaterials: ['PCB', 'Plastic', 'Metal'],
  },
  {
    id: 'textiles',
    name: 'Textiles & Apparel',
    category: 'Clothing & Fabrics',
    commonMaterials: ['Cotton', 'Polyester', 'Wool'],
  },
  {
    id: 'toys',
    name: 'Toys & Games',
    category: 'Children Products',
    commonMaterials: ['Plastic', 'Rubber', 'Paint'],
  },
  {
    id: 'food',
    name: 'Food & Beverages',
    category: 'Packaged Goods',
    commonMaterials: ['Packaging', 'Ingredients'],
  },
  {
    id: 'machinery',
    name: 'Machinery & Equipment',
    category: 'Industrial',
    commonMaterials: ['Steel', 'Aluminum', 'Electronics'],
  },
];

export const factories = [
  {
    id: 'factory-shanghai',
    name: 'Shanghai Electronics Manufacturing Co.',
    location: 'Shanghai, China',
    capacity: '50,000 units/month',
    certifications: ['ISO 9001', 'CE', 'RoHS'],
    specialties: ['Electronics', 'Consumer Goods'],
  },
  {
    id: 'factory-shenzhen',
    name: 'Shenzhen Tech Industries Ltd.',
    location: 'Shenzhen, China',
    capacity: '100,000 units/month',
    certifications: ['ISO 14001', 'BSCI', 'FDA'],
    specialties: ['Electronics', 'Machinery'],
  },
  {
    id: 'factory-guangzhou',
    name: 'Guangzhou Textiles Group',
    location: 'Guangzhou, China',
    capacity: '200,000 garments/month',
    certifications: ['ISO 9001', 'WRAP', 'OEKO-TEX'],
    specialties: ['Textiles', 'Apparel'],
  },
  {
    id: 'factory-yiwu',
    name: 'Yiwu Small Commodities Factory',
    location: 'Yiwu, China',
    capacity: '500,000 units/month',
    certifications: ['ISO 9001', 'FSC'],
    specialties: ['Toys', 'Hardware', 'Plastics'],
  },
];
