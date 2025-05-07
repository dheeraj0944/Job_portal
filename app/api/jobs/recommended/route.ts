import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Job from '@/lib/models/job'; // Assuming this is the correct path
import { verifyToken } from '@/lib/utils'; // Assuming this is the correct path

export async function GET(request: Request) {
  const cookieStore = await cookies(); // Try awaiting cookies()
  const token = cookieStore.get('token')?.value;

  if (!token) {
    // Return empty array or error if user must be logged in for recommendations
    return NextResponse.json({ jobs: [], message: 'Unauthorized' }, { status: 401 });
  }

  // Verify the token (ensure verifyToken handles potential errors)
  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded.id !== 'string') {
    console.error('[API /jobs/recommended] Invalid token or missing user ID.');
    return NextResponse.json({ jobs: [], message: 'Invalid token' }, { status: 401 });
  }

  // const userId = decoded.id; // Use userId for actual recommendation logic later

  try {
    await connectDB();

    // --- Recommendation Logic Placeholder --- 
    // TODO: Implement actual recommendation logic based on userId, profile, etc.
    // For now, fetch recent jobs as before.
    const jobs = await Job.find({})
      .sort({ createdAt: -1 })
      .limit(10) // Fetch a few more for the API route maybe
      .lean(); // Use lean for performance

    // Ensure data is serializable (convert ObjectId, Dates)
    const serializableJobs = jobs.map((job: any) => ({
      ...job,
      _id: job._id.toString(),
      recruiter: job.recruiter?.toString(), // Handle potential missing recruiter field
      createdAt: job.createdAt?.toISOString(), // Handle potential missing date fields
      updatedAt: job.updatedAt?.toISOString(),
    }));

    return NextResponse.json({ jobs: serializableJobs });

  } catch (error) {
    console.error('[API /jobs/recommended] Error fetching jobs:', error);
    return NextResponse.json({ jobs: [], message: 'Server error fetching jobs' }, { status: 500 });
  }
} 