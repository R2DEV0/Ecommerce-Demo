import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db, { initDatabase } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

import { 
  Package, 
  BookOpen, 
  Users, 
  Megaphone, 
  Video, 
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Plus,
  ArrowUpRight
} from 'lucide-react';

export default async function AdminPage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  await initDatabase();

  // Get stats
  const totalUsersResult = await db.execute('SELECT COUNT(*) as count FROM users');
  const totalProductsResult = await db.execute('SELECT COUNT(*) as count FROM products');
  const totalCoursesResult = await db.execute('SELECT COUNT(*) as count FROM courses');
  const totalAnnouncementsResult = await db.execute('SELECT COUNT(*) as count FROM announcements');
  const totalWebinarsResult = await db.execute('SELECT COUNT(*) as count FROM webinars');
  const totalOrdersResult = await db.execute('SELECT COUNT(*) as count FROM orders');
  const totalRevenueResult = await db.execute({ sql: 'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = ?', args: ['completed'] });
  const pendingOrdersResult = await db.execute({ sql: 'SELECT COUNT(*) as count FROM orders WHERE status = ?', args: ['pending'] });

  const totalUsers = (totalUsersResult.rows[0] as any)?.count || 0;
  const totalProducts = (totalProductsResult.rows[0] as any)?.count || 0;
  const totalCourses = (totalCoursesResult.rows[0] as any)?.count || 0;
  const totalAnnouncements = (totalAnnouncementsResult.rows[0] as any)?.count || 0;
  const totalWebinars = (totalWebinarsResult.rows[0] as any)?.count || 0;
  const totalOrders = (totalOrdersResult.rows[0] as any)?.count || 0;
  const totalRevenue = (totalRevenueResult.rows[0] as any)?.total || 0;
  const pendingOrders = (pendingOrdersResult.rows[0] as any)?.count || 0;

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/20',
      href: '/admin/users',
    },
    {
      label: 'Products',
      value: totalProducts,
      icon: Package,
      gradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/20',
      href: '/admin/products',
    },
    {
      label: 'Courses',
      value: totalCourses,
      icon: BookOpen,
      gradient: 'from-violet-500 to-purple-500',
      shadowColor: 'shadow-violet-500/20',
      href: '/admin/courses',
    },
    {
      label: 'Total Revenue',
      value: `$${parseFloat(totalRevenue.toString()).toFixed(0)}`,
      icon: DollarSign,
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/20',
      href: '/admin/orders',
    },
  ];

  const secondaryStats = [
    { label: 'Announcements', value: totalAnnouncements, icon: Megaphone, href: '/admin/announcements' },
    { label: 'Webinars', value: totalWebinars, icon: Video, href: '/admin/webinars' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, href: '/admin/orders' },
    { label: 'Pending Orders', value: pendingOrders, icon: TrendingUp, href: '/admin/orders' },
  ];

  const quickActions = [
    { label: 'Add Product', description: 'Create a new product', href: '/admin/products/new', icon: Package },
    { label: 'Add Course', description: 'Create a new course', href: '/admin/courses/new', icon: BookOpen },
    { label: 'Add User', description: 'Create user account', href: '/admin/users/new', icon: Users },
    { label: 'New Announcement', description: 'Publish an update', href: '/admin/announcements/new', icon: Megaphone },
    { label: 'Schedule Webinar', description: 'Plan a webinar', href: '/admin/webinars/new', icon: Video },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back! 👋</h1>
        <p className="mt-1 text-slate-500">Here&apos;s what&apos;s happening with your platform today.</p>
      </div>
      
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`group relative bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-xl ${stat.shadowColor}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-slate-500 group-hover:text-indigo-600 transition-colors">
                <span>View details</span>
                <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group bg-white rounded-xl p-4 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-indigo-100 transition-colors">
                  <Icon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <p className="text-sm text-slate-500">Get started with common tasks</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex flex-col items-center p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200"
              >
                <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-indigo-100 transition-colors mb-3">
                  <Icon className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                </div>
                <span className="font-medium text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{action.label}</span>
                <span className="text-xs text-slate-500 mt-0.5">{action.description}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
