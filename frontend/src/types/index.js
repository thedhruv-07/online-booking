/**
 * Centralized type definitions using JSDoc for JavaScript
 * These serve as documentation and IDE hints
 */

/** @typedef {import('react').ReactNode} ReactNode */
/** @typedef {import('react').ChangeEvent} ChangeEvent */
/** @typedef {import('react').FormEvent} FormEvent */

/**
 * @typedef {Object} User
 * @property {string} id - Unique identifier
 * @property {string} email - User email
 * @property {string} name - Full name
 * @property {string} role - user/admin
 * @property {string} status - verification status
 * @property {string} [phone] - Optional phone number
 * @property {string} [avatar] - Profile picture URL
 * @property {Date} createdAt - Account creation date
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user - Current user
 * @property {boolean} isAuthenticated - Auth status
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message
 */

/**
 * @typedef {Object} Service
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} basePrice
 */

/**
 * @typedef {Object} Location
 * @property {string} id
 * @property {string} country
 * @property {string} city
 * @property {string} address
 * @property {string} postalCode
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} material
 * @property {number} price
 */

/**
 * @typedef {Object} Factory
 * @property {string} id
 * @property {string} name
 * @property {string} location
 * @property {string} capacity
 * @property {string[]} certifications
 */

/**
 * @typedef {Object} Contact
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} company
 * @property {string} notes
 */

/**
 * @typedef {Object} AQLConfig
 * @property {string} inspectionLevel - General/ Special
 * @property {string} sampleSize - Sample size code letter
 * @property {Object} limits - Accept/Reject limits
 */

/**
 * @typedef {Object} UploadedFile
 * @property {string} id
 * @property {string} name
 * @property {string} url
 * @property {number} size
 * @property {string} type
 */

/**
 * @typedef {Object} BookingData
 * @property {Service} service
 * @property {Location} location
 * @property {Product} product
 * @property {UploadedFile[]} files
 * @property {Factory} factory
 * @property {Contact} contact
 * @property {AQLConfig} aql
 * @property {PaymentMethod} payment
 */

/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} userId
 * @property {BookingData} data
 * @property {string} status
 * @property {PaymentStatus} paymentStatus
 * @property {number} totalAmount
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} bookingId
 * @property {string} method - paypal/bank_transfer
 * @property {number} amount
 * @property {string} status
 * @property {string} transactionId
 */

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
