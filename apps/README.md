# Pulse Metrics Applications

This directory contains the main applications for the Pulse Metrics platform - a real-time analytics solution for e-commerce stores.

## Overview

Pulse Metrics provides real-time analytics, event tracking, and beautiful dashboards to help e-commerce businesses understand their customer behavior and optimize their operations.

## Applications

### 🎨 [Web Application](./web/README.md)
The frontend dashboard application built with TanStack Start, React, and TypeScript. Provides a modern, responsive interface for viewing analytics, managing settings, and configuring integrations.

**Key Features:**
- Real-time analytics dashboards
- Event tracking visualization
- User authentication and onboarding
- Organization and profile management
- Settings and configuration

### 🔌 [API Application](./api/README.md)
The backend REST API built with Hono, TypeScript, and PostgreSQL. Handles event ingestion, analytics processing, authentication, and provides WebSocket support for real-time updates.

**Key Features:**
- RESTful API with OpenAPI documentation
- WebSocket support for real-time updates
- Event tracking and analytics endpoints
- Authentication and authorization
- Database migrations with Drizzle ORM

## Quick Start

### Prerequisites

- Node.js 20+ and pnpm
- PostgreSQL 18+ with pgvector extension
- Redis (for caching and real-time features)
- Docker and Docker Compose (optional, for local development)

### Development Setup

1. **Start infrastructure services** (from project root):
   ```bash
   docker compose up -d
   ```
   This starts PostgreSQL, Redis, and other supporting services.

2. **Install dependencies**:
   ```bash
   # Install API dependencies
   cd api
   pnpm install

   # Install Web dependencies
   cd ../web
   pnpm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env` in both `api/` and `web/` directories
   - Update database connection strings and API keys

4. **Run database migrations** (API):
   ```bash
   cd api
   pnpm db:migrate
   ```

5. **Start development servers**:
   ```bash
   # Terminal 1 - API
   cd api
   pnpm dev

   # Terminal 2 - Web
   cd web
   pnpm dev
   ```

## Architecture

```
apps/
├── api/          # Backend API server
│   ├── routes/   # API route handlers
│   ├── services/ # Business logic
│   ├── repositories/ # Data access layer
│   └── db/       # Database schema and migrations
│
└── web/          # Frontend dashboard
    ├── src/
    │   ├── routes/      # Application routes
    │   ├── components/  # React components
    │   ├── hooks/       # Custom React hooks
    │   └── lib/         # Utilities and helpers
    └── public/    # Static assets
```

## Technology Stack

### API
- **Framework**: Hono (lightweight web framework)
- **Language**: TypeScript
- **Database**: PostgreSQL with pgvector
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **Caching**: Redis (ioredis)
- **WebSockets**: @hono/node-ws
- **API Docs**: OpenAPI/Swagger

### Web
- **Framework**: TanStack Start (React meta-framework)
- **Language**: TypeScript
- **Routing**: TanStack Router
- **State Management**: TanStack Query
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

## Environment Variables

### API (.env)
```env
API_PORT=8787
DATABASE_URL=postgresql://admin:password@localhost:7064/pm
REDIS_URL=redis://localhost:7066
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:8787
```

### Web (.env)
```env
VITE_API_URL=http://localhost:8787
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:8787
```

## Docker Support

Both applications include Dockerfiles for containerized deployment:

- `api/Dockerfile` - Production API image
- `web/Dockerfile` - Web application image

See individual READMEs for Docker usage instructions.

## Development Workflow

1. **Make changes** to either application
2. **Test locally** using development servers
3. **Run migrations** when database schema changes
4. **Build** for production when ready to deploy

## Contributing

When contributing to these applications:

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Ensure migrations are backward compatible
5. Test both applications together

## Additional Resources

- [Web Application Documentation](./web/README.md)
- [API Documentation](./api/README.md)
- [Project Root README](../README.md) (if exists)

