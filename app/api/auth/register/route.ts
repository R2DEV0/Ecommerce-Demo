import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, createToken, getCurrentUser, canUserAddUsers } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'subscriber', parent_user_id } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Check permissions
    const currentUser = await getCurrentUser();
    let finalParentId = parent_user_id;
    let canAddUsers = 0;

    if (currentUser) {
      if (!canUserAddUsers(currentUser)) {
        return NextResponse.json(
          { error: 'You do not have permission to add users' },
          { status: 403 }
        );
      }
      if (!finalParentId) {
        finalParentId = currentUser.id;
      }
    } else {
      // Public registration - only subscribers allowed
      if (role !== 'subscriber') {
        return NextResponse.json(
          { error: 'Invalid role for public registration' },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await hashPassword(password);

    const result = db.prepare(`
      INSERT INTO users (email, password, name, role, parent_user_id, can_add_users)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(email, hashedPassword, name, role, finalParentId || null, canAddUsers);

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as any;

    const token = createToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      parent_user_id: newUser.parent_user_id,
      can_add_users: newUser.can_add_users,
    });

    const response = NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

