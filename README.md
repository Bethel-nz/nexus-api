# Agora API

A NestJS-based API for order management and real-time chat communication between users and administrators.

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- PostgreSQL
- Docker for local development and testing

## Quick Start

1. **Clone the repository**

```bash
git clone <repository-url>
cd agora-api
```

2. **Environment Setup**

```bash
# Copy the example environment file
cp .env.example .env

# Update the .env file with your configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agora?schema=public"
JWT_SECRET="your-secret-key"
PORT=3000
```

3. **Using Docker (Recommended)**

```bash
# Start PostgreSQL and the API
docker-compose up -d

# Apply database migrations
pnpm prisma migrate deploy
```

4. **Manual Setup**

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm prisma migrate deploy

# Start the development server
pnpm start:dev
```

## Testing

### Setup Test Database
```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Run migrations on test database
NODE_ENV=test pnpm prisma migrate deploy
```

### Run Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov
```

## API Documentation

API documentation is available in the `/docs` folder or click below for quick access:

- [POSTMAN_COLLECTION](./doc/CheckIt%20Api%20Doc.postman_collection.json) - Postman collection

## Project Structure

``` text
src/
├── modules/
│   ├── auth/       # Authentication
│   ├── chat/       # Chat functionality
│   ├── orders/     # Order management
│   └── users/      # User management
├── common/         # Shared utilities
├── prisma/        # Database schema and migrations
└── utils/         # Helper functions
```

## Database Schema

The project uses Prisma with PostgreSQL. Key models:

- User (Admin/Regular)
- Order (with status workflow)
- ChatRoom (linked to orders)
- Message (for chat history)
