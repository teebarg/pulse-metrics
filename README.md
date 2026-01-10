# Pulse Metrics

<div align="center">

**Real-time analytics platform for e-commerce stores**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

## Overview

Pulse Metrics is a comprehensive, real-time analytics platform designed specifically for e-commerce businesses. Track visitors, monitor sales, analyze conversions, and gain actionable insights with beautiful dashboards and powerful analytics tools.

### Key Features

- 🚀 **Real-time Analytics** - See what's happening on your store right now
- 📊 **Beautiful Dashboards** - Intuitive, easy-to-understand visualizations
- 🎯 **Event Tracking** - Track custom events with a simple SDK
- 🔌 **Multiple SDKs** - Support for React, Vue, and vanilla JavaScript
- ⚡ **High Performance** - Built with Hono for ultra-fast API responses
- 🔐 **Secure** - Enterprise-grade authentication and authorization
- 📱 **Responsive** - Works seamlessly on desktop and mobile
- 🔄 **WebSocket Support** - Real-time updates without polling

## Architecture

This is a monorepo containing:

```
pulse-metrics/
├── apps/              # Main applications
│   ├── api/          # Backend REST API (Hono + TypeScript)
│   └── web/          # Frontend dashboard (TanStack Start + React)
│
├── packages/         # Reusable SDK packages
│   ├── sdk/         # Vanilla JavaScript SDK
│   ├── react/       # React SDK with hooks
│   ├── vue/         # Vue 3 SDK
│   └── types.ts     # Shared TypeScript types
│
├── docker-compose.yml # Infrastructure services
└── Makefile         # Common development tasks
```

## Quick Start

### Prerequisites

- **Node.js** 20+ and **pnpm** (package manager)
- **Docker** and **Docker Compose** (for local development)
- **PostgreSQL** 18+ with **pgvector** extension
- **Redis** (for caching and real-time features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/pulse-metrics.git
   cd pulse-metrics
   ```

2. **Start infrastructure services**:
   ```bash
   docker compose up -d
   ```
   
   This starts:
   - PostgreSQL (port 7064)
   - Redis (port 7066)
   - Traefik (reverse proxy, port 7060)
   - Adminer (database GUI, port 7065)
   - RedisInsight (Redis GUI, port 7067)

3. **Install dependencies**:
   ```bash
   # Install API dependencies
   cd apps/api
   pnpm install

   # Install Web dependencies
   cd ../web
   pnpm install

   # Install package dependencies (if developing SDKs)
   cd ../../packages/sdk
   pnpm install
   cd ../react
   pnpm install
   cd ../vue
   pnpm install
   ```

4. **Configure environment variables**:
   
   **API** (`apps/api/.env`):
   ```env
   API_PORT=8787
   DATABASE_URL=postgresql://admin:password@localhost:7064/pm
   REDIS_URL=redis://localhost:7066
   BETTER_AUTH_SECRET=your-secret-key-here
   ```
   
   **Web** (`apps/web/.env`):
   ```env
   VITE_API_URL=http://localhost:8787
   BETTER_AUTH_SECRET=your-secret-key-here
   BETTER_AUTH_URL=http://localhost:5174
   ```

5. **Run database migrations**:
   ```bash
   cd apps/api
   pnpm db:migrate
   ```

6. **Start development servers**:
   
   Option 1: Using Makefile (runs both in parallel):
   ```bash
   make dev
   ```
   
   Option 2: Manual (in separate terminals):
   ```bash
   # Terminal 1 - API
   cd apps/api
   pnpm dev

   # Terminal 2 - Web
   cd apps/web
   pnpm dev
   ```

7. **Access the applications**:
   - **Web Dashboard**: http://localhost:5174
   - **API**: http://localhost:8787
   - **API Documentation**: http://localhost:8787/ui
   - **Database GUI**: http://localhost:7065
   - **Redis GUI**: http://localhost:7067

## Project Structure

### Applications

#### 🎨 [Web Application](./apps/web/README.md)
The frontend dashboard built with TanStack Start, React, and TypeScript. Provides a modern interface for viewing analytics, managing settings, and configuring integrations.

**Tech Stack:**
- TanStack Start (React meta-framework)
- TanStack Router & Query
- Radix UI components
- Tailwind CSS
- React Hook Form + Zod

#### 🔌 [API Application](./apps/api/README.md)
The backend REST API built with Hono and TypeScript. Handles event ingestion, analytics processing, authentication, and provides WebSocket support.

**Tech Stack:**
- Hono (ultra-fast web framework)
- PostgreSQL with pgvector
- Drizzle ORM
- Better Auth
- Redis (ioredis)
- WebSocket support

### Packages

#### 📦 [SDK Package](./packages/sdk/README.md)
Vanilla JavaScript SDK for tracking events. Works with any JavaScript application.

```javascript
import PulseMetrics from '@pulsemetrics/sdk';

PulseMetrics.init({
  apiKey: 'your-api-key',
  apiUrl: 'https://api-pulse.revoque.com.ng'
});

PulseMetrics.track('purchase', {
  product_id: '123',
  price: 99.99,
  revenue: 99.99
});
```

#### ⚛️ [React Package](./packages/react/README.md)
React SDK with hooks and components for easy integration.

```tsx
import { PulseMetricsProvider, useTrack } from '@pulsemetrics/react';

function App() {
  return (
    <PulseMetricsProvider apiKey="your-api-key">
      <YourApp />
    </PulseMetricsProvider>
  );
}

function ProductPage() {
  const track = useTrack();
  
  const handlePurchase = () => {
    track('purchase', { product_id: '123', price: 99.99 });
  };
  
  return <button onClick={handlePurchase}>Buy Now</button>;
}
```

#### 🖖 [Vue Package](./packages/vue/README.md)
Vue 3 SDK with composables and directives.

```vue
<script setup>
import { usePulseMetrics } from '@pulsemetrics/vue';

const { track } = usePulseMetrics({
  apiKey: 'your-api-key'
});

const handlePurchase = () => {
  track('purchase', { product_id: '123', price: 99.99 });
};
</script>
```

## Development

### Available Commands

Using the root `Makefile`:

```bash
make dev          # Run both API and Web in parallel
make serve-api    # Run API only
make serve-app    # Run Web only
make build        # Build production Docker image
make up           # Start Docker Compose services
make down         # Stop Docker Compose services
make clean        # Clean up Docker resources
make help         # Show all available commands
```

### Database Management

```bash
cd apps/api

# Generate migrations after schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema (development only)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Building Packages

```bash
# Build SDK
cd packages/sdk
pnpm build

# Build React package
cd packages/react
pnpm build

# Build Vue package
cd packages/vue
pnpm build
```

## Technology Stack

### Backend
- **Framework**: [Hono](https://hono.dev/) - Ultra-fast web framework
- **Language**: TypeScript
- **Database**: PostgreSQL 18+ with [pgvector](https://github.com/pgvector/pgvector)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Caching**: Redis (ioredis)
- **WebSockets**: @hono/node-ws
- **API Docs**: OpenAPI 3.0 with Swagger UI

### Frontend
- **Framework**: [TanStack Start](https://tanstack.com/start) (React meta-framework)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms**: React Hook Form + Zod
- **Charts**: [Recharts](https://recharts.org/)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Traefik
- **Database**: PostgreSQL with pgvector
- **Cache**: Redis

## Environment Variables

### API (`apps/api/.env`)
```env
API_PORT=8787
DATABASE_URL=postgresql://admin:password@localhost:7064/pm
REDIS_URL=redis://localhost:7066
BETTER_AUTH_SECRET=your-secret-key-here
```

### Web (`apps/web/.env`)
```env
VITE_API_URL=http://localhost:8787
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:5174
```

## Docker

### Development

Start all services:
```bash
docker compose up -d
```

### Production

Build and run production images:
```bash
# Build API
cd apps/api
docker build -f Dockerfile.prod -t pulse-metrics-api:latest .

# Build Web
cd apps/web
docker build -t pulse-metrics-web:latest .
```

## API Documentation

Once the API is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8787/ui
- **OpenAPI JSON**: http://localhost:8787/doc

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow existing code patterns and conventions
- Use TypeScript for all new code
- Add proper error handling
- Write clear commit messages
- Update documentation as needed
- Ensure all tests pass

## Documentation

- [Apps Overview](./apps/README.md) - Overview of applications
- [Web Application](./apps/web/README.md) - Web dashboard documentation
- [API Application](./apps/api/README.md) - API documentation
- [SDK Package](./packages/sdk/README.md) - JavaScript SDK docs
- [React Package](./packages/react/README.md) - React SDK docs
- [Vue Package](./packages/vue/README.md) - Vue SDK docs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@pulsemetrics.io or open an issue on GitHub.

## Acknowledgments

- Built with [Hono](https://hono.dev/) - Ultra-fast web framework
- Powered by [TanStack](https://tanstack.com/) - High-quality open-source libraries
- Database powered by [PostgreSQL](https://www.postgresql.org/) and [pgvector](https://github.com/pgvector/pgvector)

---

<div align="center">
Made with ❤️ by the Pulse Metrics team
</div>

