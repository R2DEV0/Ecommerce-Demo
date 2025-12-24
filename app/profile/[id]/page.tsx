import db, { initDatabase } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  BookOpen, 
  ShoppingBag,
  CheckCircle2,
  Clock,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await initDatabase();
  
  const { id } = await params;
  const profileUserId = parseInt(id);
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    notFound();
  }
  
  if (currentUser.id !== profileUserId && currentUser.role !== 'admin') {
    redirect(`/profile/${currentUser.id}`);
  }

  const userResult = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [profileUserId] });
  const user = userResult.rows[0] as any;
  if (!user) {
    notFound();
  }

  const enrollmentsResult = await db.execute({
    sql: `SELECT ce.*, c.title as course_title, c.id as course_id, c.image_url
          FROM course_enrollments ce
          JOIN courses c ON ce.course_id = c.id
          WHERE ce.user_id = ?
          ORDER BY ce.enrolled_at DESC`,
    args: [profileUserId]
  });
  const enrollments = enrollmentsResult.rows as any[];

  const certificatesResult = await db.execute({
    sql: `SELECT cert.*, c.title as course_title
          FROM certificates cert
          JOIN courses c ON cert.course_id = c.id
          WHERE cert.user_id = ?
          ORDER BY cert.issued_at DESC`,
    args: [profileUserId]
  });
  const certificates = certificatesResult.rows as any[];

  const ordersResult = await db.execute({
    sql: `SELECT o.*, COUNT(oi.id) as item_count
          FROM orders o
          LEFT JOIN order_items oi ON o.id = oi.order_id
          WHERE o.user_id = ?
          GROUP BY o.id
          ORDER BY o.created_at DESC
          LIMIT 5`,
    args: [profileUserId]
  });
  const orders = ordersResult.rows as any[];

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const completedCourses = enrollments.filter((e: any) => e.completed).length;
  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum: number, e: any) => sum + Number(e.progress), 0) / enrollments.length)
    : 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-xl border border-white/20">
                {initials}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{user.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-indigo-100 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span className="capitalize">{user.role}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-16 relative z-10 mb-8">
            {[
              { label: 'Enrolled', value: enrollments.length, icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
              { label: 'Completed', value: completedCourses, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
              { label: 'Certificates', value: certificates.length, icon: GraduationCap, color: 'from-purple-500 to-pink-500' },
              { label: 'Progress', value: `${totalProgress}%`, icon: Clock, color: 'from-orange-500 to-amber-500' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* My Courses */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    My Courses
                  </h2>
                  <Link href="/courses" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                    Browse more <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                
                {enrollments.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No course enrollments yet</p>
                    <Link href="/courses" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm transition-colors">
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => (
                      <Link
                        key={enrollment.id}
                        href={`/courses/${enrollment.course_id}`}
                        className="flex gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all group"
                      >
                        {enrollment.image_url ? (
                          <img src={enrollment.image_url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1 truncate">
                            {enrollment.course_title}
                          </h3>
                          <p className="text-xs text-slate-500 mb-3">
                            Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${enrollment.completed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-600">{enrollment.progress}%</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              {orders.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-indigo-600" />
                      Recent Orders
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div>
                          <p className="font-medium text-slate-900">Order #{order.id}</p>
                          <p className="text-xs text-slate-500">
                            {order.item_count} item{order.item_count !== 1 ? 's' : ''} • {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">${parseFloat(order.total_amount).toFixed(2)}</p>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Account Settings
                </h2>
                <PasswordChangeForm />
              </div>

              {/* Certificates */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Certificates
                </h2>
                {certificates.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">No certificates earned yet</p>
                    <p className="text-xs text-slate-500 mt-1">Complete courses to earn certificates!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-900 text-sm mb-1">{cert.course_title}</h3>
                            <p className="text-xs text-slate-500">
                              Issued {new Date(cert.issued_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-2xl">🎓</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
