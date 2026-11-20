# StockFlow - Multi-Tenant Inventory Management System

StockFlow is a full-stack inventory management application designed to help businesses manage products, monitor stock levels, and track inventory performance through a centralized dashboard.

Built with React, Node.js, Express, PostgreSQL, and Prisma, StockFlow supports organization-based data isolation, secure authentication, product management, and configurable low-stock monitoring.

## Features
## Application Screenshots

### Login Page
![StockFlow Login](docs/screenshots/login.png)

### Inventory Dashboard
![StockFlow Dashboard](docs/screenshots/dashboard.png)

### Product Management
![StockFlow Products](docs/screenshots/products.png)



### Authentication and Organization Management
- Organization registration and user authentication.
- Secure password hashing with bcrypt.
- JWT-based authentication.
- Organization-scoped data access.

### Product Management
- Create, view, update, and delete products.
- Unique SKU validation within each organization.
- Product search by name or SKU.
- Pagination for inventory listings.
- Track quantities, cost prices, and selling prices.

### Inventory Dashboard
- Total product count.
- Total inventory quantity.
- Low-stock product monitoring.
- Configurable stock thresholds.
- Organization-specific inventory summaries.

### Organization Settings
- Configure the default low-stock threshold.
- Apply organization-level inventory settings.
- Support product-specific stock thresholds.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite |
| Styling | CSS |
| Routing | React Router |
| Icons | Lucide React |
| API Communication | Axios |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Authentication | JWT, bcrypt |
| API Documentation | Swagger UI |

## Project Structure

```text
Stockflow-mvp/
|-- backend/
|   |-- prisma/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- server.js
|   |-- package.json
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- services/
|   |-- package.json
|
|-- README.md
```

## Getting Started

### Prerequisites
- Node.js
- npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/Praveendane/Stockflow-mvp.git
cd Stockflow-mvp
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/stockflow?schema=public"
PORT=5000
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=1d
```

Replace the database credentials with your local PostgreSQL configuration.

Run the database migrations using the project's configured Prisma migration workflow, then start the backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5174`

### 4. API Documentation

Once the backend is running, access the interactive Swagger documentation:

`http://localhost:5000/docs`

## Security and Data Isolation

- Passwords are hashed before storage.
- Protected API endpoints require JWT authentication.
- Product and inventory queries are scoped to the authenticated organization.
- SKU uniqueness is enforced within an organization.
- Organization settings and dashboard summaries are organization-specific.

## Production Build

Run the following commands inside the frontend directory:

```bash
npm run lint
npm run build
```

## Project Status

**MVP implementation completed.**

The application has been exercised through browser-based workflows, including authentication, inventory management, dashboard calculations, settings, and organization data separation.

## Author

**Praveen Dane**

GitHub: https://github.com/Praveendane

Repository: https://github.com/Praveendane/Stockflow-mvp
