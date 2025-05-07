import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Application from "@/lib/models/application"
import Job from "@/lib/models/job" // Needed to check job ownership
import { verifyToken } from "@/lib/utils"

// GET handler for fetching applications for a specific job
export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { jobId } = params
    if (!jobId) {
      return NextResponse.json({ message: "Job ID parameter is missing" }, { status: 400 })
    }
    console.log(`[API /jobs/apps GET] Fetching applications for job ID: ${jobId}`)

    // --- Authentication and Authorization --- 
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Not authorized, no token" }, { status: 401 })
    }
    const decoded = await verifyToken(token)
    if (!decoded || typeof decoded.id !== 'string') {
      return NextResponse.json({ message: "Not authorized, invalid token" }, { status: 401 })
    }
    const recruiterId = decoded.id

    // --- Database Operations --- 
    await connectDB()

    // Optional but recommended: Verify the job exists and the requesting user owns it
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }
    if (job.recruiter.toString() !== recruiterId) {
      return NextResponse.json({ message: "Forbidden: Cannot view applications for jobs you do not own" }, { status: 403 })
    }

    // Fetch applications for the specified job, populating user details
    const applications = await Application.find({ job: jobId })
      .populate("user", "name email") // Populate only necessary user fields
      .sort({ createdAt: -1 })

    console.log(`[API /jobs/apps GET] Found ${applications.length} applications for job ${jobId}`)

    // Explicitly type 'app' within the map
    const applicationData = applications.map((app: any) => { // Use 'any' or import the actual Application type if available
      // Assuming 'Application' is the Mongoose model type with populated 'user'
      const safeUser = app.user as any; // Cast populated user for easier access
      return {
        _id: app._id.toString(),
        job: { _id: jobId, title: job.title },
        user: {
            _id: safeUser?._id?.toString(),
            name: safeUser?.name,
            email: safeUser?.email
        },
        status: app.status,
        coverLetter: app.coverLetter,
        resumeUrl: app.resumeUrl,
        createdAt: app.createdAt.toISOString()
      }
    });

    return NextResponse.json(applicationData)

  } catch (error) {
    console.error(`[API /jobs/apps GET] Error fetching applications for job ${params?.jobId}:`, error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
} 