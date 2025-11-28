import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function GET() {
  try {
    // Public endpoint - no auth required for reading settings
    const settings = db.prepare('SELECT setting_key, setting_value FROM site_settings').all() as Array<{ setting_key: string; setting_value: string | null }>;
    
    const settingsObj: Record<string, string> = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value || '';
    });
    
    return NextResponse.json(settingsObj);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    
    // Update each setting
    const updateStmt = db.prepare(`
      INSERT INTO site_settings (setting_key, setting_value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(setting_key) DO UPDATE SET
        setting_value = excluded.setting_value,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(body)) {
        updateStmt.run(key, value || '');
      }
    });
    
    transaction();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}

