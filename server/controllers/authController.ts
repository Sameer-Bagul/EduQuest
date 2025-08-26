import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { registerSchema, loginSchema } from '@shared/schema';
import type { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  private authService: AuthService;
  private userService: UserService;

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
  }

  async register(req: Request, res: Response) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      const { name, email, password, role } = parsed.data;

      // Check if user exists
      const existingUser = await this.userService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      // Hash password and create user
      const passwordHash = await this.authService.hashPassword(password);
      const user = await this.userService.createUser({
        name,
        email,
        role,
        passwordHash
      });

      // Generate token and set cookie
      const token = this.authService.generateToken({ id: user.id, name: user.name, role: user.role, email: user.email });
      this.authService.setAuthCookie(res, token);

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
  }

  async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error });
      }

      const { email, password } = parsed.data;

      // Find user and verify password
      const user = await this.userService.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await this.authService.comparePassword(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token and set cookie
      const token = this.authService.generateToken({ id: user.id, name: user.name, role: user.role, email: user.email });
      this.authService.setAuthCookie(res, token);

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
  }

  async logout(req: Request, res: Response) {
    this.authService.clearAuthCookie(res);
    res.json({ success: true });
  }

  async me(req: AuthenticatedRequest, res: Response) {
    res.json({ 
      user: { 
        id: req.user!.id, 
        name: req.user!.name, 
        email: req.user!.email, 
        role: req.user!.role 
      } 
    });
  }

  async googleAuth(req: Request, res: Response) {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_OAUTH_CALLBACK_URL || '')}&` +
      `scope=profile email&` +
      `response_type=code`;
    
    res.redirect(googleAuthUrl);
  }

  async googleCallback(req: Request, res: Response) {
    // This is a simplified implementation
    // In production, you would exchange the code for tokens and get user info
    res.redirect('/login?google_auth=success');
  }
}