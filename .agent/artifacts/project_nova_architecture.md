# 🚀 ProjectNova - Architecture & Implementation Plan

## Project Overview
ProjectNova is a production-grade SaaS marketplace for selling defense-ready academic software projects with viva preparation materials. The platform features a three-tier pricing model, secure file delivery, admin panel, and comprehensive support system.

---

## Tech Stack

### Frontend & Backend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: React Context API + Zustand
- **Forms**: React Hook Form + Zod validation

### Database & ORM
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching**: Redis (future)

### Storage & Media
- **File Storage**: AWS S3
- **CDN**: CloudFront

### Payment
- **Gateway**: Razorpay

### Authentication
- **Auth**: NextAuth.js (JWT-based)
- **Security**: bcrypt, helmet, rate-limiting

### Email
- **Service**: Nodemailer + SendGrid

### DevOps
- **Hosting**: Vercel (Next.js) + AWS RDS (PostgreSQL)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry

---

## Architecture - MVC Pattern in Next.js

```
projectnova/
├── src/
│   ├── app/                          # Next.js App Router (Views)
│   │   ├── (public)/                 # Public routes
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx          # Project catalog
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Project detail
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   └── about/
│   │   ├── (protected)/              # Protected user routes
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── orders/
│   │   │   ├── downloads/
│   │   │   └── support/
│   │   ├── (admin)/                  # Admin routes
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       ├── projects/
│   │   │       ├── orders/
│   │   │       ├── users/
│   │   │       └── support/
│   │   ├── api/                      # API Routes (Controllers)
│   │   │   ├── auth/
│   │   │   ├── projects/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── downloads/
│   │   │   ├── support/
│   │   │   └── admin/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/                    # Reusable UI Components
│   │   ├── common/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── FeaturedProjects.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   └── Testimonials.tsx
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectGrid.tsx
│   │   │   ├── FilterSidebar.tsx
│   │   │   └── TierSelector.tsx
│   │   ├── cart/
│   │   ├── admin/
│   │   └── ui/                       # shadcn/ui components
│   ├── lib/                          # Business Logic & Utilities
│   │   ├── models/                   # Data Models (M)
│   │   │   ├── user.model.ts
│   │   │   ├── project.model.ts
│   │   │   ├── order.model.ts
│   │   │   └── support.model.ts
│   │   ├── services/                 # Business Logic Services
│   │   │   ├── auth.service.ts
│   │   │   ├── project.service.ts
│   │   │   ├── order.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── s3.service.ts
│   │   │   ├── email.service.ts
│   │   │   └── analytics.service.ts
│   │   ├── validations/              # Zod schemas
│   │   │   ├── auth.validation.ts
│   │   │   ├── project.validation.ts
│   │   │   └── order.validation.ts
│   │   ├── utils/
│   │   │   ├── db.ts                 # Prisma client
│   │   │   ├── auth.ts               # Auth helpers
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   └── hooks/                    # Custom React hooks
│   ├── middleware.ts                 # Auth & rate limiting middleware
│   ├── types/                        # TypeScript types
│   └── config/                       # Configuration files
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── images/
│   └── assets/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema (Prisma)

### Core Models

#### User
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  role          Role      @default(USER)
  emailVerified Boolean   @default(false)
  
  orders        Order[]
  cart          Cart?
  tickets       SupportTicket[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}
```

#### Project
```prisma
model Project {
  id            String   @id @default(cuid())
  slug          String   @unique
  title         String
  description   String   @db.Text
  category      Category
  techStack     String[]
  features      String[]
  
  tier1Price    Float
  tier1Features String[]
  tier1Files    Json     // S3 keys
  
  tier2Price    Float
  tier2Features String[]
  tier2Files    Json
  
  tier3Price    Float
  tier3Features String[]
  tier3Files    Json
  
  images        String[]
  isPublished   Boolean  @default(false)
  
  cartItems     CartItem[]
  orderItems    OrderItem[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum Category {
  AI
  WEB
  ML
  IOT
  DBMS
  MOBILE
}
```

#### Order
```prisma
model Order {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  
  orderNumber     String      @unique
  totalAmount     Float
  status          OrderStatus @default(PENDING)
  
  razorpayOrderId   String?
  razorpayPaymentId String?
  razorpaySignature String?
  
  items           OrderItem[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

enum OrderStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

#### OrderItem
```prisma
model OrderItem {
  id          String  @id @default(cuid())
  orderId     String
  order       Order   @relation(fields: [orderId], references: [id])
  
  projectId   String
  project     Project @relation(fields: [projectId], references: [id])
  
  tier        Int     // 1, 2, or 3
  price       Float
  
  downloads   Download[]
  
  createdAt   DateTime @default(now())
}
```

#### Download
```prisma
model Download {
  id            String    @id @default(cuid())
  orderItemId   String
  orderItem     OrderItem @relation(fields: [orderItemId], references: [id])
  
  downloadUrl   String
  expiresAt     DateTime
  
  createdAt     DateTime  @default(now())
}
```

#### Cart & CartItem
```prisma
model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id])
  
  items     CartItem[]
  
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String  @id @default(cuid())
  cartId    String
  cart      Cart    @relation(fields: [cartId], references: [id])
  
  projectId String
  project   Project @relation(fields: [projectId], references: [id])
  
  tier      Int
  
  createdAt DateTime @default(now())
}
```

#### SupportTicket
```prisma
model SupportTicket {
  id          String        @id @default(cuid())
  userId      String
  user        User          @relation(fields: [userId], references: [id])
  
  subject     String
  description String        @db.Text
  status      TicketStatus  @default(OPEN)
  priority    Priority      @default(MEDIUM)
  
  responses   TicketResponse[]
  attachments String[]
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  CLOSED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

---

## API Routes (Controllers)

### Public APIs
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/projects` - Get projects (with filters)
- `GET /api/projects/[slug]` - Get project details

### Protected User APIs
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/[id]` - Remove from cart
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `POST /api/payments/verify` - Verify Razorpay payment
- `GET /api/downloads/[orderItemId]` - Generate signed download URL
- `POST /api/support/tickets` - Create support ticket
- `GET /api/support/tickets` - Get user tickets

### Admin APIs
- `GET /api/admin/dashboard` - Admin analytics
- `POST /api/admin/projects` - Create project
- `PUT /api/admin/projects/[id]` - Update project
- `DELETE /api/admin/projects/[id]` - Delete project
- `GET /api/admin/orders` - Get all orders
- `POST /api/admin/orders/[id]/refund` - Process refund
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/[id]` - Update user role
- `GET /api/admin/support` - Get all tickets
- `POST /api/admin/support/[id]/respond` - Respond to ticket

---

## Security Implementation

### Authentication
- JWT tokens with 15-minute access token, 7-day refresh token
- HTTP-only cookies for refresh tokens
- bcrypt password hashing (10 rounds)
- Email verification required

### Authorization
- Role-based middleware
- Route protection in `middleware.ts`
- API route guards

### Data Protection
- Input validation with Zod
- SQL injection prevention (Prisma)
- XSS protection (React default + sanitization)
- CSRF tokens for state-changing operations
- Rate limiting (10 req/min for auth, 100 req/min for general)

### File Security
- S3 private buckets
- Signed URLs with 24-hour expiry
- Download attempt logging
- User ownership verification

---

## Performance Optimization

### Frontend
- Next.js Image optimization
- Lazy loading components
- Code splitting
- Skeleton loaders
- Debounced search

### Backend
- Database indexing on:
  - User.email
  - Project.slug
  - Order.orderNumber
  - Order.userId
- Query optimization with `select` and `include`
- Pagination (20 items per page)

### Caching (Future)
- Redis for:
  - Session storage
  - API response caching
  - Rate limiting data

---

## Development Phases

### Phase 1: Foundation (Week 1)
- [x] Project scaffolding
- [x] Database schema
- [x] Authentication system
- [x] Basic routing structure

### Phase 2: Core Features (Week 2-3)
- [ ] Public website (landing, catalog, project detail)
- [ ] Cart & checkout
- [ ] Payment integration
- [ ] Order management
- [ ] S3 file delivery

### Phase 3: Admin Panel (Week 4)
- [ ] Admin dashboard
- [ ] Project management
- [ ] Order management
- [ ] User management

### Phase 4: Support & Polish (Week 5)
- [ ] Support ticket system
- [ ] Email notifications
- [ ] Analytics
- [ ] SEO optimization

### Phase 5: Testing & Deployment (Week 6)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/projectnova"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""

# Razorpay
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""

# Email
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""

# Analytics
GOOGLE_ANALYTICS_ID=""
```

---

## Key Design Decisions

1. **MVC in Next.js Context**:
   - **Models**: Data models in `lib/models/` + Prisma schema
   - **Views**: React components in `app/` and `components/`
   - **Controllers**: API routes in `app/api/` + services in `lib/services/`

2. **Three-Tier Pricing**:
   - Stored as separate fields in Project model
   - Validated at checkout
   - Access controlled via OrderItem.tier

3. **File Delivery**:
   - S3 private bucket
   - Generate signed URLs on-demand
   - 24-hour expiry
   - Log all download attempts

4. **Admin RBAC**:
   - USER, ADMIN, SUPER_ADMIN roles
   - Middleware protection
   - Granular permissions in UI

5. **Support System**:
   - 24-hour SLA tracking
   - Email notifications on status change
   - File attachment support
   - Priority tagging

---

## Success Metrics

- Lighthouse score > 90
- Page load time < 2s
- 99.9% uptime
- Zero SQL injection vulnerabilities
- GDPR compliant
- Mobile responsive (all devices)
- Accessibility score > 90

---

This architecture ensures scalability, maintainability, and industry-standard code quality for ProjectNova SaaS marketplace.
