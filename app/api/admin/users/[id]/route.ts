import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { name, email, password, role, parent_user_id, can_add_users } = await request.json();
    const { id } = await params;
    const userId = parseInt(id);

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email is taken by another user
    const existingResult = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ? AND id != ?',
      args: [email, userId]
    });
    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Build update query based on whether password is being updated
    if (password && password.length >= 6) {
      // Update with password
      const hashedPassword = await hashPassword(password);
      await db.execute({
        sql: `UPDATE users 
              SET name = ?, email = ?, password = ?, role = ?, parent_user_id = ?, can_add_users = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [name, email, hashedPassword, role || 'subscriber', parent_user_id || null, can_add_users || 0, userId]
      });
    } else {
      // Update without password
      await db.execute({
        sql: `UPDATE users 
              SET name = ?, email = ?, role = ?, parent_user_id = ?, can_add_users = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [name, email, role || 'subscriber', parent_user_id || null, can_add_users || 0, userId]
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const userId = parseInt(id);

    // Check if user exists
    const userResult = await db.execute({
      sql: 'SELECT id FROM users WHERE id = ?',
      args: [userId]
    });
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user (cascade will handle related records)
    await db.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [userId]
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('User delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
