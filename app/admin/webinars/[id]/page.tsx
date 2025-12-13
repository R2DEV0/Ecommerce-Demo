import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db, { initDatabase } from '@/lib/db';
import { notFound } from 'next/navigation';
import WebinarForm from '@/components/WebinarForm';

export const dynamic = 'force-dynamic';

export default async function EditWebinarPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    redirect('/login');
  }

  await initDatabase();
  const { id } = await params;

  const result = await db.execute({
    sql: 'SELECT * FROM webinars WHERE id = ?',
    args: [parseInt(id)]
  });
  const webinar = result.rows[0] as any;
  
  if (!webinar) {
    notFound();
  }

  return (
    <div className="w-full max-w-full">
      <h1 className="text-xl md:text-2xl font-normal mb-3 md:mb-6 text-[#1d2327]">Edit Webinar</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-3 sm:p-4 md:p-6 w-full max-w-full">
        <WebinarForm webinar={webinar} />
      </div>
    </div>
  );
}
