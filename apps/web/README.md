# Astro Web App

Next.js-based web application for the Astro prediction platform.

## Features

- User authentication (OAuth + email/password)
- Astrological profile creation
- All three prediction types (macro, birth date, divination)
- Personalized asset recommendations
- Polymarket event predictions
- Crypto payment integration
- Real-time prediction animations

## Tech Stack

- Next.js 14+ (App Router)
- React 18
- TypeScript
- TailwindCSS
- Framer Motion
- Zustand (state management)
- React Hook Form + Zod
- Solana Pay
- Phantom/MetaMask integration

## Getting Started

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` in the root directory.

## Project Structure

```
web/
├── app/              # Next.js App Router
│   ├── (auth)/      # Auth-protected routes
│   ├── (public)/    # Public routes
│   └── api/         # API routes (if needed)
├── components/      # React components
│   ├── ui/         # Base UI components
│   ├── forms/      # Form components
│   ├── predictions/# Prediction-specific components
│   └── animations/ # Animation components
├── lib/            # Utilities and helpers
├── hooks/          # Custom React hooks
├── store/          # Zustand stores
├── styles/         # Global styles
└── public/         # Static assets
```

## Key Pages

- `/` - Landing page
- `/auth/signup` - Sign up
- `/auth/login` - Login
- `/dashboard` - Main dashboard
- `/predict` - Prediction request form
- `/predictions` - Prediction history
- `/profile` - User profile & birth chart
- `/assets` - Browse assets
- `/polymarket` - Polymarket events

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Lint code
npm run test     # Run tests
```
