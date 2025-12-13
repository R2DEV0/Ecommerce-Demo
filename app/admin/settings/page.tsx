import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import SiteSettingsForm from '@/components/SiteSettingsForm';
import db, { initDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SiteSettingsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/login');
  }

  await initDatabase();
  
  // Get all site settings
  const result = await db.execute('SELECT setting_key, setting_value FROM site_settings');
  
  // Convert to object for easier access
  const settingsObj: Record<string, string> = {};
  result.rows.forEach((setting: any) => {
    settingsObj[setting.setting_key] = setting.setting_value || '';
  });

  return (
    <div className="w-full max-w-full">
      <h1 className="text-xl md:text-2xl font-normal mb-3 md:mb-6 text-[#1d2327]">Site Settings</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-3 sm:p-4 md:p-6 w-full max-w-full">
        <SiteSettingsForm settings={settingsObj} />
      </div>
    </div>
  );
}
