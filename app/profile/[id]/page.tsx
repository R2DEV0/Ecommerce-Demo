import db from '@/lib/db';
import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import PasswordChangeForm from '@/components/PasswordChangeForm';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const profileUserId = parseInt(params.id);
  const currentUser = await getCurrentUser();
  
  // Users can only view their own profile unless they're admin
  if (!currentUser || (currentUser.id !== profileUserId && currentUser.role !== 'admin')) {
    notFound();
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(profileUserId) as any;
  if (!user) {
    notFound();
  }

  const enrollments = db.prepare(`
    SELECT ce.*, c.title as course_title, c.id as course_id
    FROM course_enrollments ce
    JOIN courses c ON ce.course_id = c.id
    WHERE ce.user_id = ?
    ORDER BY ce.enrolled_at DESC
  `).all(profileUserId) as any[];

  const certificates = db.prepare(`
    SELECT cert.*, c.title as course_title
    FROM certificates cert
    JOIN courses c ON cert.course_id = c.id
    WHERE cert.user_id = ?
    ORDER BY cert.issued_at DESC
  `).all(profileUserId) as any[];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h1 className="text-3xl font-bold mb-4">{user.name}</h1>
              <div className="space-y-2 text-gray-600 mb-6">
                <p><span className="font-semibold">Email:</span> {user.email}</p>
                <p><span className="font-semibold">Role:</span> {user.role}</p>
                <p><span className="font-semibold">Member since:</span> {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <PasswordChangeForm />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold mb-4">My Courses</h2>
              {enrollments.length === 0 ? (
                <p className="text-gray-600">No course enrollments yet.</p>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{enrollment.course_title}</h3>
                          <p className="text-sm text-gray-600">
                            Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary-600">
                            {enrollment.progress}% Complete
                          </div>
                          {enrollment.completed ? (
                            <span className="text-xs text-green-600">✓ Completed</span>
                          ) : (
                            <span className="text-xs text-gray-500">In Progress</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Certificates</h2>
              {certificates.length === 0 ? (
                <p className="text-gray-600">No certificates earned yet.</p>
              ) : (
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="border-2 border-primary-200 rounded-lg p-6 bg-gradient-to-br from-primary-50 to-blue-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl mb-2">{cert.course_title}</h3>
                          <p className="text-sm text-gray-600">
                            Certificate Number: {cert.certificate_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            Issued: {new Date(cert.issued_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-4xl">🎓</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

