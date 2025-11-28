import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { 
  Package, 
  BookOpen, 
  Users, 
  Megaphone, 
  Video, 
  ShoppingCart,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default async function AdminPage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  // Get stats
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  const totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get() as { count: number };
  const totalAnnouncements = db.prepare('SELECT COUNT(*) as count FROM announcements').get() as { count: number };
  const totalWebinars = db.prepare('SELECT COUNT(*) as count FROM webinars').get() as { count: number };
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
  const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = ?').get('completed') as { total: number };
  const pendingOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('pending') as { count: number };
  const completedOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('completed') as { count: number };

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers.count,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin/users',
    },
    {
      label: 'Products',
      value: totalProducts.count,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/admin/products',
    },
    {
      label: 'Courses',
      value: totalCourses.count,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin/courses',
    },
    {
      label: 'Announcements',
      value: totalAnnouncements.count,
      icon: Megaphone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/admin/announcements',
    },
    {
      label: 'Webinars',
      value: totalWebinars.count,
      icon: Video,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      href: '/admin/webinars',
    },
    {
      label: 'Total Orders',
      value: totalOrders.count,
      icon: ShoppingCart,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      href: '/admin/orders',
    },
    {
      label: 'Pending Orders',
      value: pendingOrders.count,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: '/admin/orders',
    },
    {
      label: 'Total Revenue',
      value: `$${parseFloat(totalRevenue.total.toString()).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      href: '/admin/orders',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-normal mb-6 text-[#1d2327]">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white border border-[#c3c4c7] rounded-sm p-4 md:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-[#646970] mb-1">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-semibold text-[#1d2327] truncate">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-2 md:p-3 rounded-full flex-shrink-0 ml-2`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-4 md:p-6">
        <h2 className="text-base md:text-lg font-normal mb-3 md:mb-4 text-[#1d2327]">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Link
            href="/admin/products/new"
            className="border border-[#c3c4c7] rounded-sm p-3 md:p-4 hover:bg-[#f6f7f7] transition-colors"
          >
            <h3 className="font-medium text-sm md:text-base text-[#1d2327] mb-1">Add New Product</h3>
            <p className="text-xs md:text-sm text-[#646970]">Create a new product for your shop</p>
          </Link>
          <Link
            href="/admin/courses/new"
            className="border border-[#c3c4c7] rounded-sm p-3 md:p-4 hover:bg-[#f6f7f7] transition-colors"
          >
            <h3 className="font-medium text-sm md:text-base text-[#1d2327] mb-1">Add New Course</h3>
            <p className="text-xs md:text-sm text-[#646970]">Create a new course with lessons</p>
          </Link>
          <Link
            href="/admin/users/new"
            className="border border-[#c3c4c7] rounded-sm p-3 md:p-4 hover:bg-[#f6f7f7] transition-colors"
          >
            <h3 className="font-medium text-sm md:text-base text-[#1d2327] mb-1">Add New User</h3>
            <p className="text-xs md:text-sm text-[#646970]">Create a new user account</p>
          </Link>
          <Link
            href="/admin/announcements/new"
            className="border border-[#c3c4c7] rounded-sm p-3 md:p-4 hover:bg-[#f6f7f7] transition-colors"
          >
            <h3 className="font-medium text-sm md:text-base text-[#1d2327] mb-1">Create Announcement</h3>
            <p className="text-xs md:text-sm text-[#646970]">Publish a new announcement</p>
          </Link>
          <Link
            href="/admin/webinars/new"
            className="border border-[#c3c4c7] rounded-sm p-3 md:p-4 hover:bg-[#f6f7f7] transition-colors"
          >
            <h3 className="font-medium text-sm md:text-base text-[#1d2327] mb-1">Schedule Webinar</h3>
            <p className="text-xs md:text-sm text-[#646970]">Schedule a new webinar</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

