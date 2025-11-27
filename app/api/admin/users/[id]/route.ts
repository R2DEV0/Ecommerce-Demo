import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { name, email, password, role, parent_user_id, can_add_users } = await request.json();
    const userId = parseInt(params.id);

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email is taken by another user
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Build update query based on whether password is being updated
    let updateQuery: string;
    let updateParams: any[];

    if (password && password.length >= 6) {
      // Update with password
      const hashedPassword = await hashPassword(password);
      updateQuery = `
        UPDATE users 
        SET name = ?, email = ?, password = ?, role = ?, parent_user_id = ?, can_add_users = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      updateParams = [name, email, hashedPassword, role || 'subscriber', parent_user_id || null, can_add_users || 0, userId];
    } else {
      // Update without password
      updateQuery = `
        UPDATE users 
        SET name = ?, email = ?, role = ?, parent_user_id = ?, can_add_users = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      updateParams = [name, email, role || 'subscriber', parent_user_id || null, can_add_users || 0, userId];
    }

    db.prepare(updateQuery).run(...updateParams);

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
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const userId = parseInt(params.id);

    // Check if user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user (cascade will handle related records)
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

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

