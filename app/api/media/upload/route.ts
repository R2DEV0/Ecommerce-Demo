import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // Get file buffer and convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Generate unique filename
    const timestamp = Date.now();
    const originalFilename = file.name;
    const publicId = `media/${timestamp}-${originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]+$/, '')}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      public_id: publicId,
      resource_type: 'auto',
      folder: 'ecommerce',
    });

    // Get file info
    const fileSize = buffer.length;
    const mimeType = file.type;
    const fileType = file.type.split('/')[0]; // 'image', 'video', 'application', etc.
    const cloudinaryUrl = uploadResult.secure_url;

    // Save to database
    const result = await db.execute({
      sql: `INSERT INTO media (filename, original_filename, file_path, file_type, mime_type, file_size, width, height, alt_text, description, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        uploadResult.public_id,
        originalFilename,
        cloudinaryUrl,
        fileType,
        mimeType,
        fileSize,
        uploadResult.width || null,
        uploadResult.height || null,
        altText,
        description,
        user.id
      ]
    });

    return NextResponse.json({
      id: Number(result.lastInsertRowid),
      filename: uploadResult.public_id,
      original_filename: originalFilename,
      file_path: cloudinaryUrl,
      file_type: fileType,
      mime_type: mimeType,
      file_size: fileSize,
      width: uploadResult.width || null,
      height: uploadResult.height || null,
      alt_text: altText,
      description,
    });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
