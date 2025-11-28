import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export default async function AdminOrdersPage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  const orders = db.prepare(`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `).all() as any[];

  return (
    <div className="w-full max-w-full">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-normal text-[#1d2327]">Orders</h1>
      </div>
      <div className="bg-white border border-[#c3c4c7] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#c3c4c7]">
            <thead className="bg-[#f6f7f7]">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Order ID</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Customer</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider hidden sm:table-cell">Total</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Status</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-[#646970] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#c3c4c7]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 md:px-6 py-6 md:py-8 text-center text-xs md:text-sm text-[#646970]">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f6f7f7]">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="text-xs md:text-sm font-medium text-[#1d2327]">#{order.id}</div>
                      <div className="text-xs text-[#646970] sm:hidden mt-1">${parseFloat(order.total_amount).toFixed(2)}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="text-xs md:text-sm text-[#1d2327]">{order.user_name || 'N/A'}</div>
                      <div className="text-xs text-[#646970] hidden md:block">{order.user_email || ''}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                      <div className="text-xs md:text-sm font-medium text-[#1d2327]">${parseFloat(order.total_amount).toFixed(2)}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <div className="text-xs md:text-sm text-[#1d2327]">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <Link 
                        href={`/admin/orders/${order.id}`} 
                        className="p-1.5 md:p-2 text-[#2271b1] hover:text-[#135e96] hover:bg-blue-50 rounded transition-colors inline-block"
                        title="View order"
                        aria-label="View order"
                      >
                        <Eye className="w-4 h-4 md:w-5 md:h-5" />
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

