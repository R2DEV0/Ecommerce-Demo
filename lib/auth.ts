import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'subscriber' | 'manager';
  parent_user_id?: number;
  can_add_users: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [decoded.id]
    });
    const user = result.rows[0] as any;
    if (!user) return null;
    return {
      id: Number(user.id),
      email: user.email as string,
      name: user.name as string,
      role: user.role as 'admin' | 'subscriber' | 'manager',
      parent_user_id: user.parent_user_id ? Number(user.parent_user_id) : undefined,
      can_add_users: Number(user.can_add_users),
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return user;
}

export function canUserAddUsers(user: User): boolean {
  return user.role === 'admin' || user.can_add_users === 1;
}

export async function canUserManageUser(user: User, targetUserId: number): Promise<boolean> {
  if (user.role === 'admin') return true;
  if (user.can_add_users === 1) {
    // Check if target user is under this user
    const result = await db.execute({
      sql: 'SELECT parent_user_id FROM users WHERE id = ?',
      args: [targetUserId]
    });
    const targetUser = result.rows[0] as any;
    return targetUser?.parent_user_id === user.id;
  }
  return false;
}
