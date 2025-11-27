import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';

export default async function AdminAnnouncementsPage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  const announcements = db.prepare(`
    SELECT a.*, u.name as author_name
    FROM announcements a
    LEFT JOIN users u ON a.author_id = u.id
    ORDER BY a.created_at DESC
  `).all() as any[];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-normal text-[#1d2327]">Announcements</h1>
        <Link
          href="/admin/announcements/new"
          className="bg-[#2271b1] text-white px-4 py-2 rounded-sm hover:bg-[#135e96] transition-colors font-normal text-sm"
        >
          Add New
        </Link>
      </div>
      <div className="bg-white border border-[#c3c4c7] rounded-sm overflow-hidden">
        <table className="min-w-full divide-y divide-[#c3c4c7]">
          <thead className="bg-[#f6f7f7]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#c3c4c7]">
            {announcements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#646970]">
                  No announcements found
                </td>
              </tr>
            ) : (
              announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-[#f6f7f7]">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[#1d2327]">{announcement.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#1d2327]">{announcement.author_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      announcement.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {announcement.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#1d2327]">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/admin/announcements/${announcement.id}`} className="text-[#2271b1] hover:text-[#135e96]">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

