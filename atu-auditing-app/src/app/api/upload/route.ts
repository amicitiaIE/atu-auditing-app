import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/upload
 * 
 * Handles image file uploads from the client
 * Accepts multipart/form-data containing an image file
 * Saves the file to the public/uploads directory with a unique filename
 * 
 * Process:
 * 1. Extract the file from the form data
 * 2. Generate a unique filename using timestamp
 * 3. Create the uploads directory if it doesn't exist
 * 4. Save the file to the public/uploads directory
 * 5. Return the file path for future reference
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the multipart/form-data from the request
    const formData = await request.formData();
    
    // Extract the file from the form data
    // The field name 'file' should match what's sent from the client
    const file = formData.get('file') as File;
    
    // Validate that a file was provided
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (only allow image files)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only image files are allowed.' },
        { status: 400 }
      );
    }

    // Convert the file to a buffer for saving
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename using timestamp and original file extension
    const fileExtension = path.extname(file.name);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFilename = `audit-image-${timestamp}-${randomString}${fileExtension}`;

    // Define the upload directory path
    // Using public/uploads so images are accessible via URL
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create the uploads directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
      console.log('Upload directory already exists or created');
    }

    // Define the full file path
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Write the file to the filesystem
    await writeFile(filePath, buffer);
    
    // Return the public URL path for accessing the uploaded image
    // This path can be used directly in img tags or stored in the database
    const publicPath = `/uploads/${uniqueFilename}`;
    
    return NextResponse.json(
      { 
        message: 'File uploaded successfully',
        filePath: publicPath,
        filename: uniqueFilename,
        originalName: file.name,
        size: file.size,
        type: file.type
      },
      { status: 200 }
    );
    
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error uploading file:', error);
    
    // Return a generic error message to the client
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/upload
 * 
 * Handle preflight requests for CORS
 * This is important for cross-origin requests from the browser
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}