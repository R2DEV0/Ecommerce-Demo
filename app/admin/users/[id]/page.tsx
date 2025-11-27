import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';
import UserForm from '@/components/UserForm';

export default async function EditUserPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(parseInt(params.id)) as any;
  
  if (!targetUser) {
    notFound();
  }

  // Remove password from user object
  const { password, ...userWithoutPassword } = targetUser;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit User</h1>
          <UserForm user={userWithoutPassword} />
        </div>
      </div>
    </>
  );
}

