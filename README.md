# 🚀 ProjectNova - SaaS Marketplace for Academic Projects

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192)](https://www.postgresql.org/)

A production-grade SaaS marketplace for selling defense-ready academic software projects with viva preparation materials. Features a three-tier pricing model, secure file delivery, payment integration, admin panel, and comprehensive support system.

## ✨ Features

### 🌐 Public Website
- **Landing Page** with hero section, featured projects, how it works, testimonials, and FAQ
- **Project Catalog** with advanced filtering and search
- **Project Detail Pages** with tier-based pricing
- Premium dark mode UI with glassmorphism effects
- Fully responsive design
- SEO optimized with SSR

### 🔐 Authentication & Users
- Email/password registration and login
- JWT-based auth with NextAuth.js
- Email verification
- Password reset functionality
- User profile management
- Order history tracking

### 🛒 Shopping & Payments
- Shopping cart with tier selection
- Razorpay payment integration
- Secure checkout process
- Order management
- Email confirmations
- 7-day refund policy

### 📦 File Delivery
- AWS S3 secure file storage
- Signed download URLs (24-hour expiry)
- Download attempt logging
- Tier-based access control

### ⚙️ Admin Panel (RBAC)
- Dashboard with analytics
- Project management (CRUD)
- Order management & refunds
- User management
- Support ticket system
- Sales reports

### 💬 Support System
- Ticket creation with file attachments
- Status tracking (Open/In Progress/Closed)
- Priority levels
- Email notifications
- 24-hour SLA tracking

## 🛠️ Tech Stack

### Frontend & Backend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI + shadcn/ui

### Database & ORM
- **Database**: PostgreSQL
- **ORM**: Prisma

### Storage & Payments
- **File Storage**: AWS S3
- **Payment Gateway**: Razorpay

### Authentication
- **Auth**: NextAuth.js
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- AWS account (for S3)
- Razorpay account

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ecommerse-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/projectnova"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="projectnova-files"

# Razorpay
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
# Push schema to database
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📂 Project Structure

```
projectnova/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (public)/         # Public routes
│   │   ├── (protected)/      # Protected user routes
│   │   ├── (admin)/          # Admin routes
│   │   ├── api/              # API routes
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Homepage
│   ├── components/
│   │   ├── common/           # Shared components
│   │   ├── landing/          # Landing page sections
│   │   ├── ui/               # UI components
│   │   └── providers.tsx     # Context providers
│   ├── lib/
│   │   ├── services/         # Business logic
│   │   ├── validations/      # Zod schemas
│   │   ├── utils.ts          # Utilities
│   │   ├── db.ts             # Prisma client
│   │   └── constants.ts      # Constants
│   └── hooks/                # Custom React hooks
├── public/                   # Static assets
├── .env.example              # Environment template
├── next.config.js            # Next.js config
├── tailwind.config.ts        # Tailwind config
└── package.json
```

## 🗄️ Database Schema

The database follows a normalized structure with these main models:

- **User** - User accounts with role-based access
- **Project** - Projects with three pricing tiers
- **Cart** & **CartItem** - Shopping cart
- **Order** & **OrderItem** - Order management
- **Download** - File delivery tracking
- **SupportTicket** & **TicketResponse** - Support system
- **Analytics** - Event tracking

## 🔒 Security Features

- JWT authentication with HTTP-only cookies
- bcrypt password hashing (10 rounds)
- SQL injection prevention (Prisma)
- XSS protection
- CSRF tokens
- Rate limiting
- S3 signed URLs for secure downloads
- Input validation with Zod

## 🎨 Design System

The application uses a premium dark mode design with:
- **Glassmorphism effects** for cards and navigation
- **Custom gradient utilities** for CTAs
- **Floating orb animations** for depth
- **Micro-interactions** on hover states
- **Consistent spacing** and typography
- **Responsive breakpoints** for all devices

## 📱 API Routes

### Public APIs
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/projects` - List projects
- `GET /api/projects/[slug]` - Project details

### Protected APIs
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `POST /api/orders` - Create order
- `POST /api/payments/verify` - Verify payment
- `GET /api/downloads/[id]` - Generate download URL

### Admin APIs
- `GET /api/admin/dashboard` - Analytics
- `POST /api/admin/projects` - Create project
- `PUT /api/admin/projects/[id]` - Update project
- `GET /api/admin/orders` - All orders
- `POST /api/admin/orders/[id]/refund` - Process refund

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 📈 Performance

- Lighthouse score > 90
- Image optimization with Next.js
- Code splitting
- Lazy loading
- Skeleton loaders
- Database query optimization

## 🤝 Contributing

This is a proprietary project. Contact the maintainer for contribution guidelines.

## 📄 License

Proprietary - All rights reserved

## 📧 Support

For support, email support@projectnova.com or create a support ticket.

## 🙏 Acknowledgments

- Built with Next.js, Tailwind CSS, and Prisma
- UI components from shadcn/ui
- Icons from Lucide React

---

**ProjectNova** - Empowering students with defense-ready software projects 🚀
