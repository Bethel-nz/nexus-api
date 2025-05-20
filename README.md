# Nexus API - WIP

A service marketplace backend where users can place orders for services and communicate with service providers in real-time.

## Core Features

- **Order Management**: Create and manage service orders with status workflow
- **Real-time Chat**: Dedicated chat rooms for each order
- **User System**: Role-based access with JWT authentication
- **Performance**: Redis caching, queue system, and metrics

## Tech Stack

- **Backend**: NestJS, PostgreSQL, Prisma
- **Real-time**: Socket.io, Redis, BullMQ
- **Monitoring**: Prometheus, Grafana
- **Documentation**: Swagger/OpenAPI

## Quick Start

```bash
# Clone and install
git clone Bethel-nz/nexus-api
cd nexus-api
pnpm install

# Setup environment
cp .env.example .env

# Start services
docker-compose up -d
pnpm prisma migrate deploy

# Start development server
pnpm start:dev
```

## Documentation

- API Docs: `http://localhost:3000/api-docs`
- Metrics: `http://localhost:3000/metrics`
- Grafana: `http://localhost:3001` (admin/admin)

## Roadmap

### v1.1.0 (Planned)

- [ ] Email notifications
- [ ] File attachments in orders
- [ ] Payment integration
- [ ] Service provider ratings
- [ ] Advanced search filters
- [ ] Analytics dashboard

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Features

### Order Management

- Users can create service orders with detailed specifications
- Order workflow: REVIEW → PROCESSING → COMPLETED
- Admins can manage and update order statuses

### Real-time Communication

- Each order has a dedicated chat room
- Real-time messaging between clients and service providers
- Instant notifications for new messages and status updates

### User System

- Role-based access control (Admin/Regular users)
- JWT-based authentication
- Secure password handling

### Performance & Reliability

- Redis caching for fast responses
- Queue-based notification system
- Real-time updates via WebSockets
- Prometheus metrics and Grafana dashboards

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- PostgreSQL
- Docker for local development and testing
- Redis (for caching and queue management)

## Testing

### Setup Test Database

```bash
# Start test database
docker-compose up -d

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

- Swagger UI available at: `http://localhost:3000/api-docs`
- [POSTMAN_COLLECTION](./doc/CheckIt%20Api%20Doc.postman_collection.json) - Postman collection

## Monitoring & Observability

### Prometheus Metrics

Metrics endpoint available at: `http://localhost:3000/metrics`

Key metrics include:

- HTTP request rates and latencies
- Queue processing metrics
- Cache hit/miss ratios
- System resources

### Grafana Dashboards

Access Grafana at: `http://localhost:3001`

- Default credentials: admin/admin
- Pre-configured dashboards for:
  - API performance monitoring
  - Queue metrics
  - Cache performance
  - System health

## License

[MIT](LICENSE)
