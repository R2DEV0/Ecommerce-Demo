import db from '@/lib/db';
import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import RegisterButton from '@/components/RegisterButton';

export default async function WebinarsPage() {
  const webinars = db.prepare(`
    SELECT w.*,
           COUNT(wr.id) as registration_count
    FROM webinars w
    LEFT JOIN webinar_registrations wr ON w.id = wr.webinar_id
    WHERE w.status = 'scheduled'
    GROUP BY w.id
    ORDER BY w.date_time ASC
  `).all() as any[];

  const user = await getCurrentUser();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">Upcoming Webinars</h1>
          {webinars.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-gray-600 text-base md:text-lg">No webinars scheduled yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {webinars.map((webinar) => {
                const webinarDate = new Date(webinar.date_time);
                const isPast = webinarDate < new Date();
                
                return (
                  <div key={webinar.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold mb-2">{webinar.title}</h2>
                    <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-3">{webinar.description}</p>
                    <div className="space-y-2 mb-3 md:mb-4">
                      <p className="text-xs md:text-sm">
                        <span className="font-semibold">Date:</span>{' '}
                        {webinarDate.toLocaleDateString()} at {webinarDate.toLocaleTimeString()}
                      </p>
                      {webinar.duration && (
                        <p className="text-xs md:text-sm">
                          <span className="font-semibold">Duration:</span> {webinar.duration} minutes
                        </p>
                      )}
                      <p className="text-xs md:text-sm text-gray-500">
                        {webinar.registration_count} registration{webinar.registration_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {!isPast && user && (
                      <RegisterButton webinarId={webinar.id} />
                    )}
                    {!isPast && !user && (
                      <p className="text-xs md:text-sm text-gray-600">Please login to register</p>
                    )}
                    {isPast && (
                      <p className="text-xs md:text-sm text-gray-500">This webinar has passed</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

