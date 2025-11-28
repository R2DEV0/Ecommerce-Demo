import { redirect } from 'next/navigation';
import { requireAdmin, getCurrentUser } from '@/lib/auth';
import AnnouncementForm from '@/components/AnnouncementForm';

export default async function NewAnnouncementPage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  return (
    <div className="w-full max-w-full">
      <h1 className="text-xl md:text-2xl font-normal mb-3 md:mb-6 text-[#1d2327]">Create Announcement</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-3 sm:p-4 md:p-6 w-full max-w-full">
        <AnnouncementForm />
      </div>
    </div>
  );
}

