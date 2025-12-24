import db, { initDatabase } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { BookOpen, Clock, Play } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  await initDatabase();
  
  const result = await db.execute(`
    SELECT c.*, 
           COUNT(l.id) as lesson_count
    FROM courses c
    LEFT JOIN lessons l ON c.id = l.course_id
    WHERE c.status = 'published'
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);
  const courses = result.rows as any[];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-900">Courses</h1>
            <p className="text-slate-600 mt-1">Expand your knowledge with our professional development courses</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {courses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No courses available yet</p>
              <p className="text-slate-500 text-sm mt-2">Check back soon for new content</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
                >
                  <div className="relative">
                    {course.image_url ? (
                      <div className="aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Play className="w-6 h-6 text-indigo-600 ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-semibold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xl font-bold text-slate-900">
                        {parseFloat(course.price) === 0 ? (
                          <span className="text-emerald-600">Free</span>
                        ) : (
                          `$${parseFloat(course.price).toFixed(2)}`
                        )}
                      </span>
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{course.lesson_count} lesson{course.lesson_count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
