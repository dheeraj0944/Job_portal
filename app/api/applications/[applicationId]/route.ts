import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Application from "@/lib/models/application"
import Job from "@/lib/models/job" // To verify job ownership
import { verifyToken } from "@/lib/utils"

// GET handler: Fetch a single application by ID
export async function GET(request: NextRequest, { params }: { params: { applicationId: string } }) {
  try {
    const { applicationId } = params
    if (!applicationId) {
      return NextResponse.json({ message: "Application ID parameter is missing" }, { status: 400 })
    }

    // --- Authentication & Authorization --- 
    const token = request.cookies.get("token")?.value
    if (!token) return NextResponse.json({ message: "Not authorized, no token" }, { status: 401 })
    const decoded = await verifyToken(token)
    if (!decoded || typeof decoded.id !== 'string') return NextResponse.json({ message: "Not authorized, invalid token" }, { status: 401 })
    const userId = decoded.id
    const userRole = decoded.role as string

    // --- Database Operation --- 
    await connectDB()
    const application = await Application.findById(applicationId)
      .populate("user", "name email resumeUrl") // Populate user details
      .populate("job", "title recruiter") // Populate job title and recruiter ID

    if (!application) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 })
    }

    // Authorization Check: Ensure the logged-in user is either the applicant or the recruiter for the job
    const job = application.job as any; // Cast populated job
    if (application.user._id.toString() !== userId && job.recruiter.toString() !== userId) {
        console.warn(`User ${userId} attempted to access application ${applicationId} without permission.`);
        return NextResponse.json({ message: "Forbidden: Cannot access this application" }, { status: 403 });
    }

    return NextResponse.json(application)

  } catch (error) {
    console.error(`[API /apps GET] Error fetching application ${params?.applicationId}:`, error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT handler: Update application status
export async function PUT(request: NextRequest, { params }: { params: { applicationId: string } }) {
  try {
    const { applicationId } = params
    if (!applicationId) {
      return NextResponse.json({ message: "Application ID parameter is missing" }, { status: 400 })
    }

    // --- Authentication & Authorization --- 
    const token = request.cookies.get("token")?.value
    if (!token) return NextResponse.json({ message: "Not authorized, no token" }, { status: 401 })
    const decoded = await verifyToken(token)
    if (!decoded || typeof decoded.id !== 'string') return NextResponse.json({ message: "Not authorized, invalid token" }, { status: 401 })
    const recruiterId = decoded.id
    const userRole = decoded.role as string

    // Only recruiters can update status
    if (userRole !== 'recruiter') {
        return NextResponse.json({ message: "Forbidden: Only recruiters can update application status" }, { status: 403 });
    }
    
    const { status } = await request.json()
    if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
        return NextResponse.json({ message: "Invalid status value provided" }, { status: 400 })
    }

    // --- Database Operation --- 
    await connectDB()

    // Find the application and verify ownership
    const application = await Application.findById(applicationId).populate("job", "recruiter")
    if (!application) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 })
    }
    const job = application.job as any; // Cast populated job
    if (job.recruiter.toString() !== recruiterId) {
      return NextResponse.json({ message: "Forbidden: Cannot update status for jobs you do not own" }, { status: 403 })
    }

    // Update the status
    application.status = status
    await application.save()

    console.log(`[API /apps PUT] Application ${applicationId} status updated to ${status} by recruiter ${recruiterId}`);

    return NextResponse.json({ message: "Application status updated successfully", application })

  } catch (error) {
    console.error(`[API /apps PUT] Error updating application ${params?.applicationId}:`, error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
} 