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
    <div>
      <h1 className="text-2xl font-normal mb-6 text-[#1d2327]">Create Announcement</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-6">
        <AnnouncementForm />
      </div>
    </div>
  );
}

