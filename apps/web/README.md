# Astro Web Application

> Cosmic Insights for Financial Decisions

A Next.js web application for the Astro prediction platform, combining ancient astrology with modern AI to provide personalized financial market predictions.

## Features

- **Multi-Authentication**: Email/password, Phantom wallet (Solana), and MetaMask (Ethereum)
- **Wallet Integration**: Full Web3 wallet support with signature-based authentication
- **Cosmic Theme**: Beautiful dark theme with cosmic color palette and animations
- **Responsive Design**: Mobile-first design that works on all devices
- **TypeScript**: Fully typed for better developer experience
- **Modern Stack**: Built with Next.js 16, React 19, and TailwindCSS 4

## Tech Stack

- **Framework**: Next.js 16.0.10 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Wallet Integration**:
  - @solana/web3.js (Phantom)
  - ethers.js (MetaMask)

## Prerequisites

- Node.js 18+ or 20+
- npm, yarn, or pnpm
- Backend API running on http://localhost:3001 (see `apps/api`)

## Getting Started

### 1. Install Dependencies

```bash
cd apps/web
npm install --legacy-peer-deps
```

Note: We use `--legacy-peer-deps` due to React 19 compatibility with some wallet libraries.

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/v1

# App Configuration
NEXT_PUBLIC_APP_NAME=Astro
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
apps/web/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes group
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   ├── dashboard/           # Dashboard page
│   ├── settings/            # Settings page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles with cosmic theme
├── components/              # React components
│   ├── ui/                  # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   ├── auth/                # Auth-specific components
│   └── layout/              # Layout components
├── lib/                     # Utilities and helpers
│   ├── api.ts               # API client with JWT management
│   └── wallet.ts            # Wallet integration utilities
├── store/                   # Zustand state stores
│   └── auth.ts              # Authentication state
├── types/                   # TypeScript types
│   └── index.ts             # Shared types for API responses
├── public/                  # Static assets
├── .env.local               # Environment variables (git-ignored)
├── .env.example             # Example environment file
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # TailwindCSS configuration (v4)
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Authentication Methods

### Email Authentication
- Standard email/password signup and login
- JWT-based authentication with token refresh
- Secure token storage in localStorage

### Wallet Authentication

#### Phantom (Solana)
1. User clicks "Connect Phantom"
2. Phantom extension prompts for connection
3. User signs authentication message (no gas fees)
4. Backend verifies signature and issues JWT
5. User is authenticated

#### MetaMask (Ethereum)
1. User clicks "Connect MetaMask"
2. MetaMask extension prompts for connection
3. User signs authentication message (no gas fees)
4. Backend verifies signature and issues JWT
5. User is authenticated

### Account Linking
Users can link multiple authentication methods to a single account:
- Start with wallet → Add email later
- Start with email → Add wallet later
- Link multiple wallets (Solana + Ethereum)

## Key Components

### API Client (`lib/api.ts`)
- Axios-based HTTP client
- Automatic JWT token injection
- Token refresh on 401 errors
- Typed API methods for all endpoints

### Wallet Utilities (`lib/wallet.ts`)
- Phantom wallet integration
- MetaMask wallet integration
- High-level authentication functions
- Error handling and user-friendly messages

### Auth Store (`store/auth.ts`)
- Zustand state management
- Persistent auth state
- Login/logout/register actions
- Current user management

### UI Components (`components/ui/`)
- **Button**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Input**: Form input with label, error, and helper text
- **Card**: Container with variants (default, glass, glow)

## Available Scripts

```bash
# Development
npm run dev          # Start dev server on port 3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code with ESLint

# Type checking
npm run type-check   # Run TypeScript compiler check
```

## Styling

### Cosmic Theme
The app uses a custom cosmic/astrology theme with:

**Color Palette:**
- Cosmic Void: `#0a0118` (deep space background)
- Cosmic Deep: `#1a0b2e` (card background)
- Cosmic Violet: `#7c3aed` (primary accent)
- Cosmic Indigo: `#6366f1` (secondary accent)
- Cosmic Gold: `#fbbf24` (highlights)

**Element Colors:**
- Metal: Silver/Gray
- Wood: Green
- Water: Blue
- Fire: Orange
- Earth: Brown

### Custom Animations
- `animate-float`: Floating animation (3s loop)
- `animate-pulse-glow`: Pulsing glow effect (2s loop)
- `animate-shimmer`: Shimmer effect (2s loop)

### Glassmorphism
Use the `.glass` class for glassmorphism effects:
```tsx
<div className="glass p-4 rounded-lg">
  Content with glass effect
</div>
```

## API Integration

The app connects to the backend API at `http://localhost:3001/v1` by default.

### API Endpoints Used
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/wallet/nonce` - Request wallet nonce
- `POST /auth/wallet/verify` - Verify wallet signature
- `POST /auth/refresh` - Refresh access token

See `/docs/API.md` for complete API documentation.

## Troubleshooting

### Wallet Not Detected
- **Phantom**: Install from https://phantom.app
- **MetaMask**: Install from https://metamask.io
- Refresh the page after installation

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Peer Dependency Warnings
Use `--legacy-peer-deps` flag when installing:
```bash
npm install --legacy-peer-deps
```

### API Connection Issues
- Ensure backend is running on `http://localhost:3001`
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check browser console for CORS errors

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/v1` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Astro` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Brave (latest)

Note: Wallet extensions required for Web3 authentication.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checks
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues and questions, contact the development team.

---

**Built with ❤️ by the Astro Team**
