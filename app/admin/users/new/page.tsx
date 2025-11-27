import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import UserForm from '@/components/UserForm';

export default async function NewUserPage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Add New User</h1>
          <UserForm />
        </div>
      </div>
    </>
  );
}

