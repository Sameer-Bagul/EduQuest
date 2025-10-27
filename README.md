# Digital Assignment Platform

A comprehensive educational assignment platform with voice-to-text capabilities, NLP-powered evaluation, and real-time proctoring features.

## Features

- **Authentication System**: JWT-based authentication with Google OAuth integration
- **Role-Based Access**: Separate dashboards for teachers and students
- **Assignment Management**: Create, manage, and auto-delete expired assignments
- **Voice-to-Text**: Browser-native speech recognition for assignment submissions
- **NLP Evaluation**: Automatic answer scoring using cosine similarity algorithms
- **Proctoring System**: Copy/paste blocking, tab monitoring, and session timers
- **Responsive Design**: Modern UI with shadcn/ui components

## Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **TanStack Query** for server state management
- **Wouter** for client-side routing

### Backend (MVC Architecture)
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **JWT** authentication with HTTP-only cookies
- **bcrypt** for password hashing
- **Zod** for validation
- **MongoDB Atlas** for data persistence

## Quick Start

### Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digital-assignment-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## Deployment

### Deploy to Render

1. **Using render.yaml (Recommended)**
   - Push code to GitHub
   - Connect repository to Render
   - The `render.yaml` file will automatically configure the deployment

2. **Manual Deployment**
   - Create a new Web Service on Render
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Set environment variables as needed

### Deploy to Heroku

1. **Using app.json (Recommended)**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

2. **Manual Deployment**
   ```bash
   # Install Heroku CLI
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=$(openssl rand -base64 32)
   git push heroku main
   ```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and API client
├── server/                 # Backend Express application (MVC)
│   ├── controllers/        # Route handlers (MVC Controllers)
│   ├── services/           # Business logic (MVC Services)
│   ├── middleware/         # Express middleware
│   └── routes/             # API route definitions
├── shared/                 # Shared types and schemas
└── deployment files        # Render, Heroku, and Docker configs
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth login

### Assignments (Teachers)
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/teacher` - Get teacher's assignments
- `DELETE /api/assignments/:id` - Delete assignment

### Assignments (Students)
- `GET /api/assignments/code/:code` - Get assignment by code

### Submissions
- `POST /api/submissions` - Submit assignment
- `GET /api/submissions/student` - Get student submissions
- `GET /api/submissions/assignment/:id` - Get assignment submissions

## Environment Variables

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secret-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduquest
CORS_ORIGIN=*
USE_CRON_FALLBACK=true

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_OAUTH_CALLBACK_URL=https://your-domain.com/api/auth/google/callback

# Optional: Razorpay Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

## Features in Detail

### Voice-to-Text Integration
- Uses Web Speech API for real-time speech recognition
- Supports continuous recording with interim results
- Automatic transcript cleanup and formatting

### NLP-Powered Evaluation
- Cosine similarity algorithm for answer comparison
- Configurable similarity thresholds
- Detailed scoring breakdown for each question

### Proctoring System
- Prevents copy/paste operations during assignments
- Detects tab changes and window focus loss
- Automatic timer management with warnings
- Session security controls

### Assignment Management
- 6-digit unique assignment codes
- Flexible start and end date scheduling
- Auto-deletion of expired assignments
- Faculty and subject metadata tracking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For deployment issues or questions:
- Check the deployment logs in your hosting platform
- Ensure all environment variables are properly set
- Verify that the build process completes successfully

For technical support, please open an issue in the repository.