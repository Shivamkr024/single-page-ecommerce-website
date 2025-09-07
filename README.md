
# E-commerce SPA (Minimal)

Features:
- Backend: Node/Express, JWT auth, Items CRUD with filters, Cart APIs (cart stored by user, persists across logouts).
- Frontend: React + Vite SPA with Signup/Login, Items listing + filters, Cart page (add/remove/update).

## Quick Start

### 1) Backend
```bash
cd backend
npm install
npm run dev
# Server: http://localhost:4000
```

### 2) Frontend
```bash
cd ../frontend
npm install
npm run dev
# Vite will show a local URL (e.g., http://localhost:5173)
```

### Demo account
- Email: demo@shop.com
- Password: demo123

You can also Sign up with a new account.

---

## API Summary

- `POST /api/auth/signup` { email, password } -> { token, user }
- `POST /api/auth/login` { email, password } -> { token, user }
- `GET /api/items?minPrice=&maxPrice=&category=&q=`
- `POST /api/items` (auth) { name, price, category }
- `PUT /api/items/:id` (auth) { name?, price?, category? }
- `DELETE /api/items/:id` (auth)
- `GET /api/cart` (auth)
- `POST /api/cart/add` (auth) { itemId, qty? }
- `POST /api/cart/remove` (auth) { itemId }
- `PATCH /api/cart/update` (auth) { itemId, qty }

> This is an in-memory store intended for assignment/demo purposes.
> To persist across server restarts, swap in a DB (MongoDB, SQLite, Postgres).

