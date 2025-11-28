import db from '@/lib/db';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function CoursesPage() {
  const courses = db.prepare(`
    SELECT c.*, 
           COUNT(l.id) as lesson_count
    FROM courses c
    LEFT JOIN lessons l ON c.id = l.course_id
    WHERE c.status = 'published'
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all() as any[];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">Courses</h1>
          {courses.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-gray-600 text-base md:text-lg">No courses available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {course.image_url && (
                    <div className="aspect-video bg-gray-200">
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 md:p-6">
                    <h3 className="font-semibold text-lg md:text-xl mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-3">{course.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-base md:text-lg font-bold text-indigo-600">
                        {parseFloat(course.price) === 0 ? 'Free' : `$${parseFloat(course.price).toFixed(2)}`}
                      </span>
                      <span className="text-xs md:text-sm text-gray-500">
                        {course.lesson_count} lesson{course.lesson_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

