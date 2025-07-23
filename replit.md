# FoodFlow - Food Delivery Application

## Overview

FoodFlow is a comprehensive food delivery application built with a modern tech stack, featuring role-based access for customers, vendors, drivers, and administrators. The application provides a seamless platform for food ordering, delivery management, and business operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
- **Frontend**: Vite + React + TypeScript with Tailwind CSS for styling
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **UI Components**: Radix UI components with shadcn/ui design system

### Database Strategy
The application uses PostgreSQL as the primary database with Drizzle ORM providing type-safe queries and migrations. The database is configured to work with Neon Database (serverless PostgreSQL) and includes connection pooling for optimal performance.

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Role-Based Access**: Four distinct user roles (customer, vendor, driver, admin)
- **Authorization**: Route-level protection based on user roles

### Frontend Architecture
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: Modular component architecture with shared UI components

### Backend Architecture
- **API Structure**: RESTful endpoints organized by resource type
- **Data Layer**: Storage abstraction layer with interface-based design
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Middleware**: Express middleware for logging, parsing, and authentication

### Database Schema
The application uses a comprehensive schema with the following main entities:
- **Users**: Authentication and profile information with role-based access
- **Restaurants**: Vendor business information and settings
- **Menu Items**: Product catalog with pricing and availability
- **Orders**: Transaction records with status tracking
- **Order Items**: Line items for order details
- **Deliveries**: Delivery tracking and driver assignment

## Data Flow

### Authentication Flow
1. User authenticates through Replit OAuth
2. User profile is created/updated in the database
3. Session is established with role-based permissions
4. Frontend receives user context and enables role-specific features

### Order Management Flow
1. Customer browses restaurants and menu items
2. Items are added to cart with quantity and customizations
3. Order is created with payment and delivery information
4. Vendor receives order notification and can update preparation status
5. Driver is assigned for delivery and can track progress
6. Real-time status updates are provided to all stakeholders

### Data Persistence
- All data operations go through the storage layer abstraction
- Drizzle ORM provides type safety and migration management
- Database connections are pooled for performance optimization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon Database
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state management and validation
- **zod**: Runtime type validation and schema definition

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

### Authentication & Session
- **openid-client**: OpenID Connect client for authentication
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Build Process
- **Development**: Vite dev server with HMR for frontend, tsx for backend development
- **Production**: Vite builds frontend assets, ESBuild bundles backend for Node.js deployment
- **Database**: Drizzle Kit handles schema migrations and database setup

### Environment Configuration
- **Database**: Requires DATABASE_URL environment variable for PostgreSQL connection
- **Authentication**: Requires Replit-specific environment variables (REPL_ID, SESSION_SECRET, etc.)
- **Deployment**: Designed for Replit environment with specific integrations

### Static Asset Handling
- Frontend assets are built to `dist/public` directory
- Backend serves static files in production mode
- Development mode uses Vite's middleware for asset serving

The application is architected as a monorepo with clear separation between client, server, and shared code, enabling efficient development and deployment while maintaining type safety throughout the entire stack.