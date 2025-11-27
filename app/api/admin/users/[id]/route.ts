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

    let updateQuery = `
      UPDATE users 
      SET name = ?, email = ?, role = ?, parent_user_id = ?, can_add_users = ?, updated_at = CURRENT_TIMESTAMP
    `;
    const updateParams: any[] = [name, email, role || 'subscriber', parent_user_id || null, can_add_users || 0];

    // Only update password if provided
    if (password && password.length >= 6) {
      const hashedPassword = await hashPassword(password);
      updateQuery = updateQuery.replace('updated_at', 'password = ?, updated_at');
      updateParams.splice(3, 0, hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(userId);

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

