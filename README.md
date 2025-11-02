# Blockbox

---

# Billing & Invoice Management System

A complete billing and invoice management system with inventory tracking and sales analysis.

## Features

- 🔐 User Authentication (Sign Up / Login)
- 📄 Invoice Generation
- 📊 Sales Analysis Dashboard
- 📦 Inventory Management
- 📈 History & Reports
- 💰 Billing System

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB URI and JWT secret

4. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Invoices
- GET `/api/invoices` - Get all invoices
- POST `/api/invoices` - Create new invoice
- GET `/api/invoices/:id` - Get invoice by ID
- PUT `/api/invoices/:id` - Update invoice
- DELETE `/api/invoices/:id` - Delete invoice

### Inventory
- GET `/api/inventory` - Get all inventory items
- POST `/api/inventory` - Add new item
- PUT `/api/inventory/:id` - Update item
- DELETE `/api/inventory/:id` - Delete item

### Sales Analysis
- GET `/api/sales/analytics` - Get sales analytics
- GET `/api/sales/history` - Get sales history

## Default Port
Server runs on port 3000 (or PORT from .env)