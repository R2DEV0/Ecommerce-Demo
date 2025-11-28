import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const searchParams = request.nextUrl.searchParams;
    const fileType = searchParams.get('type'); // 'image', 'video', 'application', etc.
    const search = searchParams.get('search');
    
    let query = 'SELECT * FROM media ORDER BY uploaded_at DESC';
    const params: any[] = [];
    
    if (fileType) {
      query = 'SELECT * FROM media WHERE file_type = ? ORDER BY uploaded_at DESC';
      params.push(fileType);
    }
    
    if (search) {
      const whereClause = fileType ? 'AND' : 'WHERE';
      query = query.replace('ORDER BY', `${whereClause} (original_filename LIKE ? OR alt_text LIKE ?) ORDER BY`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    const media = db.prepare(query).all(...params) as any[];
    
    return NextResponse.json({ media });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch media' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
    }
    
    // Get media info
    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(parseInt(id)) as any;
    
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }
    
    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), 'public', media.file_path.replace(/^\//, ''));
      await unlink(filePath);
    } catch (err) {
      console.warn('Failed to delete file from filesystem:', err);
      // Continue with database deletion even if file deletion fails
    }
    
    // Delete from database
    db.prepare('DELETE FROM media WHERE id = ?').run(parseInt(id));
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete media' }, { status: 500 });
  }
}

