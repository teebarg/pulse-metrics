# Pulse Metrics Web Application

The frontend dashboard application for Pulse Metrics - a modern, responsive web interface for viewing real-time analytics and managing your e-commerce tracking configuration.

## Overview

Built with TanStack Start (React meta-framework), this application provides a beautiful, intuitive interface for:
- Viewing real-time analytics and metrics
- Tracking events and user behavior
- Managing organization settings
- Configuring integrations
- User authentication and onboarding

## Features

- 🎨 **Modern UI**: Built with Radix UI components and Tailwind CSS
- ⚡ **Real-time Updates**: WebSocket integration for live data
- 📊 **Analytics Dashboards**: Beautiful charts and visualizations with Recharts
- 🔐 **Authentication**: Secure user authentication with Better Auth
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🚀 **Fast Performance**: Optimized with TanStack Router and Query
- 🎯 **Type Safety**: Full TypeScript support

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React meta-framework)
- **Language**: TypeScript
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm (package manager)
- Running API server (see [API README](../api/README.md))
- PostgreSQL and Redis (via Docker Compose)

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the `web/` directory:
   ```env
   VITE_API_URL=http://localhost:8787
   BETTER_AUTH_SECRET=your-secret-key-here
   BETTER_AUTH_URL=http://localhost:8787
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:5174` (or the port specified by Vite).

### Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
web/
├── public/              # Static assets
│   ├── favicon.ico
│   ├── sdk.js          # Pulse Metrics SDK
│   └── ...
│
├── src/
│   ├── components/     # React components
│   │   ├── ui/        # Reusable UI components (Radix UI)
│   │   ├── onboarding/ # Onboarding flow components
│   │   └── ...
│   │
│   ├── routes/         # Application routes
│   │   ├── _auth/     # Authentication routes
│   │   ├── _protected/ # Protected routes
│   │   │   ├── account/ # Dashboard and settings
│   │   │   └── onboarding/ # Onboarding flow
│   │   └── ...
│   │
│   ├── hooks/         # Custom React hooks
│   │   ├── usePulseMetrics.ts
│   │   ├── useNotifications.ts
│   │   └── useRealtimeVerification.ts
│   │
│   ├── lib/           # Utilities and helpers
│   │   ├── auth.ts    # Authentication utilities
│   │   ├── api.ts     # API client
│   │   └── utils.ts   # General utilities
│   │
│   ├── providers/     # React context providers
│   │   └── root-provider.tsx
│   │
│   ├── server-fn/     # Server functions
│   │
│   ├── types/         # TypeScript type definitions
│   │
│   ├── utils/         # Utility functions
│   │
│   ├── router.tsx     # Router configuration
│   ├── routeTree.gen.ts # Generated route tree
│   └── styles.css     # Global styles
│
├── components.json    # shadcn/ui configuration
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Key Features

### Authentication

The application uses Better Auth for authentication. Routes are protected using middleware:

- `_auth.tsx` - Public routes (login, signup)
- `_protected.tsx` - Protected routes requiring authentication

### Routing

TanStack Router provides file-based routing with:
- Type-safe route definitions
- Automatic code splitting
- SSR support
- Route preloading

### Data Fetching

TanStack Query handles all data fetching with:
- Automatic caching
- Background refetching
- Optimistic updates
- Real-time synchronization

### Real-time Updates

WebSocket integration provides real-time updates for:
- Live event tracking
- Analytics updates
- Notification delivery

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm dev-debug` - Debug mode (container stays alive)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8787` |
| `BETTER_AUTH_SECRET` | Authentication secret key | Required |
| `BETTER_AUTH_URL` | Authentication base URL | Required |

## Development Tips

### Adding New Routes

1. Create a new file in `src/routes/`
2. Export a route component
3. The route tree will be auto-generated

### Adding UI Components

Use the shadcn/ui CLI to add new components:
```bash
npx shadcn@latest add [component-name]
```

### Styling

- Use Tailwind CSS utility classes
- Custom styles in `src/styles.css`
- Component-specific styles with CSS modules (if needed)

### API Integration

API calls are made through:
- TanStack Query hooks in components
- API client in `src/lib/api.ts`
- Server functions in `src/server-fn/`

## Docker

### Development

```bash
docker build -t pulse-metrics-web .
docker run -p 5174:5174 pulse-metrics-web
```

### Production

The application can be containerized for production deployment. See the root `docker-compose.yml` for an example configuration.

## Troubleshooting

### Port Already in Use

If port 5174 is already in use, Vite will automatically try the next available port. Check the console output for the actual port.

### API Connection Issues

Ensure:
1. The API server is running
2. `VITE_API_URL` matches the API server URL
3. CORS is properly configured on the API

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
- Clear Vite cache: `rm -rf .vite`
- Check TypeScript errors: `pnpm tsc --noEmit`

## Contributing

When contributing to the web application:

1. Follow the existing component patterns
2. Use TypeScript for all new code
3. Add proper error handling
4. Ensure responsive design
5. Test on multiple browsers
6. Update this README if adding new features

## Resources

- [TanStack Start Documentation](https://tanstack.com/start)
- [TanStack Router Documentation](https://tanstack.com/router)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

