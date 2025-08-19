import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the client dist directory
app.use(express.static(join(__dirname, 'dist')));

// For SPA, serve index.html for any non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    // If it's an API route but not handled, return 404
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Import and start the actual server
import('./dist/server/index.js').then(() => {
  console.log(`Production server started on port ${PORT}`);
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});