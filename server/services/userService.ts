import { storage } from '../storage';
import type { User, InsertUser } from '../Models/user';

export class UserService {
  async createUser(userData: InsertUser): Promise<User> {
    if (!userData.email || !userData.name || !userData.role) {
      throw new Error('Missing required user data fields');
    }
    if (!['teacher', 'student'].includes(userData.role)) {
      throw new Error('Invalid role');
    }
    return storage.createUser(userData);
  }

  async getUserById(id: string): Promise<User | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid user ID');
    }
    const user = await storage.getUser(id);
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await storage.getUserByEmail(email);
    return user || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await storage.updateUser(id, updates);
    return user || null;
  }
}