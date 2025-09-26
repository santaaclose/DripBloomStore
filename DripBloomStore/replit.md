# Overview

This is a full-stack e-commerce application called "Drip Bloom" built for Telegram mini-apps. It features a modern React frontend with a Node.js/Express backend, specifically designed to integrate with Telegram's WebApp API. The application allows users to browse products (jewelry/accessories), manage shopping carts, maintain favorites, and complete purchases within the Telegram ecosystem.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a component-based architecture:
- **UI Framework**: Uses shadcn/ui components built on Radix UI primitives for consistent design
- **Styling**: TailwindCSS with custom CSS variables for theming, featuring warm neutral colors with purple/pink accents
- **Routing**: Wouter for client-side routing with mobile-first navigation
- **State Management**: TanStack Query (React Query) for server state and caching
- **Mobile-First Design**: Bottom navigation pattern optimized for mobile devices and Telegram WebApp

## Backend Architecture
The backend follows a REST API pattern with Express.js:
- **Server Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for products, categories, cart, favorites, and orders
- **Development Setup**: Vite for hot module replacement and development server integration
- **Error Handling**: Centralized error handling middleware with structured JSON responses
- **Request Logging**: Custom middleware for API request/response logging

## Data Storage Solutions
The application uses PostgreSQL with Drizzle ORM:
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Design**: Relational structure with users, products, categories, cart items, favorites, and orders
- **Migrations**: Drizzle Kit for database schema management
- **Validation**: Zod schemas integrated with Drizzle for runtime type checking

## Authentication and Authorization
The system leverages Telegram's built-in authentication:
- **Telegram WebApp**: Uses Telegram's user authentication system
- **User Identification**: Telegram user IDs for user management
- **Session Management**: Relies on Telegram's session handling
- **Authorization**: Simple user-based access control without traditional JWT/session tokens

## External Dependencies

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Telegram WebApp API**: For user authentication and mini-app functionality

### Key Frontend Libraries
- **React Ecosystem**: React 18 with TypeScript, Wouter for routing
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: TailwindCSS with PostCSS for processing
- **State Management**: TanStack Query for server state, React Hook Form for forms
- **Animations**: Framer Motion for smooth interactions and transitions
- **Carousel**: Embla Carousel for product image sliders

### Key Backend Libraries
- **Database**: Drizzle ORM with @neondatabase/serverless driver
- **Validation**: Zod for schema validation and type safety
- **Development**: tsx for TypeScript execution, esbuild for production builds
- **Session Storage**: connect-pg-simple for PostgreSQL session storage

### Build and Development Tools
- **Build System**: Vite for frontend bundling and development server
- **TypeScript**: Full TypeScript support across frontend and backend
- **Development Experience**: Hot module replacement, error overlays, and Replit-specific plugins