# ProjectNova - Backend

Node.js/Express backend API for ProjectNova.

## Setup

```bash
npm install
cp .env.example .env.development
npm run dev
```

## Directory Structure

```
backend/
├── app/
│   └── routes/           # API route handlers
│       ├── auth.js       # Authentication endpoints
│       ├── projects.js   # Projects endpoints
│       ├── cart.js       # Cart endpoints
│       ├── checkout.js   # Payment/checkout endpoints
│       ├── orders.js     # Orders endpoints
│       └── support.js    # Support tickets endpoints
├── config/               # Configuration files
│   ├── app.js            # Application config
│   ├── database.js       # Database config
│   ├── email.js          # SMTP config
│   └── payment.js        # Payment gateway config
├── scripts/              # Utility scripts
├── uploads/              # File uploads directory
├── main.js               # Main entry point
├── db.js                 # Database utilities
├── package.json
└── .env.development      # Environment variables
```

## Environment Variables

Create `.env.development`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/projectnova"
JWT_SECRET="your-secret-key"
JWT_EXPIRY="7d"
PORT=5000
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
```

## API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/projects` - All projects
- `GET /api/projects/:slug` - Project details
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add to cart
- `POST /api/checkout/create-order` - Create order
- `POST /api/checkout/verify-payment` - Verify payment
- `GET /api/orders` - Get user orders
- `GET /api/support/tickets` - Get support tickets
- `POST /api/support/tickets` - Create support ticket

## Development

```bash
npm run dev    # Run with file watching
npm run build  # Build TypeScript files
npm start      # Run production build
```

## Tech Stack

- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation
