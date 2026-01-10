# Pulse Metrics API

The backend REST API for Pulse Metrics - a high-performance, real-time analytics API built with Hono and TypeScript.

## Overview

This API provides endpoints for:
- Event tracking and ingestion
- Real-time analytics and metrics
- User authentication and authorization
- Organization management
- WebSocket support for live updates
- OpenAPI/Swagger documentation

## Features

- ⚡ **High Performance**: Built with Hono - one of the fastest web frameworks
- 🔌 **WebSocket Support**: Real-time updates via WebSocket connections
- 📊 **Analytics Engine**: Powerful analytics processing and caching
- 🔐 **Authentication**: Secure auth with Better Auth
- 📝 **OpenAPI Docs**: Auto-generated API documentation
- 🗄️ **Type-Safe Database**: Drizzle ORM with PostgreSQL
- ⚡ **Caching**: Redis integration for performance
- 🔄 **Real-time Listener**: PostgreSQL LISTEN/NOTIFY for live updates

## Tech Stack

- **Framework**: [Hono](https://hono.dev/) - Ultra-fast web framework
- **Language**: TypeScript
- **Database**: PostgreSQL 18+ with [pgvector](https://github.com/pgvector/pgvector)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Caching**: Redis (ioredis)
- **WebSockets**: @hono/node-ws
- **API Documentation**: OpenAPI 3.0 with Swagger UI
- **Validation**: Zod schemas

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (package manager)
- PostgreSQL 18+ with pgvector extension
- Redis (for caching and real-time features)

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the `api/` directory:
   ```env
   API_PORT=8787
   DATABASE_URL=postgresql://admin:password@localhost:7064/pm
   REDIS_URL=redis://localhost:7066
   BETTER_AUTH_SECRET=your-secret-key-here
   ```

3. **Run database migrations**:
   ```bash
   pnpm db:migrate
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

   The API will be available at `http://localhost:8787`

### Database Setup

1. **Generate migrations** (after schema changes):
   ```bash
   pnpm db:generate
   ```

2. **Apply migrations**:
   ```bash
   pnpm db:migrate
   ```

3. **Push schema** (development only):
   ```bash
   pnpm db:push
   ```

4. **Open Drizzle Studio** (database GUI):
   ```bash
   pnpm db:studio
   ```

## Project Structure

```
api/
├── db/
│   ├── schema.ts           # Database schema definitions
│   ├── index.ts            # Database connection
│   └── migrations/         # Database migrations
│
├── routes/                 # API route handlers
│   ├── analytics.routes.ts
│   ├── events.routes.ts
│   ├── health.routes.ts
│   ├── onboarding.routes.ts
│   ├── organization.routes.ts
│   ├── profile.routes.ts
│   └── settings.routes.ts
│
├── services/               # Business logic
│   ├── analytics.service.ts
│   ├── ecommerce.service.ts
│   ├── onboarding.service.ts
│   ├── organization.service.ts
│   └── settings.service.ts
│
├── repositories/           # Data access layer
│   ├── analytics.repository.ts
│   ├── ecommerce.repository.ts
│   ├── events.repository.ts
│   ├── onboarding.repository.ts
│   ├── organization.repository.ts
│   └── users.repository.ts
│
├── schemas/                # Zod validation schemas
│   ├── common.schemas.ts
│   ├── event.schemas.ts
│   └── settings.schemas.ts
│
├── middleware/             # Express-style middleware
│   ├── auth.ts            # Authentication middleware
│   ├── error-handler.ts   # Error handling
│   └── rate-limit.ts      # Rate limiting
│
├── lib/                    # Library code
│   └── auth.ts            # Auth configuration
│
├── utils/                  # Utility functions
│   ├── common.utils.ts
│   └── response.utils.ts
│
├── realtime-listener.ts    # PostgreSQL LISTEN/NOTIFY
├── ws-server.ts            # WebSocket server setup
├── index.ts                # Application entry point
└── drizzle.config.ts       # Drizzle configuration
```

## API Endpoints

### Health & Documentation

- `GET /` - API information
- `GET /health` - Health check endpoint
- `GET /ui` - Swagger UI documentation
- `GET /doc` - OpenAPI JSON specification

### Authentication

- `POST /v1/auth/*` - Authentication endpoints (handled by Better Auth)

### Events

- `POST /v1/events` - Track events
- `GET /v1/events` - List events (with filters)

### Analytics

- `GET /v1/analytics/overview` - Analytics overview
- `GET /v1/analytics/metrics` - Specific metrics
- `GET /v1/analytics/realtime` - Real-time analytics

### Profile

- `GET /v1/profile` - Get user profile
- `PATCH /v1/profile` - Update user profile

### Organization

- `GET /v1/organization` - Get organization details
- `PATCH /v1/organization` - Update organization
- `POST /v1/organization/members` - Add member
- `DELETE /v1/organization/members/:id` - Remove member

### Settings

- `GET /v1/settings` - Get user settings
- `PATCH /v1/settings` - Update settings

### Onboarding

- `GET /v1/onboarding/status` - Get onboarding status
- `POST /v1/onboarding/complete` - Complete onboarding step

### WebSocket

- `WS /ws` - WebSocket connection for real-time updates

## WebSocket API

Connect to `/ws` for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:8787/ws');

// Subscribe to specific tables
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    tables: ['events', 'profile'],
    filters: { organizationId: 'your-org-id' }
  }));
};

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

## Database Schema

Key tables:
- `organization` - Organizations/workspaces
- `user` - User accounts
- `events` - Tracked events
- `analytics_cache` - Cached analytics data
- `settings` - User preferences
- `sessions` - User sessions

See `db/schema.ts` for complete schema definitions.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_PORT` | Server port | `8787` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `BETTER_AUTH_SECRET` | Authentication secret | Required |

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes (dev only)
- `pnpm db:studio` - Open Drizzle Studio

## Real-time Features

The API includes a real-time listener that uses PostgreSQL's LISTEN/NOTIFY feature to detect database changes and push updates to connected WebSocket clients.

### How it works:

1. Database changes trigger PostgreSQL NOTIFY
2. Real-time listener receives notifications
3. Updates are broadcast to subscribed WebSocket clients
4. Clients receive filtered updates based on subscriptions

## Error Handling

All errors are handled by the `error-handler` middleware:
- Validation errors return 400
- Authentication errors return 401
- Authorization errors return 403
- Not found errors return 404
- Server errors return 500

Error responses follow a consistent format:
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Rate Limiting

Rate limiting middleware is available to protect endpoints from abuse. Configure limits per route as needed.

## Docker

### Development

```bash
docker build -t pulse-metrics-api .
docker run -p 8787:8787 pulse-metrics-api
```

### Production

```bash
docker build -f Dockerfile.prod -t pulse-metrics-api:prod .
docker run -p 8787:8787 pulse-metrics-api:prod
```

## Testing

```bash
# Run tests (when available)
pnpm test

# Type checking
pnpm tsc --noEmit
```

## Performance Considerations

- **Caching**: Analytics data is cached in Redis
- **Database Indexes**: Optimized indexes on frequently queried columns
- **Connection Pooling**: PostgreSQL connection pooling configured
- **Batch Processing**: Events can be batched for better performance

## Security

- Authentication required for protected routes
- API key validation for event tracking
- Rate limiting on public endpoints
- CORS configured for allowed origins
- Input validation with Zod schemas

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check pgvector extension is installed: `CREATE EXTENSION vector;`

### Redis Connection Issues

- Verify `REDIS_URL` is correct
- Ensure Redis is running
- Check network connectivity

### Migration Issues

- Ensure database is accessible
- Check migration files are valid
- Review Drizzle logs for errors

## Contributing

When contributing to the API:

1. Follow existing code patterns
2. Add Zod schemas for validation
3. Write repository methods for data access
4. Add service layer for business logic
5. Update OpenAPI documentation
6. Add error handling
7. Test endpoints thoroughly

## Resources

- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Better Auth Documentation](https://www.better-auth.com/)
- [PostgreSQL LISTEN/NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html)
- [OpenAPI Specification](https://swagger.io/specification/)

