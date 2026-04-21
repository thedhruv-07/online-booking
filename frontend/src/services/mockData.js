/**
 * Mock Data and Handlers for API Simulation
 */

const MOCK_USER = {
  id: 'user_123',
  name: 'Dhruv Kumar',
  email: 'dhruvsingh200420@gmail.com',
  role: 'user',
  avatar: 'https://ui-avatars.com/api/?name=Dhruv+Kumar',
  phone: '9354567496',
  createdAt: new Date().toISOString(),
};

const MOCK_ADMIN = {
  id: 'admin_123',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  avatar: 'https://ui-avatars.com/api/?name=Admin+User',
  createdAt: new Date().toISOString(),
};

const mockRoutes = {
  // Auth Routes
  '/auth/login': (data) => {
    return {
      user: data.email === 'admin@example.com' ? MOCK_ADMIN : MOCK_USER,
      token: 'mock_jwt_token_' + Date.now(),
    };
  },
  '/auth/signup': (data) => {
    return {
      user: { ...MOCK_USER, ...data, id: 'user_' + Math.random().toString(36).substr(2, 9) },
      token: 'mock_jwt_token_' + Date.now(),
    };
  },
  '/auth/profile': () => MOCK_USER,
  '/auth/verify-email': () => ({ success: true }),
  '/auth/logout': () => ({ success: true }),
  '/auth/refresh': () => ({ token: 'mock_jwt_token_refreshed' }),

  // Booking Routes
  '/bookings': () => [
    {
      id: 'book_1',
      service: 'Pre-shipment Inspection',
      location: 'Shenzhen, China',
      status: 'pending',
      date: '2024-05-15',
    },
    {
      id: 'book_2',
      service: 'Factory Audit',
      location: 'Vinh Phuc, Vietnam',
      status: 'completed',
      date: '2024-04-10',
    }
  ],
  '/bookings/create': (data) => ({
    id: 'book_' + Math.random().toString(36).substr(2, 9),
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }),

  // Payment Routes
  '/payments/create-intent': () => ({
    clientSecret: 'mock_stripe_secret_' + Math.random().toString(36).substr(2, 9),
    amount: 29900,
  }),

  // Upload Routes
  '/upload': () => ({
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400',
    id: 'file_' + Math.random().toString(36).substr(2, 9),
  }),

  // Admin Routes
  '/admin/stats': () => ({
    totalUsers: 1234,
    totalBookings: 567,
    pendingApprovals: 23,
    revenue: 45670,
    growth: { users: 12, bookings: 8, revenue: 15 },
  }),
  '/admin/users': () => [
    { id: 'user_1', name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', joined: '2025-01-15' },
    { id: 'user_2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', joined: '2025-02-20' },
    { id: 'user_3', name: 'Bob Wilson', email: 'admin@example.com', role: 'admin', status: 'active', joined: '2024-11-10' },
    { id: 'user_4', name: 'Alice Brown', email: 'alice@example.com', role: 'user', status: 'pending', joined: '2025-04-01' },
    { id: 'user_5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'user', status: 'suspended', joined: '2025-03-05' },
  ],
  '/admin/bookings': () => [
    { id: 'BK-001', user: 'john@example.com', service: 'Pre-Production Inspection', status: 'confirmed', date: '2025-04-10', amount: 299 },
    { id: 'BK-002', user: 'jane@example.com', service: 'During Production Inspection', status: 'pending', date: '2025-04-09', amount: 399 },
    { id: 'BK-003', user: 'admin@example.com', service: 'Pre-Shipment Inspection', status: 'in_progress', date: '2025-04-08', amount: 499 },
    { id: 'BK-004', user: 'alice@example.com', service: 'Factory Audit', status: 'cancelled', date: '2025-04-05', amount: 799 },
    { id: 'BK-005', user: 'charlie@example.com', service: 'Pre-Production Inspection', status: 'completed', date: '2025-04-01', amount: 299 },
  ],
  '/admin/payments': () => [
    { id: 'PAY-001', bookingId: 'BK-001', user: 'john@example.com', method: 'paypal', amount: 299, status: 'paid', date: '2025-04-10' },
    { id: 'PAY-002', bookingId: 'BK-002', user: 'jane@example.com', method: 'bank_transfer', amount: 399, status: 'pending', date: '2025-04-09' },
    { id: 'PAY-003', bookingId: 'BK-003', user: 'admin@example.com', method: 'paypal', amount: 499, status: 'paid', date: '2025-04-08' },
    { id: 'PAY-004', bookingId: 'BK-004', user: 'alice@example.com', method: 'bank_transfer', amount: 799, status: 'failed', date: '2025-04-05' },
  ],
};



/**
 * Simulates an API call delay
 */
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Handle mock request
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {any} data - Request body
 * @returns {Promise<any>} Mock response
 */
export const handleMockRequest = async (method, endpoint, data) => {
  console.log(`[Mock API] ${method} ${endpoint}`, data || '');
  
  await delay(800); // Realistic latency

  // Find matching route
  const handler = mockRoutes[endpoint];
  
  if (handler) {
    return handler(data);
  }

  // Fallback for simple GET requests that might have query params
  const baseEndpoint = endpoint.split('?')[0];
  if (mockRoutes[baseEndpoint]) {
    return mockRoutes[baseEndpoint](data);
  }

  throw new Error(`Mock handler for ${endpoint} not found`);
};
