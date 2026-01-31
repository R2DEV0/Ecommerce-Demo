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
      sql: 'SELECT id, role FROM users WHERE id = ?',
      args: [userId]
    });
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0] as any;
    
    // Prevent deleting yourself
    const currentUser = await requireAdmin();
    if (currentUser.id === userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete related records that don't have CASCADE
    // 1. Delete announcements authored by this user
    await db.execute({
      sql: 'DELETE FROM announcements WHERE author_id = ?',
      args: [userId]
    });

    // 2. Delete orders (order_items will cascade)
    await db.execute({
      sql: 'DELETE FROM orders WHERE user_id = ?',
      args: [userId]
    });

    // 3. Update media to remove uploaded_by reference (set to NULL)
    await db.execute({
      sql: 'UPDATE media SET uploaded_by = NULL WHERE uploaded_by = ?',
      args: [userId]
    });

    // 4. Update child users to remove parent_user_id reference
    await db.execute({
      sql: 'UPDATE users SET parent_user_id = NULL WHERE parent_user_id = ?',
      args: [userId]
    });

    // 5. Now delete the user (cascade will handle course_enrollments, certificates, etc.)
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
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
