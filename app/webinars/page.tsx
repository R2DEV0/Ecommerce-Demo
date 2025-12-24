import db, { initDatabase } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/auth';
import RegisterButton from '@/components/RegisterButton';
import { Video, Calendar, Clock, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WebinarsPage() {
  await initDatabase();
  
  const result = await db.execute(`
    SELECT w.*,
           COUNT(wr.id) as registration_count
    FROM webinars w
    LEFT JOIN webinar_registrations wr ON w.id = wr.webinar_id
    WHERE w.status = 'scheduled'
    GROUP BY w.id
    ORDER BY w.date_time ASC
  `);
  const webinars = result.rows as any[];

  const user = await getCurrentUser();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-900">Upcoming Webinars</h1>
            <p className="text-slate-600 mt-1">Join our live sessions and learn from experts</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {webinars.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No webinars scheduled</p>
              <p className="text-slate-500 text-sm mt-2">Check back soon for upcoming events</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {webinars.map((webinar) => {
                const webinarDate = new Date(webinar.date_time);
                const isPast = webinarDate < new Date();
                
                return (
                  <div 
                    key={webinar.id} 
                    className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                      isPast 
                        ? 'border-slate-200 opacity-75' 
                        : 'border-slate-200 hover:border-indigo-200 hover:shadow-xl'
                    }`}
                  >
                    {/* Date Banner */}
                    <div className={`px-6 py-4 ${isPast ? 'bg-slate-100' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                      <div className={`text-center ${isPast ? 'text-slate-500' : 'text-white'}`}>
                        <p className="text-sm font-medium opacity-80">
                          {webinarDate.toLocaleDateString('en-US', { weekday: 'long' })}
                        </p>
                        <p className="text-3xl font-bold">
                          {webinarDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm opacity-80">
                          {webinarDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-slate-900 mb-3">{webinar.title}</h2>
                      <p className="text-slate-500 text-sm mb-4 line-clamp-3">{webinar.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-5">
                        {webinar.duration && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {webinar.duration} min
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {webinar.registration_count} registered
                        </div>
                      </div>
                      
                      {!isPast && user && (
                        <RegisterButton webinarId={webinar.id} />
                      )}
                      {!isPast && !user && (
                        <p className="text-sm text-slate-500 bg-slate-50 rounded-lg px-4 py-2.5 text-center">
                          Please login to register
                        </p>
                      )}
                      {isPast && (
                        <p className="text-sm text-slate-400 bg-slate-50 rounded-lg px-4 py-2.5 text-center">
                          This webinar has ended
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
