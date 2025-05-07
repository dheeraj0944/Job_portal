import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Job from "@/lib/models/job"
import Application from "@/lib/models/application" // Import Application model if needed
import { verifyToken } from "@/lib/utils"

// GET handler
// Ensure params are destructured correctly from the second argument
export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { jobId } = params; // Destructure jobId here
    if (!jobId) {
        return NextResponse.json({ message: "Job ID parameter is missing" }, { status: 400 });
    }
    console.log(`[API /jobs GET] Fetching job with ID: ${jobId}`)

    await connectDB()
    const job = await Job.findById(jobId).populate("recruiter", "name company")

    if (!job) {
        console.log(`[API /jobs GET] Job not found for ID: ${jobId}`)
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    // Log error with potential jobId if available in scope
    console.error(`[API /jobs GET] Error fetching job ${params?.jobId}:`, error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// DELETE handler
export async function DELETE(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    await connectDB()

    const jobId = params.jobId

    // Get token from cookie
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Not authorized, no token" }, { status: 401 })
    }

    // Verify token
    const decoded = await verifyToken(token)
    if (!decoded || typeof decoded.id !== 'string') {
      return NextResponse.json({ message: "Not authorized, invalid token" }, { status: 401 })
    }
    const recruiterId = decoded.id

    // Find the job
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    // Check ownership
    if (job.recruiter.toString() !== recruiterId) {
       console.warn(`[API /jobs DELETE] User ${recruiterId} attempted to delete job ${jobId} owned by ${job.recruiter.toString()}`);
      return NextResponse.json({ message: "Forbidden: You can only delete your own jobs" }, { status: 403 })
    }

    // Delete associated applications (optional but recommended)
    await Application.deleteMany({ job: jobId })
    console.log(`[API /jobs DELETE] Deleted applications for job ${jobId}`) 

    // Delete the job
    await Job.findByIdAndDelete(jobId)
    console.log(`[API /jobs DELETE] Deleted job ${jobId} successfully by user ${recruiterId}`) 

    return NextResponse.json({ message: "Job deleted successfully" }, { status: 200 })

  } catch (error) {
    console.error(`[API /jobs DELETE] Error deleting job ${params.jobId}:`, error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT handler (Merged from [id]/route.ts)
export async function PUT(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    await connectDB()
    const jobId = params.jobId // Use jobId

    // Get token from cookie
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Not authorized, no token" }, { status: 401 })
    }

    // Verify token (async)
    const decoded = await verifyToken(token) // Add await
    if (!decoded || typeof decoded.id !== 'string') {
      console.error("[API /jobs PUT] Invalid token or missing user ID.")
      return NextResponse.json({ message: "Not authorized, invalid token" }, { status: 401 })
    }
    const recruiterId = decoded.id

    // Check if job exists
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    // Check ownership
    if (job.recruiter.toString() !== recruiterId) {
      console.warn(`[API /jobs PUT] User ${recruiterId} attempted to update job ${jobId} owned by ${job.recruiter.toString()}`);
      return NextResponse.json({ message: "Forbidden: You can only update your own jobs" }, { status: 403 })
    }

    // Get updated data from request body
    const { title, company, location, description, requirements, salaryMin, salaryMax, category } = await request.json()

    // Basic validation (optional but recommended)
    if (!title || !company || !location || !description || !category) {
        return NextResponse.json({ message: "Missing required job fields" }, { status: 400 });
    }

    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        title,
        company,
        location,
        description,
        requirements,
        salaryMin,
        salaryMax,
        category,
      },
      { new: true }, // Return the updated document
    )

    if (!updatedJob) { // Should not happen if findById found the job, but good practice
         return NextResponse.json({ message: "Failed to update job" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Job updated successfully",
      job: updatedJob,
    })

  } catch (error) {
    console.error(`[API /jobs PUT] Error updating job ${params.jobId}:`, error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

// PUT/PATCH handler (Optional: For editing jobs - can be added later)
// export async function PUT(request: NextRequest, { params }: { params: { jobId: string } }) { ... } 