import db, { initDatabase } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Megaphone, Calendar, User } from 'lucide-react';

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
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-900">News & Announcements</h1>
            <p className="text-slate-600 mt-1">Stay updated with the latest news and updates</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {announcements.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <Megaphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No announcements yet</p>
              <p className="text-slate-500 text-sm mt-2">Check back soon for updates</p>
            </div>
          ) : (
            <div className="space-y-6">
              {announcements.map((announcement, index) => (
                <article 
                  key={announcement.id} 
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(announcement.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      {announcement.author_name && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          {announcement.author_name}
                        </div>
                      )}
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                      {announcement.title}
                    </h2>
                    
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
