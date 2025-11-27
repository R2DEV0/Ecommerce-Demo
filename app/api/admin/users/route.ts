import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { name, email, password, role, parent_user_id, can_add_users } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, parent_user_id, can_add_users)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      name,
      email,
      hashedPassword,
      role || 'subscriber',
      parent_user_id || null,
      can_add_users || 0
    );

    return NextResponse.json({ success: true, userId: result.lastInsertRowid });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

