# Stridelab

Advanced dashboard for Strava athletes. Visualize your stats, analyze your performance, and get personalized predictions.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## Features

### Dashboard - Overview

- **Recent stats**: Distance, time, activities, and elevation from the last week
- **General overview**: Monthly, yearly, and all-time totals
- **Weekly chart**: Kilometers per day of the week
- **Monthly progress**: Comparison with previous months

### Dashboard - Analysis

- **Weekly volume**: km per week chart with trend
- **Pace progression**: Evolution of your average pace
- **Zone distribution**: Time in each HR zone
- **Year comparison**: This year vs last year
- **Time analysis**: Discover when you train best
- **Aerobic decoupling**: Cardiac efficiency

### Dashboard - Predictions

- **Estimated times**: 5K, 10K, Half Marathon, Marathon
- **Personal records**: PR tracking with progression
- **Training streaks**: Consecutive active days
- **Injury risk**: Based on training load

### Dashboard - Activities

- **Monthly calendar**: View of all your workouts
- **Activity list**: With filters and search

### Activity Detail

- **Interactive map**: GPS route with Leaflet
- **Heart rate zones**: Detailed distribution with histogram
- **Stream charts**: HR, altitude, and speed throughout the activity
- **Kilometer splits**: Analysis of each km with pace and HR
- **Performance analysis**:
  - Negative/Positive Split (race strategy)
  - Best and worst kilometer
  - Pace consistency (%)
  - Cardiac drift (post-warmup vs final)
  - GAP - Grade Adjusted Pace
  - Training load (points)

## Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Strava account

## Strava API Setup

1. Go to [Strava API Settings](https://www.strava.com/settings/api)

2. Create a new application:
   - **Application Name**: Stridelab (or any name you prefer)
   - **Category**: Training/Analysis
   - **Website**: `http://localhost:3000`
   - **Authorization Callback Domain**: `localhost`

3. Copy your **Client ID** and **Client Secret**

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/stridelab.git
cd stridelab
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Copy the environment variables file:

```bash
cp .env.example .env
```

4. Edit `.env` with your credentials:

```env
# Strava API Credentials
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret
```

To generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

7. Click **Connect with Strava** to authorize the application

## Available Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with Turbopack |
| `npm run build` | Build for production                     |
| `npm run start` | Start production server                  |
| `npm run lint`  | Run ESLint                               |

## Project Structure

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── activities/         # Activities and streams
│   │   ├── auth/               # OAuth with Strava
│   │   ├── stats/              # Statistics
│   │   ├── zones/              # Training zones
│   │   ├── predictions/        # Time predictions
│   │   ├── advanced-stats/     # Advanced statistics
│   │   ├── premium-stats/      # PRs, streaks, risk
│   │   └── best-efforts/       # Best efforts
│   ├── dashboard/
│   │   ├── page.tsx            # Overview tab
│   │   ├── analysis/           # Analysis tab
│   │   ├── predictions/        # Predictions tab
│   │   ├── activities/         # Activities tab
│   │   └── activity/[id]/      # Activity detail
│   ├── layout.tsx
│   └── page.tsx                # Login
├── components/
│   ├── charts/                 # Charts (Recharts)
│   │   ├── weekly-chart.tsx
│   │   ├── monthly-progress.tsx
│   │   ├── heart-rate-zones.tsx
│   │   ├── activity-streams-chart.tsx
│   │   └── hr-trend.tsx
│   ├── advanced-stats/         # Analysis components
│   │   ├── weekly-volume-chart.tsx
│   │   ├── pace-progression-chart.tsx
│   │   ├── zone-distribution-chart.tsx
│   │   ├── year-comparison.tsx
│   │   ├── time-analysis.tsx
│   │   └── aerobic-decoupling.tsx
│   ├── activity-advanced-stats.tsx  # Individual activity analysis
│   ├── activity-calendar.tsx
│   ├── activity-list.tsx
│   ├── activity-map.tsx
│   ├── activity-splits.tsx
│   └── ...
├── hooks/
│   └── use-strava.ts           # React Query hooks
├── lib/
│   ├── api-client.ts           # API client
│   └── utils.ts                # Utilities (formatPace, formatDuration, etc.)
└── types/
    └── strava.ts               # TypeScript types for Strava API
```

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router and Turbopack
- **UI**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Maps**: [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query)
- **Dates**: [date-fns](https://date-fns.org/)
- **Polyline Decoding**: [@mapbox/polyline](https://github.com/mapbox/polyline)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub

2. Import the project in [Vercel](https://vercel.com)

3. Configure environment variables:
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`
   - `NEXTAUTH_URL` (your domain, e.g., `https://stridelab.vercel.app`)
   - `NEXTAUTH_SECRET`

4. In Strava API Settings, update:
   - **Website**: Your Vercel URL
   - **Authorization Callback Domain**: Your domain without `https://` (e.g., `stridelab.vercel.app`)

### Docker

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

### Other Platforms

Compatible with any platform that supports Next.js:

- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify
- Netlify

## Strava API Limitations

- **Rate limits**: 100 requests every 15 minutes, 1000 per day
- **Your data only**: You cannot access other users' data
- **Caching**: The app implements aggressive caching to minimize API calls

## Calculated Metrics

Stridelab calculates advanced metrics that Strava doesn't provide directly:

| Metric                 | Description                                        |
| ---------------------- | -------------------------------------------------- |
| **Negative Split**     | Second half faster than the first                  |
| **Pace consistency**   | Standard deviation of pace between splits          |
| **Cardiac drift**      | HR increase at same effort (excludes warmup)       |
| **GAP**                | Equivalent pace on flat terrain                    |
| **Training load**      | Based on duration and HR intensity                 |
| **Aerobic decoupling** | Cardiac efficiency during the activity             |

## Contributing

Contributions are welcome:

1. Fork the repository
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

Built with Next.js and the Strava API
# stridelab
