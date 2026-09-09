/**
 * Public business identity used on Razorpay-required pages.
 * Override via client/.env so the details match your KYC documents.
 */
export const COMPANY = {
  tradeName: import.meta.env.VITE_TRADE_NAME || 'SnapCut AI',
  legalName: import.meta.env.VITE_LEGAL_NAME || 'SnapCut AI',
  websiteUrl: import.meta.env.VITE_PUBLIC_SITE_URL || 'https://snapcut.ai',
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@snapcut.ai',
  billingEmail: import.meta.env.VITE_BILLING_EMAIL || 'billing@snapcut.ai',
  grievanceEmail: import.meta.env.VITE_GRIEVANCE_EMAIL || 'grievance@snapcut.ai',
  phone: import.meta.env.VITE_SUPPORT_PHONE || '+91 98765 43210',
  whatsapp: import.meta.env.VITE_SUPPORT_WHATSAPP || '+91 98765 43210',
  hours: 'Monday to Saturday, 10:00 AM – 7:00 PM IST (closed on Indian public holidays)',
  registeredAddress:
    import.meta.env.VITE_BUSINESS_ADDRESS ||
    'Registered Office: SnapCut AI, C/O Ayush Ranjan, India (set VITE_BUSINESS_ADDRESS in client/.env to your KYC address)',
  gstin: import.meta.env.VITE_GSTIN || '',
  grievanceOfficer: import.meta.env.VITE_GRIEVANCE_OFFICER || 'Ayush Ranjan',
  product: 'AI-powered online background removal (digital SaaS)',
  lastUpdated: '9 September 2026'
} as const;
