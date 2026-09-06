# SnapCut AI — Production-Ready AI Background Removal SaaS

<div align="center">
  <img src="client/public/logo.png" width="160" alt="SnapCut AI Logo" />
  <h3>Remove Backgrounds in One Click</h3>
  <p>Production-grade AI-powered image background removal web application built with React, Node.js, Express, Supabase PostgreSQL, n8n Cloud, Cloudinary, and Razorpay.</p>
</div>

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Architecture & Data Flow](#2-architecture--data-flow)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Prerequisites & Zero-Config Mode](#5-prerequisites--zero-config-mode)
6. [Environment Variables](#6-environment-variables)
7. [Supabase & Database Setup](#7-supabase--database-setup)
8. [Cloudinary Storage & Asset Retention](#8-cloudinary-storage--asset-retention)
9. [n8n Cloud Automation Integration](#9-n8n-cloud-automation-integration)
10. [Razorpay Payment Gateway Integration](#10-razorpay-payment-gateway-integration)
11. [Running Locally](#11-running-locally)
12. [Automated Testing](#12-automated-testing)
13. [Production Deployment](#13-production-deployment)
14. [Security & Compliance](#14-security--compliance)
15. [Troubleshooting & FAQ](#15-troubleshooting--faq)

---

## 1. Product Overview

**SnapCut AI** delivers instant, pixel-perfect image background removal for e-commerce merchants, social media creators, graphic designers, marketers, and small businesses.

### Core Workflow
$$\text{UPLOAD} \longrightarrow \text{REMOVE BACKGROUND} \longrightarrow \text{AI PROCESSING} \longrightarrow \text{PREVIEW} \longrightarrow \text{DOWNLOAD}$$

### Key Value Propositions
- **One-Click Operation**: Drag & drop any JPG, PNG, or WEBP up to 10 MB.
- **Fast AI Segmentation**: Subject detection with fine contour and alpha extraction in seconds.
- **Transparent Output**: Instant inspection on an interactive before/after split slider over a dark navy checkerboard.
- **Privacy First**: Strict **24-hour temporary retention policy** with automated asset expiration.
- **Razorpay Integration**: Flexible subscription plans (Free, Pro, Business) and one-time credit top-up packages with instant activation.

---

## 2. Architecture & Data Flow

```
                ┌──────────────────────────────────┐
                │          React Frontend          │
                │        (Vite + TypeScript)       │
                └────────────────┬─────────────────┘
                                 │ HTTPS REST API
                                 ▼
                ┌──────────────────────────────────┐
                │       Node.js + Express API      │
                │       (Service Abstraction)      │
                └────────────────┬─────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
    Supabase /              n8n Cloud               Razorpay
    PostgreSQL              Automation              Payments
  (Auth & Storage)       (Orchestration)       (Orders & Webhooks)
                                 │
                                 ▼
                        Background Removal
                              AI API
                        (ClipDrop / rembg)
                                 │
                                 ▼
                            Cloudinary
                       (Temporary Storage)
```

---

## 3. Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v6, Tailwind CSS (SnapCut dark navy theme: `#050816` + cyan-to-magenta gradient), Lucide React, Axios. *(Strictly NO Next.js)*
- **Backend**: Node.js, Express, TypeScript, Helmet, CORS, Multer (in-memory buffer parsing), Zod, Express Rate Limit, Crypto (HMAC SHA-256 verification).
- **Database & Auth**: PostgreSQL via Supabase with Row Level Security (RLS) policies and automated signup triggers.
- **Automation**: n8n Cloud managed automation workflow with authenticated secret tokens and callbacks. *(Zero self-hosted Docker)*
- **Image Storage**: Cloudinary temporary asset staging with lifecycle retention tags.
- **AI Processing**: Service abstraction supporting ClipDrop, Remove.bg, or custom AI endpoints, with offline simulation fallback.
- **Payments**: Razorpay Orders, HMAC signature verification, and idempotent webhook listeners.

---

## 4. Project Structure

```
snapcut-ai/
├── client/                     # React Single Page Application
│   ├── public/
│   │   ├── logo.png            # Official SnapCut AI Logo
│   │   └── robots.txt
│   ├── src/
│   │   ├── api/                # Typed Axios API client
│   │   ├── components/
│   │   │   ├── ui/             # Button, Card, Badge, Input, Modal
│   │   │   ├── layout/         # Navbar, Footer, Logo
│   │   │   ├── upload/         # UploadDropzone (10MB validation)
│   │   │   ├── processing/     # ProcessingStatus (glowing status animation)
│   │   │   ├── result/         # BeforeAfterViewer, DownloadAction
│   │   │   ├── dashboard/      # UsageCard, RecentJobsList
│   │   │   └── pricing/        # PlanCard, RazorpayCheckoutModal
│   │   ├── contexts/           # AuthContext, ToastContext
│   │   ├── pages/              # Landing, RemoveBg, Dashboard, History, Billing, Settings, Admin, etc.
│   │   └── App.tsx             # React Router v6 tree
│   ├── tailwind.config.js      # Visual identity tokens
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # Zod environment parsing & plan definitions
│   │   ├── controllers/        # JobController, PaymentController, UserController, AdminController
│   │   ├── database/           # Supabase client & transactional datastore
│   │   ├── integrations/
│   │   │   ├── background-removal/ # BackgroundRemovalService (ClipDrop / Mock)
│   │   │   ├── cloudinary/         # CloudinaryService (temporary storage & cleanup)
│   │   │   ├── n8n/                # N8nService (authenticated webhook triggers & callbacks)
│   │   │   └── razorpay/           # RazorpayService (orders, HMAC verification, webhooks)
│   │   ├── middleware/         # requireAuth, requireAdmin, rateLimiter, errorHandler
│   │   ├── routes/             # REST endpoints (/api/...)
│   │   ├── services/           # JobService, UsageService, SubscriptionService
│   │   ├── utils/              # Cryptographic HMAC verification, logger
│   │   └── app.ts              # Express application setup
│   ├── tests/                  # Jest test suite (unit & integration)
│   └── package.json
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Complete PostgreSQL schema, RLS & triggers
│
├── n8n/
│   └── workflows/
│       └── snapcut_ai_workflow.json # Ready-to-import n8n Cloud workflow
│
├── .env.example
├── README.md
└── package.json
```

---

## 5. Prerequisites & Zero-Config Mode

SnapCut AI features an **out-of-the-box development mode**:
- If Supabase, Cloudinary, or Razorpay credentials are not yet configured in `.env`, the application automatically activates high-fidelity local service emulators.
- The backend serves a local transactional datastore and generates clean transparent PNG assets for test files.
- Razorpay payments can be tested seamlessly via test keys or local test checkout.
- Admin dashboard access is ready out of the box with the **Demo Admin** profile.

---

## 6. Environment Variables

Create `.env` inside `server/` (or root) based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# n8n Cloud
N8N_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/snapcut-remove-bg
N8N_WEBHOOK_SECRET=your-secret-token

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
IMAGE_RETENTION_SECONDS=86400

# AI Background Removal API
BACKGROUND_REMOVAL_PROVIDER=clipdrop
BACKGROUND_REMOVAL_API_KEY=your-clipdrop-key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_SECRET=YourKeySecret
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecret
```

---

## 7. Supabase & Database Setup

1. Create a new project in [Supabase](https://supabase.com).
2. Navigate to the **SQL Editor**.
3. Copy and run `supabase/migrations/001_initial_schema.sql`.
4. The migration automatically:
   - Sets up `profiles`, `processing_jobs`, `usage`, `credits`, `subscriptions`, `payments`, and `webhook_events` tables.
   - Creates query indexes on `user_id`, `status`, and `created_at`.
   - Configures Row Level Security (RLS) policies.
   - Creates the `handle_new_user()` trigger to allocate 5 free starter credits on signup.

---

## 8. Cloudinary Storage & Asset Retention

1. Register an account on [Cloudinary](https://cloudinary.com).
2. Retrieve your `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
3. Assets are uploaded under `snapcut/temp/originals` and `snapcut/temp/results` with `retention_86400s` tags.
4. Auto-expiration guarantees user image privacy in compliance with our 24-hour retention commitment.

---

## 9. n8n Cloud Automation Integration

1. In your **n8n Cloud** dashboard (`*.app.n8n.cloud`), navigate to **Workflows → Import from File**.
2. Select `n8n/workflows/snapcut_ai_workflow.json`.
3. Set the credential environment variables in n8n Cloud:
   - `N8N_WEBHOOK_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `BACKEND_URL`
4. The workflow securely receives the image, executes the AI provider, uploads the transparent PNG to Cloudinary, and issues an authenticated callback to `POST /api/jobs/n8n-callback`.

---

## 10. Razorpay Payment Gateway Integration

1. Generate Test API Keys from the **Razorpay Dashboard → Settings → API Keys**.
2. Configure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
3. Configure a Webhook pointing to `https://your-backend.com/api/payments/webhook` with the secret `RAZORPAY_WEBHOOK_SECRET` and events:
   - `payment.captured`
   - `subscription.cancelled`
4. Cryptographic validation enforces HMAC-SHA256 signatures server-side:
   $$\text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{secret}) == \text{signature}$$

---

## 11. Running Locally

### Step 1: Install Dependencies
From the repository root:
```bash
npm install
```

### Step 2: Start Backend Server
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### Step 3: Start React Client
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 12. Automated Testing

Run the comprehensive unit and integration test suite:
```bash
cd server
npm test
```

Verifies:
- Razorpay HMAC-SHA256 signature verification and tamper detection.
- Usage limits, credit balance reservation, and automatic error refunds.
- REST API health, rate limiting, and admin authorization guards.

---

## 13. Production Deployment

### Frontend (React / Vite)
- Deploy to **Vercel** or **Netlify**:
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variables: `VITE_API_BASE_URL=https://api.yourdomain.com/api`

### Backend (Node.js / Express)
- Deploy to **Render**, **Railway**, or **Fly.io**:
  - Build command: `npm run build`
  - Start command: `npm run start`

---

## 14. Security & Compliance

- **No Secrets in Client**: API secrets and webhook keys are kept strictly on the server.
- **Rate Limiting**: Protects expensive AI endpoints and prevents quota abuse.
- **Idempotency**: Razorpay and n8n webhooks use unique event deduplication.
- **WCAG 2.1 AA**: Accessible contrast, keyboard navigation, and screen-reader labels.
- **Strict CORS**: Restricts access to authorized frontend origins in production.

---

## 15. Troubleshooting & FAQ

- **Port already in use**: Adjust `PORT=5001` in `.env`.
- **Image rejected**: Ensure file size is under 10 MB and format is JPG, PNG, or WEBP.
- **Missing Razorpay modal**: If testing in local development without active keys, the system automatically uses the high-fidelity test checkout simulator.
