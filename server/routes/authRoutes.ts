import type { Express } from "express";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth";
import { generateToken, hashPassword, comparePassword, setAuthCookie, clearAuthCookie } from "../services/auth";
import { storage } from "../storage";
import { registerSchema, loginSchema } from "../schemas/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

export function registerAuthRoutes(app: Express) {
  // Configure multer for avatar uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      const { name, email, password, role } = parsed.data;

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        name,
        email,
        role,
        passwordHash
      });

      // Generate token and set cookie
      const token = generateToken({ id: user.id, role: user.role, email: user.email });
      setAuthCookie(res, token);

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      const { email, password } = parsed.data;

      // Find user and verify password
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await comparePassword(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token and set cookie
      const token = generateToken({ id: user.id, role: user.role, email: user.email });
      setAuthCookie(res, token);

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    clearAuthCookie(res);
    res.json({ success: true });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({
      user: {
        id: req.user!.id,
        name: req.user!.name,
        email: req.user!.email,
        role: req.user!.role
      }
    });
  });

  // Google OAuth routes (simplified - in production, use passport-google-oauth20)
  app.get('/api/auth/google', (req, res) => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_OAUTH_CALLBACK_URL || '')}&` +
      `scope=profile email&` +
      `response_type=code`;

    res.redirect(googleAuthUrl);
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    // This is a simplified implementation
    // In production, you would exchange the code for tokens and get user info
    res.redirect('/login?google_auth=success');
  });

  // Profile management routes
  app.put('/api/auth/profile', requireAuth, upload.single('avatar'), async (req: AuthenticatedRequest, res) => {
    try {
      const { name, email } = req.body;
      const userId = req.user!.id;

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ error: 'Email already in use by another account' });
        }
      }

      // Update user profile
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await storage.updateUser(userId, {
        name: name || currentUser.name,
        email: email || currentUser.email
      });

      if (!updatedUser) {
        return res.status(404).json({ error: 'Failed to update user' });
      }

      // Handle avatar upload if present
      if (req.file) {
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
          const extension = req.file.mimetype.split('/')[1];
          const fileName = `${userId}.${extension}`;
          const filePath = path.join(uploadDir, fileName);

          // Ensure directory exists
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          // Save avatar file
          fs.writeFileSync(filePath, req.file.buffer);
        } catch (error) {
          console.error('Avatar upload error:', error);
          return res.status(500).json({ error: 'Failed to upload avatar' });
        }
      }

      res.json({
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.put('/api/auth/change-password', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      // Get user and verify current password
      const user = await storage.getUser(userId);
      if (!user || !user.passwordHash) {
        return res.status(404).json({ error: 'User not found' });
      }

      const validPassword = await comparePassword(currentPassword, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password and update
      const newPasswordHash = await hashPassword(newPassword);
      await storage.updateUser(userId, { passwordHash: newPasswordHash });

      res.json({ success: true });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  });

  app.get('/api/auth/avatar/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      const avatarDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');

      // Try different image formats
      const extensions = ['jpg', 'jpeg', 'png', 'gif'];
      let avatarPath = null;

      for (const ext of extensions) {
        const filePath = path.join(avatarDir, `${userId}.${ext}`);
        if (fs.existsSync(filePath)) {
          avatarPath = filePath;
          break;
        }
      }

      if (!avatarPath) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      res.sendFile(avatarPath);
    } catch (error) {
      console.error('Get avatar error:', error);
      res.status(500).json({ error: 'Failed to get avatar' });
    }
  });
}