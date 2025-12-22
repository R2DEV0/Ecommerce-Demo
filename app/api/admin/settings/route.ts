import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Public endpoint - no auth required for reading settings
    const result = await db.execute('SELECT setting_key, setting_value FROM site_settings');
    
    const settingsObj: Record<string, string> = {};
    result.rows.forEach((setting: any) => {
      settingsObj[setting.setting_key] = setting.setting_value || '';
    });
    
    return NextResponse.json(settingsObj);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

// Handle both PUT and POST for compatibility
async function updateSettings(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    
    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      await db.execute({
        sql: `INSERT INTO site_settings (setting_key, setting_value, updated_at)
              VALUES (?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(setting_key) DO UPDATE SET
                setting_value = excluded.setting_value,
                updated_at = CURRENT_TIMESTAMP`,
        args: [key, String(value || '')]
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return updateSettings(request);
}

export async function POST(request: NextRequest) {
  return updateSettings(request);
}
