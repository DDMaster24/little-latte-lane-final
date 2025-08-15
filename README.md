# 🍵 Little Latte Lane

A modern, full-stack restaurant ordering and booking platform built with Next.js 15, React 19, Supabase, and PayFast integration.

## ✨ Features

- 🛒 **Online Ordering System** - Complete menu browsing and order management
- 📅 **Table & Golf Booking** - Reservation system with real-time availability
- 💳 **PayFast Integration** - Secure South African payment processing
- 📱 **Progressive Web App** - Mobile-optimized with offline capabilities
- 👥 **Multi-role Authentication** - Customer, Staff, and Admin dashboards
- 📊 **Analytics & Reporting** - Real-time business insights
- 🔐 **Row Level Security** - Enterprise-grade data protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- PayFast merchant account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DDMaster24/little-latte-lane.git
   cd little-latte-lane
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the database migrations (see Database Setup below)
   - Copy your project URL and keys to `.env.local`

5. **Choose your development environment**

   **Option A: Cloud Development (Recommended)**
   ```bash
   # Uses your existing Supabase project
   npm run dev
   ```

   **Option B: Local Development with Docker**
   ```bash
   # Starts local PostgreSQL and Redis containers
   npm run dev:docker
   ```

6. **Open your application**
   - Application: http://localhost:3000
   - pgAdmin (Docker only): http://localhost:8080

## 🐳 Docker Development

For local development with Docker, see [DOCKER.md](./DOCKER.md) for detailed setup instructions.

Quick commands:
```bash
npm run docker:up      # Start containers
npm run docker:down    # Stop containers
npm run docker:logs    # View logs
npm run dev:docker     # Start containers + dev server
```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🗄️ Database Setup

1. **Create a new Supabase project**

2. **Run database migrations** (if you have migration files)
   ```bash
   npm run db:generate-types
   ```

3. **Or use the Supabase CLI**
   ```bash
   npx supabase init
   npx supabase start
   npx supabase db push
   ```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript checks |
| `npm run test` | Run Playwright tests |
| `npm run clean` | Clean build artifacts |
| `npm run analyze` | Analyze bundle and dependencies |

## 🏗️ Project Structure

```
little-latte-lane/
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable React components
│   ├── lib/              # Utilities and configurations
│   │   ├── queries/      # Database query functions
│   │   ├── env.ts        # Environment validation
│   │   ├── supabase.ts   # Supabase client
│   │   └── payfast.ts    # PayFast integration
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand state management
│   └── types/            # TypeScript definitions
├── .env.example          # Environment template
├── next.config.ts        # Next.js configuration
└── tailwind.config.js    # Tailwind CSS config
```

## 🌐 Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key

### PayFast Configuration
- `NEXT_PUBLIC_PAYFAST_SANDBOX` - Set to 'true' for testing
- `PAYFAST_MERCHANT_ID` - Your PayFast merchant ID
- `PAYFAST_MERCHANT_KEY` - Your PayFast merchant key
- `PAYFAST_PASSPHRASE` - Your secure passphrase

## 🔐 Authentication & Authorization

The app uses Supabase Auth with custom profiles:

- **Customers** - Browse menu, place orders, make bookings
- **Staff** - Manage orders, view kitchen dashboard
- **Admin** - Full access to analytics and system management

## 💳 Payment Integration

PayFast integration supports:
- Secure payment processing
- Order confirmation
- Payment status webhooks
- Sandbox and production modes

## � Notification System

Automated email notifications for:
- **Order Confirmations** - Sent to customers after successful payment
- **Booking Confirmations** - Sent after table/golf reservations
- **Admin Notifications** - New orders and bookings alerts

**Configuration:**
- Uses Resend API for reliable email delivery
- HTML templates with Little Latte Lane branding
- Fallback to console logging in development
- Test notifications: `npm run test:notifications`

## �📱 Progressive Web App

The app includes PWA features:
- Installable on mobile devices
- Offline menu browsing
- Push notifications (planned)
- Optimized for mobile performance

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform supporting Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- Self-hosted with PM2

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in UI mode
npm run test:ui

# Run tests in debug mode
npm run test:debug
```

## 🔍 Code Quality

The project includes:
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety
- **Husky** - Git hooks (if configured)

## 📊 Analytics & Monitoring

Built-in analytics include:
- Order tracking
- Revenue reports
- Popular menu items
- Customer analytics
- Booking statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is proprietary software owned by Little Latte Lane.

## 🆘 Support

For support, email: support@littlelattlane.com

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- Complete ordering system
- PayFast integration
- Booking system
- Admin dashboard

---

Made with ❤️ by [DDMaster24](https://github.com/DDMaster24)
