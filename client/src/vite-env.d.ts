/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_TRADE_NAME?: string;
  readonly VITE_LEGAL_NAME?: string;
  readonly VITE_PUBLIC_SITE_URL?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_BILLING_EMAIL?: string;
  readonly VITE_GRIEVANCE_EMAIL?: string;
  readonly VITE_SUPPORT_PHONE?: string;
  readonly VITE_SUPPORT_WHATSAPP?: string;
  readonly VITE_BUSINESS_ADDRESS?: string;
  readonly VITE_GRIEVANCE_OFFICER?: string;
  readonly VITE_GSTIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
