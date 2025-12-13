import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db, { initDatabase } from '@/lib/db';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

export default async function AdminAnnouncementsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/login');
  }

  await initDatabase();
  const result = await db.execute(`
    SELECT a.*, u.name as author_name
    FROM announcements a
    LEFT JOIN users u ON a.author_id = u.id
    ORDER BY a.created_at DESC
  `);
  const announcements = result.rows as any[];

  return (
    <div className="w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-normal text-[#1d2327]">Announcements</h1>
        <Link
          href="/admin/announcements/new"
          className="bg-[#2271b1] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-sm hover:bg-[#135e96] transition-colors font-normal text-xs md:text-sm whitespace-nowrap"
        >
          Add New
        </Link>
      </div>
      <div className="bg-white border border-[#c3c4c7] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#c3c4c7]">
            <thead className="bg-[#f6f7f7]">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Title</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider hidden md:table-cell">Author</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Status</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider hidden lg:table-cell">Created</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#c3c4c7]">
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 md:px-6 py-6 md:py-8 text-center text-xs md:text-sm text-[#646970]">
                    No announcements found
                  </td>
                </tr>
              ) : (
                announcements.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-[#f6f7f7]">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="text-xs md:text-sm font-medium text-[#1d2327]">{announcement.title}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <div className="text-xs md:text-sm text-[#1d2327]">{announcement.author_name || '-'}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        announcement.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {announcement.status}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden lg:table-cell">
                      <div className="text-xs md:text-sm text-[#1d2327]">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <Link 
                        href={`/admin/announcements/${announcement.id}`} 
                        className="p-1.5 md:p-2 text-[#2271b1] hover:text-[#135e96] hover:bg-blue-50 rounded transition-colors inline-block"
                        title="Edit announcement"
                        aria-label="Edit announcement"
                      >
                        <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
