# ArtisanAlley - Digital Art Marketplace

ArtisanAlley is a modern digital art marketplace built with Next.js 15, where artists can showcase and sell their artwork while art enthusiasts can discover and purchase unique pieces. The platform features a rich, interactive user experience with real-time chat, secure payments, and a sophisticated art discovery system.

## 🌟 Features

- **Digital Art Marketplace**: Browse, buy, and sell digital artwork
- **User Authentication**: Secure authentication system using Supabase
- **Real-time Chat**: Direct messaging between artists and buyers
- **Search & Discovery**: Advanced search functionality with filters
- **User Profiles**: Customizable artist and collector profiles
- **Secure Payments**: Integrated payment processing with Stripe
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI
- **Dark Mode Support**: Built-in theme switching capability

## 🚀 Tech Stack

- **Frontend Framework**: Next.js 15.3.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Payment Processing**: Stripe
- **Deployment**: Vercel (recommended)

## 📦 Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Stripe account (for payment processing)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd artisanalley
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🗂️ Project Structure

- `/app` - Next.js app router pages and layouts
  - `/actions` - Server actions and API functions
  - `/api` - API routes
  - `/auth` - Authentication related pages
  - `/chat` - Real-time messaging features
  - `/gallery` - Art gallery and showcase
  - `/profile` - User profile management
  - `/settings` - User settings and preferences
- `/components` - Reusable UI components
- `/lib` - Utility functions and shared logic
- `/public` - Static assets
- `/supabase` - Supabase configuration and types

## 🔐 Authentication

The application uses Supabase Authentication with the following features:
- Email/Password authentication
- Social authentication (Google, GitHub)
- Password reset functionality
- Protected routes
- Role-based access control

## 💳 Payment Processing

Secure payment processing is handled through Stripe, supporting:
- Multiple currency payments
- Secure checkout process
- Payment history
- Refund handling
- Artist payout system

## 🚀 Deployment

The recommended deployment platform is Vercel:

1. Push your code to a Git repository
2. Import your project to Vercel
3. Configure environment variables
4. Deploy!

You can also deploy to other platforms that support Next.js applications.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue in the repository or contact the maintainers.

---

Built with ❤️ using [Next.js](https://nextjs.org)
