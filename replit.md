# Digital Assignment Platform

## Overview

This is a full-stack digital assignment platform built for educational institutions, featuring voice-to-text capabilities, NLP-powered evaluation, and comprehensive proctoring features. The application serves both teachers and students with role-based dashboards and assignment management.

## User Preferences

- Preferred communication style: Simple, everyday language
- Server architecture: Must use MVC pattern for easier future editing
- Deployment target: Render or Heroku compatible
- Assignment features: Must include faculty name, college name, subject name, subject code, start & end dates
- Auto-cleanup: Expired assignments should auto-delete after end date

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Voice Integration**: Web Speech API for client-side speech-to-text functionality

### Backend Architecture (MVC Pattern)
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Architecture**: Model-View-Controller (MVC) pattern for maintainability
- **Controllers**: Handle HTTP requests and responses (`server/controllers/`)
- **Services**: Business logic and data processing (`server/services/`)
- **Models**: Data schemas and storage interface (`shared/schema.ts`, `server/storage.ts`)
- **API Design**: RESTful API with structured error handling
- **Authentication**: JWT tokens stored in HTTP-only cookies with bcrypt password hashing
- **Validation**: Zod schemas shared between client and server
- **Data Storage**: In-memory storage implementation with PostgreSQL schema definitions using Drizzle ORM

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Shared schema definitions in TypeScript covering users, assignments, and submissions
- **Migrations**: Managed through Drizzle Kit
- **Connection**: Neon Database serverless PostgreSQL

### Authentication & Authorization
- **Strategy**: JWT-based authentication with role-based access control (teacher/student)
- **Session Management**: HTTP-only cookies for secure token storage
- **Password Security**: bcrypt hashing with salt rounds
- **Route Protection**: Middleware-based authentication and role checking

### Voice & NLP Features
- **Speech Recognition**: Browser-native Web Speech API implementation
- **Text Similarity**: Server-side NLP processing for answer evaluation using cosine similarity
- **Transcript Management**: Real-time voice-to-text conversion with interim results

### Proctoring System
- **Browser Controls**: JavaScript-based prevention of copy/paste, context menus, and text selection
- **Activity Monitoring**: Tab change detection and visibility change tracking
- **Session Management**: Timer-based session control with automatic submission

### Development & Build
- **Build System**: Vite for frontend bundling with esbuild for server builds
- **Development**: Hot module replacement with Vite middleware integration
- **TypeScript**: Strict type checking across the entire codebase
- **Path Aliases**: Organized imports with @ aliases for client code and @shared for common modules
- **Deployment**: Ready for Render and Heroku with proper build scripts and configuration files

## External Dependencies

### UI & Design
- **Radix UI**: Complete set of accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant generation for component styling

### Development Tools
- **Vite**: Modern build tool with HMR and optimized production builds
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for server-side builds

### Database & Backend
- **Neon Database**: Serverless PostgreSQL with built-in connection pooling
- **Drizzle ORM**: Type-safe SQL toolkit with schema management
- **Express.js**: Web framework with cookie parsing and CORS support

### Authentication & Security
- **jsonwebtoken**: JWT implementation for stateless authentication
- **bcrypt**: Password hashing library for secure credential storage
- **cookie-parser**: Express middleware for cookie handling

### State Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Schema validation for runtime type safety

### Voice Processing
- **Web Speech API**: Browser-native speech recognition capabilities
- **Custom Voice Recorder**: Wrapper around SpeechRecognition API for enhanced functionality