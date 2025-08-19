import { build } from 'esbuild';
import { execSync } from 'child_process';

// Build client first
console.log('Building client...');
execSync('npx vite build', { stdio: 'inherit' });

// Build server
console.log('Building server...');
build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/server/index.js',
  format: 'esm',
  external: [
    '@replit/*',
    'express',
    'cors',
    'cookie-parser',
    'bcrypt',
    'jsonwebtoken',
    '@neondatabase/serverless',
    'drizzle-orm',
    'drizzle-kit',
    'zod',
    'zod-validation-error'
  ],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}).then(() => {
  console.log('Server build complete!');
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});