/**
 * Shared Pricing Logic - Single Source of Truth
 * Pure ESM (compatible with Vite and Node 14.8+ dynamic import)
 */

export const COVERED_COUNTRIES = ["IN", "BD", "KH", "ID", "CN", "MY", "KR", "PK", "TW", "LK", "TH", "VN"];

export const services = [
  {
    id: 'pre-shipment',
    name: 'Pre-Shipment Inspection',
    description: 'Final inspection before goods are shipped',
    pricing: { covered: 268, other: 368 },
    category: 'Inspection',
  },
  {
    id: 'during-production',
    name: 'During Production Inspection',
    description: 'Monitor quality during the manufacturing process',
    pricing: { covered: 268, other: 368 },
    category: 'Inspection',
  },
  {
    id: 'container-loading',
    name: 'Container-Loading Supervision',
    description: 'Supervise loading and verify container integrity',
    pricing: { covered: 268, other: 368 },
    category: 'Inspection',
  },
  {
    id: 'audit',
    name: 'Factory Audit',
    description: 'Comprehensive evaluation of factory capabilities',
    pricing: { covered: 268, other: 368 },
    category: 'Audit',
  },
  {
    id: 'social-audit',
    name: 'Social Audit',
    description: 'Evaluation of social and ethical compliance at the facility',
    pricing: { covered: 268, other: 368 },
    category: 'Audit',
  },
  // Inspection+ Services
  {
    id: 'be-your-engineer',
    name: 'Be Your Engineer',
    description: 'Expert engineering support and guidance for your products',
    pricing: { covered: 599, other: 799 },
    category: 'Inspection+',
  },
  {
    id: 'be-your-qc',
    name: 'Be Your QC In Factory',
    description: 'Dedicated quality control representation directly at the factory',
    pricing: { covered: 499, other: 699 },
    category: 'Inspection+',
  },
  {
    id: 'construction-check',
    name: 'Construction Check In Laboratory',
    description: 'Laboratory verification of product construction and materials',
    pricing: { covered: 399, other: 499 },
    category: 'Inspection+',
  },
  {
    id: 'heat-fire-testing',
    name: 'Resistance To Heat And Fire Testing In Laboratory',
    description: 'Specialized safety testing for heat and fire resistance',
    pricing: { covered: 899, other: 1099 },
    category: 'Inspection+',
  },
  {
    id: 'prototype-psi',
    name: 'Product Prototype Testing In Laboratory + Pre-Shipment Inspection',
    description: 'Comprehensive package combining prototype testing and final inspection',
    pricing: { covered: 999, other: 1299 },
    category: 'Inspection+',
    bundleIncludes: ['pre-shipment'],
  }
];

export const bundles = [
  {
    id: 'inspection-plus-standard',
    name: 'Inspection+ Standard Bundle',
    includes: ['pre-shipment', 'audit'],
    discount: 50
  },
  {
    id: 'full-qc-package',
    name: 'One Stop Service',
    includes: ['pre-shipment', 'during-production', 'audit'],
    discount: 100
  }
];

/**
 * Logic to calculate final price based on selected services and country
 */
export const calculateFinalPrice = (selectedIds = [], countryCode = 'US') => {
  const isoCountry = (typeof countryCode === 'string' && countryCode.length === 2) 
    ? countryCode.toUpperCase() 
    : 'US';

  const region = COVERED_COUNTRIES.includes(isoCountry) ? 'covered' : 'other';
  
  let basePrice = 0;
  selectedIds.forEach(id => {
    const service = services.find(s => s.id === id);
    if (service) {
      basePrice += service.pricing[region];
    }
  });

  let totalDiscount = 0;
  bundles.forEach(bundle => {
    const hasAll = bundle.includes.every(id => selectedIds.includes(id));
    if (hasAll) {
      totalDiscount += bundle.discount;
    }
  });

  return {
    selected: selectedIds,
    country: isoCountry,
    region,
    basePrice,
    discount: totalDiscount,
    totalAmount: Math.max(0, basePrice - totalDiscount),
    currency: 'USD'
  };
};
