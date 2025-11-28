import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const altText = formData.get('alt_text') as string || '';
    const description = formData.get('description') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create media directory if it doesn't exist
    const mediaDir = join(process.cwd(), 'public', 'media');
    if (!existsSync(mediaDir)) {
      await mkdir(mediaDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalFilename = file.name;
    const fileExtension = originalFilename.split('.').pop();
    const filename = `${timestamp}-${originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(mediaDir, filename);

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file
    await writeFile(filePath, buffer);

    // Get file info
    const fileSize = buffer.length;
    const mimeType = file.type;
    const fileType = file.type.split('/')[0]; // 'image', 'video', 'application', etc.

    // Get image dimensions if it's an image
    // Note: Dimensions are optional and will be null if sharp is not installed
    // To get image dimensions, install sharp: npm install sharp
    let width: number | null = null;
    let height: number | null = null;

    // Optional: Uncomment the code below if you install sharp
    // if (fileType === 'image') {
    //   try {
    //     const sharp = require('sharp');
    //     const metadata = await sharp(buffer).metadata();
    //     width = metadata.width || null;
    //     height = metadata.height || null;
    //   } catch (err) {
    //     // Sharp not available or failed
    //   }
    // }

    // Save to database
    const result = db.prepare(`
      INSERT INTO media (filename, original_filename, file_path, file_type, mime_type, file_size, width, height, alt_text, description, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      filename,
      originalFilename,
      `/media/${filename}`,
      fileType,
      mimeType,
      fileSize,
      width,
      height,
      altText,
      description,
      user.id
    );

    return NextResponse.json({
      id: result.lastInsertRowid,
      filename,
      original_filename: originalFilename,
      file_path: `/media/${filename}`,
      file_type: fileType,
      mime_type: mimeType,
      file_size: fileSize,
      width,
      height,
      alt_text: altText,
      description,
    });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}

