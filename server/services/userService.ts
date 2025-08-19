import { storage } from '../storage';
import type { User, InsertUser } from '@shared/schema';

export class UserService {
  async createUser(userData: InsertUser): Promise<User> {
    return storage.createUser(userData);
  }

  async getUserById(id: string): Promise<User | null> {
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