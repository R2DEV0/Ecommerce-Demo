import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
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
    <div>
      <h1 className="text-2xl font-normal mb-6 text-[#1d2327]">Edit Announcement</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-6">
        <AnnouncementForm announcement={announcement} />
      </div>
    </div>
  );
}

