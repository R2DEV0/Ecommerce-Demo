import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';
import AnnouncementForm from '@/components/AnnouncementForm';

export default async function EditAnnouncementPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(parseInt(params.id)) as any;
  
  if (!announcement) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Announcement</h1>
          <AnnouncementForm announcement={announcement} />
        </div>
      </div>
    </>
  );
}

