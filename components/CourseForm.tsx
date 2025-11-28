'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from './Toast';

interface Lesson {
  id?: number;
  title: string;
  content: string;
  order_index: number;
  duration: number;
  video_url: string;
}

interface Course {
  id?: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  status: string;
}

interface CourseFormProps {
  course?: Course;
  lessons?: Lesson[];
}

export default function CourseForm({ course, lessons: initialLessons = [] }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Course>({
    title: course?.title || '',
    description: course?.description || '',
    price: course?.price || 0,
    image_url: course?.image_url || '',
    status: course?.status || 'draft',
  });
  const [lessons, setLessons] = useState<Lesson[]>(
    initialLessons.length > 0 
      ? initialLessons.map(l => ({
          ...l,
          video_url: l.video_url || '',
        }))
      : []
  );

  const addLesson = () => {
    setLessons([...lessons, {
      title: '',
      content: '',
      order_index: lessons.length + 1,
      duration: 0,
      video_url: '',
    }]);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index).map((l, i) => ({ ...l, order_index: i + 1 })));
  };

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: value };
    setLessons(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = course?.id 
        ? `/api/admin/courses/${course.id}`
        : '/api/admin/courses';
      
      const method = course?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course: formData,
          lessons: lessons.filter(l => l.title.trim() !== ''),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save course');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/courses');
        router.refresh();
      }, 1000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {success && (
        <Toast
          message={course?.id ? 'Course updated successfully!' : 'Course created successfully!'}
          type="success"
          onClose={() => setSuccess(false)}
        />
      )}
      
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError('')}
        />
      )}
      
      <form onSubmit={handleSubmit} className="w-full">

      <div className="space-y-3 md:space-y-4 lg:space-y-6">
        <div>
          <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
            Course Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
              Price <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
              className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-[#1d2327] mb-1 md:mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
          />
        </div>

        {/* Lessons */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium text-[#1d2327]">
              Lessons
            </label>
            <button
              type="button"
              onClick={addLesson}
              className="text-[#2271b1] hover:text-[#135e96] text-xs md:text-sm font-medium whitespace-nowrap"
            >
              + Add Lesson
            </button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {lessons.map((lesson, index) => (
              <div key={index} className="border border-[#c3c4c7] rounded-sm p-3 md:p-4">
                <div className="flex justify-between items-start mb-3 md:mb-4">
                  <h4 className="text-sm md:text-base font-medium text-[#1d2327]">Lesson {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeLesson(index)}
                    className="text-red-600 hover:text-red-700 text-xs md:text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1d2327] mb-1">
                      Lesson Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => updateLesson(index, 'title', e.target.value)}
                      required
                      className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1d2327] mb-1">
                      Content
                    </label>
                    <textarea
                      value={lesson.content}
                      onChange={(e) => updateLesson(index, 'content', e.target.value)}
                      rows={3}
                      className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#1d2327] mb-1">
                        Duration (seconds)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={lesson.duration}
                        onChange={(e) => updateLesson(index, 'duration', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1d2327] mb-1">
                        Video URL
                      </label>
                      <input
                        type="url"
                        value={lesson.video_url}
                        onChange={(e) => updateLesson(index, 'video_url', e.target.value)}
                        className="w-full px-2 py-1.5 md:px-3 md:py-2 border border-[#8c8f94] rounded-sm focus:ring-2 focus:ring-[#2271b1] focus:border-[#2271b1] text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-3 md:pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#2271b1] text-white px-3 py-2 md:px-4 md:py-2 rounded-sm hover:bg-[#135e96] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-normal text-xs md:text-sm"
          >
            {loading ? 'Saving...' : course?.id ? 'Update Course' : 'Create Course'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/courses')}
            className="px-3 py-2 md:px-4 md:py-2 border border-[#c3c4c7] rounded-sm hover:bg-[#f6f7f7] transition-colors text-xs md:text-sm text-[#1d2327]"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
    </>
  );
}

