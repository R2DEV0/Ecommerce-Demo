import { redirect } from 'next/navigation';
import { requireAdmin, getCurrentUser } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import AnnouncementForm from '@/components/AnnouncementForm';

export default async function NewAnnouncementPage() {
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
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Create Announcement</h1>
          <AnnouncementForm />
        </div>
      </div>
    </>
  );
}

