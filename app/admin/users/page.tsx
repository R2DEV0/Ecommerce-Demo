import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import DeleteUserButton from '@/components/DeleteUserButton';

export default async function AdminUsersPage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  const users = db.prepare(`
    SELECT u.*, 
           parent.name as parent_name
    FROM users u
    LEFT JOIN users parent ON u.parent_user_id = parent.id
    ORDER BY u.created_at DESC
  `).all() as any[];

  return (
    <div className="w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-normal text-[#1d2327]">Users</h1>
        <Link
          href="/admin/users/new"
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
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Name</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Email</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Role</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider hidden md:table-cell">Parent User</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider hidden lg:table-cell">Can Add Users</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#c3c4c7]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 md:px-6 py-6 md:py-8 text-center text-xs md:text-sm text-[#646970]">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f6f7f7]">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="text-xs md:text-sm font-medium text-[#1d2327]">{u.name}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="text-xs md:text-sm text-[#1d2327] break-all">{u.email}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <div className="text-xs md:text-sm text-[#1d2327]">{u.parent_name || '-'}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden lg:table-cell">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        u.can_add_users ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {u.can_add_users ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <Link 
                          href={`/admin/users/${u.id}`} 
                          className="p-1.5 md:p-2 text-[#2271b1] hover:text-[#135e96] hover:bg-blue-50 rounded transition-colors"
                          title="Edit user"
                          aria-label="Edit user"
                        >
                          <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                        </Link>
                        <DeleteUserButton userId={u.id} userName={u.name} />
                      </div>
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

