# ProjectNova - Frontend 🎨

A modern, high-performance React application built with Vite and Tailwind CSS. Featuring a premium dark-themed UI, framer-motion animations, and seamless Razorpay integration.

## 🏗️ Tech Stack

### Framework & Language
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** React Router v6

### Styling & Animations
- **Styling:** Tailwind CSS (Custom Design System)
- **Animations:** Framer Motion
- **Icons:** Lucide React

### State & API
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Form Handling:** Controlled components with Zod validation patterns

---

## ✨ Features

- **Premium UI:** Custom dark-themed design system with glassmorphism and subtle micro-animations.
- **Dynamic Pricing:** 4-tier pricing system (Basic, Pro, Elite, Enterprise) with real-time calculations.
- **Project Catalog:** Advanced project discovery with filtering and slugs.
- **Razorpay Integration:** Secure frontend checkout flow with signature verification feedback.
- **User Dashboard:** Comprehensive hub for tracking project requests, orders, and support tickets.
- **Admin Panel:** Specialized interface for managing custom project requests and notifications.

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Config
Create a `.env` file in the root of the frontend folder:
```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Running the App

```bash
# Development
npm run dev

# Build for Production
npm run build

# Preview Production Build
npm run preview
```

---

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── layouts/          # Page layouts (Navbar, Footer)
│   ├── store/            # Zustand global state
│   ├── services/         # API service layers
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   └── assets/           # Global styles & images
├── public/               # Static assets
└── tailwind.config.js    # Design system tokens
```
