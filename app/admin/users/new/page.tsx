import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import UserForm from '@/components/UserForm';

export default async function NewUserPage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-normal mb-4 md:mb-6 text-[#1d2327]">Add New User</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-4 md:p-6">
        <UserForm />
      </div>
    </div>
  );
}

