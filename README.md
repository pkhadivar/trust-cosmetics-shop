# Trust Cosmetics Shop

## Project Overview & Purpose
Trust Cosmetics Shop is a full-featured e-commerce platform built with Next.js 13+ for selling cosmetic products. The application includes user authentication, product management, shopping cart functionality, order processing, and admin dashboard capabilities.

## Tech Stack
| Technology | Version/Details |
|------------|----------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Authentication | NextAuth.js |
| State Management | Redux Toolkit |
| Styling | Tailwind CSS |
| Testing | Jest |

## Annotated Folder Structure
```text
.
├── src/                     # Source code root
│   ├── app/                 # Next.js app router pages and routes
│   ├── components/          # React components
│   ├── lib/                 # Business logic and utilities
│   ├── store/               # Redux store configuration
│   ├── actions/             # Server actions for API interactions
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── middleware.ts        # Next.js middleware
├── prisma/                  # Prisma database schema and client
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
└── next.config.mjs          # Next.js configuration

Modules/Package Responsibilities
Authentication: src/components/NextAuthProvider.tsx, src/lib/session.ts, src/middleware.ts

Product Management: src/lib/products.ts, src/actions/product.ts

Shopping Cart: src/store/cartSlice.ts, src/components/add-to-cart-action.tsx

User Profile: src/app/profile/, src/actions/order.ts, src/actions/wishlist.ts

Admin Panel: src/app/admin/ with nested routes for categories, products, orders, reviews, settings

Setup & Installation
Install dependencies: npm install

Set environment variables in .env.local

Run database migration: npx prisma migrate dev

Start development server: npm run dev

How to Run Locally
Development: npm run dev

Production build: npm run build

Production start: npm run start