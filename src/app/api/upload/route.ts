import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define the upload directory
        const uploadDir = join(process.cwd(), 'public', 'uploads');

        // Ensure the directory exists
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        // Create a unique filename using timestamp
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
        const filename = `${timestamp}_${originalName}`;

        // Save the file
        const filePath = join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // Return the public URL for the image
        const publicUrl = `/uploads/${filename}`;

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
    }
}
