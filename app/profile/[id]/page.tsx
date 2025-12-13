import db, { initDatabase } from '@/lib/db';
import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  BookOpen, 
  ShoppingBag,
  CheckCircle2,
  Clock,
  GraduationCap
} from 'lucide-react';

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await initDatabase();
  
  const { id } = await params;
  const profileUserId = parseInt(id);
  const currentUser = await getCurrentUser();
  
  // If not logged in, show 404
  if (!currentUser) {
    notFound();
  }
  
  // Users can only view their own profile unless they're admin
  // If trying to view another user's profile, redirect to their own
  if (currentUser.id !== profileUserId && currentUser.role !== 'admin') {
    redirect(`/profile/${currentUser.id}`);
  }

  const userResult = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [profileUserId]
  });
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

  // Get user initials for avatar
  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Calculate stats
  const completedCourses = enrollments.filter((e: any) => e.completed).length;
  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum: number, e: any) => sum + Number(e.progress), 0) / enrollments.length)
    : 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 md:mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-24 md:h-32"></div>
              <div className="px-4 md:px-8 pb-4 md:pb-8 -mt-12 md:-mt-16">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 md:gap-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl md:text-4xl font-bold shadow-lg border-4 border-white relative z-10">
                      {initials}
                    </div>
                    <div className="pb-2 relative z-10 text-center sm:text-left">
                      <div className="pt-8 md:pt-16">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{user.name}</h1>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <Mail className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="break-all">{user.email}</span>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <User className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="capitalize">{user.role}</span>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="text-center sm:text-left">Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600 mb-1">Enrolled Courses</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{enrollments.length}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{completedCourses}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600 mb-1">Certificates</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{certificates.length}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600 mb-1">Avg. Progress</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalProgress}%</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {/* My Courses */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                      My Courses
                    </h2>
                  </div>
                  {enrollments.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                      <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm md:text-base text-gray-600 mb-4">No course enrollments yet.</p>
                      <Link
                        href="/courses"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                      >
                        Browse Courses
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {enrollments.map((enrollment) => (
                        <Link
                          key={enrollment.id}
                          href={`/courses/${enrollment.course_id}`}
                          className="block border border-gray-200 rounded-lg p-3 md:p-4 hover:border-blue-300 hover:shadow-md transition-all group"
                        >
                          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                            {enrollment.image_url ? (
                              <img
                                src={enrollment.image_url}
                                alt={enrollment.course_title}
                                className="w-full sm:w-20 h-32 sm:h-20 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-full sm:w-20 h-32 sm:h-20 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base md:text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                {enrollment.course_title}
                              </h3>
                              <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
                                Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                              </p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-semibold text-gray-900">{enrollment.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      enrollment.completed
                                        ? 'bg-green-500'
                                        : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${enrollment.progress}%` }}
                                  ></div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {enrollment.completed ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      <span className="text-sm text-green-600 font-medium">Completed</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm text-blue-600 font-medium">In Progress</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Orders */}
                {orders.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                        Recent Orders
                      </h2>
                      <Link
                        href="/profile/orders"
                        className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors gap-2"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm md:text-base text-gray-900">Order #{order.id}</p>
                            <p className="text-xs md:text-sm text-gray-600">
                              {order.item_count} item{order.item_count !== 1 ? 's' : ''} • {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right gap-2">
                            <p className="font-semibold text-sm md:text-base text-gray-900">${parseFloat(order.total_amount).toFixed(2)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
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

              {/* Right Column - Sidebar */}
              <div className="space-y-4 md:space-y-6">
                {/* Account Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    Account Settings
                  </h2>
                  <PasswordChangeForm />
                </div>

                {/* Certificates */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                    Certificates
                  </h2>
                  {certificates.length === 0 ? (
                    <div className="text-center py-8">
                      <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">No certificates earned yet.</p>
                      <p className="text-xs text-gray-500 mt-1">Complete courses to earn certificates!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="border-2 border-purple-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <GraduationCap className="w-5 h-5 text-purple-600" />
                                <h3 className="font-bold text-gray-900">{cert.course_title}</h3>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">Cert #:</span> {cert.certificate_number}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Issued:</span> {new Date(cert.issued_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-3xl">🎓</div>
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
      </div>
    </>
  );
}
