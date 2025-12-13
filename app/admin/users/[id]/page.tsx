import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db, { initDatabase } from '@/lib/db';
import { notFound } from 'next/navigation';
import UserForm from '@/components/UserForm';

export const dynamic = 'force-dynamic';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    redirect('/login');
  }

  await initDatabase();
  const { id } = await params;

  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [parseInt(id)]
  });
  const targetUser = result.rows[0] as any;
  
  if (!targetUser) {
    notFound();
  }

  // Remove password from user object
  const { password, ...userWithoutPassword } = targetUser;

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-normal mb-4 md:mb-6 text-[#1d2327]">Edit User</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-4 md:p-6">
        <UserForm user={userWithoutPassword} />
      </div>
    </div>
  );
}
