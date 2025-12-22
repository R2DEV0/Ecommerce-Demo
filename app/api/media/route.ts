import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const searchParams = request.nextUrl.searchParams;
    const fileType = searchParams.get('type'); // 'image', 'video', 'application', etc.
    const search = searchParams.get('search');
    
    let query = 'SELECT * FROM media ORDER BY uploaded_at DESC';
    const args: any[] = [];
    
    if (fileType) {
      query = 'SELECT * FROM media WHERE file_type = ? ORDER BY uploaded_at DESC';
      args.push(fileType);
    }
    
    if (search) {
      const whereClause = fileType ? 'AND' : 'WHERE';
      query = query.replace('ORDER BY', `${whereClause} (original_filename LIKE ? OR alt_text LIKE ?) ORDER BY`);
      const searchTerm = `%${search}%`;
      args.push(searchTerm, searchTerm);
    }
    
    const result = await db.execute({ sql: query, args });
    
    return NextResponse.json({ media: result.rows });
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
    const mediaResult = await db.execute({
      sql: 'SELECT * FROM media WHERE id = ?',
      args: [parseInt(id)]
    });
    const media = mediaResult.rows[0] as any;
    
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }
    
    // Delete file from Cloudinary
    try {
      // The filename field stores the Cloudinary public_id
      if (media.filename) {
        await cloudinary.uploader.destroy(media.filename);
      }
    } catch (err) {
      console.warn('Failed to delete file from Cloudinary:', err);
      // Continue with database deletion even if Cloudinary deletion fails
    }
    
    // Delete from database
    await db.execute({
      sql: 'DELETE FROM media WHERE id = ?',
      args: [parseInt(id)]
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete media' }, { status: 500 });
  }
}
