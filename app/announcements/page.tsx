import db, { initDatabase } from '@/lib/db';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default async function AnnouncementsPage() {
  await initDatabase();
  
  const result = await db.execute(`
    SELECT a.*, u.name as author_name
    FROM announcements a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.status = 'published'
    ORDER BY a.created_at DESC
  `);
  const announcements = result.rows as any[];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">Announcements</h1>
          {announcements.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-gray-600 text-base md:text-lg">No announcements yet.</p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white rounded-lg shadow p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                    <h2 className="text-xl md:text-2xl font-bold">{announcement.title}</h2>
                    <span className="text-xs md:text-sm text-gray-500">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {announcement.author_name && (
                    <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">By {announcement.author_name}</p>
                  )}
                  <div className="prose max-w-none">
                    <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
