import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Application from '@/lib/models/application'; // Assuming correct path
import { verifyToken } from '@/lib/utils'; // Assuming correct path

export async function GET(request: Request) {
  const cookieStore = await cookies(); // Use cookies() here
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ applications: [], message: 'Unauthorized' }, { status: 401 });
  }

  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded.id !== 'string') {
    console.error('[API /applications/user] Invalid token or missing user ID.');
    return NextResponse.json({ applications: [], message: 'Invalid token' }, { status: 401 });
  }
  const userId = decoded.id;

  try {
    await connectDB();
    const applications = await Application.find({ user: userId })
      .populate({
        path: 'job',
        select: 'title company location', // Select only needed fields from Job
      })
      .sort({ createdAt: -1 })
      .lean();

    // Ensure data is serializable
    const serializableApplications = applications.map((app: any) => ({
      ...app,
      _id: app._id.toString(),
      job: app.job ? { // Check if job exists (it might be deleted)
        ...app.job,
        _id: app.job._id?.toString(), // Check if job._id exists
      } : null, // Handle case where populated job is null
      user: app.user?.toString(), // Should always exist, but good practice
      createdAt: app.createdAt?.toISOString(),
      updatedAt: app.updatedAt?.toISOString(),
    }));

    return NextResponse.json({ applications: serializableApplications });

  } catch (error) {
    console.error('[API /applications/user] Error fetching applications:', error);
    return NextResponse.json({ applications: [], message: 'Server error fetching applications' }, { status: 500 });
  }
} 