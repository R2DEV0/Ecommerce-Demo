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

    // Check if user exists (case-insensitive)
    const existingResult = await db.execute({
      sql: 'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
      args: [email]
    });
    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const result = await db.execute({
      sql: `INSERT INTO users (name, email, password, role, parent_user_id, can_add_users)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        name,
        email,
        hashedPassword,
        role || 'subscriber',
        parent_user_id || null,
        can_add_users || 0
      ]
    });

    return NextResponse.json({ success: true, userId: Number(result.lastInsertRowid) });
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
