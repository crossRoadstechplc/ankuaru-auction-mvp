# Ankuaru Auction MVP

Ankuaru Auction MVP is a modern, full-featured web application for a sealed-bid auction system. Users can create auctions, place sealed bids, follow their favorite creators, and manage their auction activity through a sleek, responsive dashboard.

## 🚀 Features

- **Sealed-Bid Auctions**: Secure bidding system where bid amounts are hidden until the reveal phase.
- **User Authentication**: Secure registration and login powered by JWT.
- **Dynamic Auction Feed**: Browse public auctions, with specialized visibility for followers or selected users.
- **Comprehensive Dashboard**: Track your reputation, followers, and auction participation at a glance.
- **Real-time Notifications**: Stay updated on bid status, auction closes, and new followers.
- **Creator Profiles**: Follow other users and view their auction history.
- **Auction Tracking**: Specialized tracking page to monitor specific auctions by ID.
- **Responsive Design**: Fully optimized for desktop and mobile devices with dark mode support.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Context API
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.stevenly.com/)

## 📂 Project Structure

```text
ankuaru-auction-mvp/
├── app/                  # Next.js App Router pages and layouts
│   ├── auction/[id]/     # Auction details and bidding
│   ├── dashboard/        # User statistics and activity
│   ├── feed/             # Main auction discovery feed
│   ├── login/            # Authentication: Login
│   ├── register/         # Authentication: Register
│   ├── notifications/    # User notification center
│   └── track/            # Auction tracking and search
├── components/           # Reusable UI components
│   ├── common/           # Buttons, Badges, etc.
│   ├── layout/           # Header, Footer, Sidebar
│   └── auction/          # Auction-specific components
├── contexts/             # React Contexts (Auth, etc.)
├── lib/                  # Core logic and utilities
│   ├── api.ts            # API Client (Singleton)
│   ├── types.ts          # TypeScript interfaces
│   └── imageUtils.tsx    # Image handling utilities
└── public/               # Static assets
```

## 🔌 API Integration

The application integrates with the Ankuaru Auction Backend. The base URL is configured via environment variables.

### Key Endpoints

#### Authentication
- `POST /api/auth/register`: Create a new account.
- `POST /api/auth/login`: Authenticate and receive a JWT.
- `GET /api/auth/followers/me`: Retrieve your follower list.
- `POST /api/auth/follow/:userId`: Follow a specific user.
- `GET /api/auth/ratings/me/summary`: Get your average rating and reputation stats.

#### Auctions
- `GET /api/auctions`: Fetch all visible auctions (Public/Followers/Selected).
- `POST /api/auctions`: Create a new auction listing.
- `GET /api/auctions/:id`: Get detailed information about a specific auction.
- `POST /api/auctions/:id/bids`: Place a sealed bid.
- `POST /api/auctions/:id/reveal`: Reveal your bid during the reveal phase.
- `POST /api/auctions/:id/close`: Finalize an auction (Creator only).

## 💻 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/ankuaru-auction-mvp.git
    cd ankuaru-auction-mvp
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add the following:
    ```env
    NEXT_PUBLIC_API_BASE_URL=https://testauction.ankuaru.com
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The app will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
npm start
```

## 📝 Documentation

A Postman collection is available in the root directory (`Ankuaru_Auction_Backend.postman_collection.json`) for detailed API testing and documentation of request/response structures.

## 📄 License

This project is proprietary and confidential. All rights reserved.
