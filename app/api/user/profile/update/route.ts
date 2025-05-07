import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/lib/models/user'; // Assuming correct path
import { verifyToken } from '@/lib/utils'; // Assuming correct path

// --- Placeholder for File Upload Service --- 
// Replace this with your actual file upload logic (e.g., to S3, GCS, Cloudinary)
async function uploadResumeAndGetUrl(file: File, userId: string): Promise<string> {
  console.log(`[API Profile Update] Uploading resume: ${file.name} for user ${userId}`);
  // 1. Generate a unique filename (e.g., using userId and timestamp)
  // const uniqueFilename = `${userId}-${Date.now()}-${file.name}`;

  // 2. Use a cloud storage SDK (e.g., AWS S3, Google Cloud Storage) to upload the file buffer
  // const fileBuffer = Buffer.from(await file.arrayBuffer());
  // const uploadResult = await storageService.upload(uniqueFilename, fileBuffer, file.type);

  // 3. Return the public URL of the uploaded file
  // return uploadResult.url;

  // ---- Placeholder Implementation ----
  // Simulate upload and return a dummy URL
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate upload time
  const dummyUrl = `/uploads/resumes/${userId}/${file.name}`; // Example dummy path
  console.log(`[API Profile Update] Dummy URL generated: ${dummyUrl}`);
  return dummyUrl; 
  // -------------------------------------
}
// -----------------------------------------

export async function PUT(request: Request) {
  // 1. Verify Authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded.id !== 'string') {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
  const userId = decoded.id;

  try {
    // 2. Parse FormData
    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const resumeFile = formData.get('resume') as File | null;

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    await connectDB();

    // 3. Prepare updates object
    const updates: { name: string; resumeUrl?: string } = { name };

    // 4. Handle File Upload (if present)
    if (resumeFile) {
      try {
        const resumeUrl = await uploadResumeAndGetUrl(resumeFile, userId);
        updates.resumeUrl = resumeUrl;
      } catch (uploadError) {
        console.error('[API Profile Update] Resume upload failed:', uploadError);
        return NextResponse.json({ message: 'Failed to upload resume' }, { status: 500 });
      }
    }

    // 5. Update Database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true, select: '-password' } // Return updated doc, run schema validators, exclude password
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 6. Return updated user data (ensure it matches frontend expectations)
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
          id: updatedUser._id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          resumeUrl: updatedUser.resumeUrl,
          // Add other necessary fields based on AuthContext User type
          ...(updatedUser.role === 'recruiter' && updatedUser.company && { company: updatedUser.company }),
      }
    });

  } catch (error) {
    console.error('[API Profile Update] Error:', error);
    // Handle potential validation errors etc.
    if (error instanceof Error && error.name === 'ValidationError') {
         return NextResponse.json({ message: `Validation Error: ${error.message}` }, { status: 400 });
    }
    return NextResponse.json({ message: 'Server error updating profile' }, { status: 500 });
  }
} 