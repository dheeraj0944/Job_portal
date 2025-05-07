import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Application from "@/lib/models/application"
import Job from "@/lib/models/job"
import { verifyToken } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    // --- Authentication --- 
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Not authorized, no token" }, { status: 401 })
    }
    const decoded = await verifyToken(token)
    if (!decoded || typeof decoded.id !== 'string') {
      return NextResponse.json({ message: "Not authorized, invalid token" }, { status: 401 })
    }
    const userId = decoded.id // Get userId from token
    const userRole = decoded.role as string

    // --- Authorization --- (Ensure only 'user' role can apply)
    if (userRole !== 'user') {
        return NextResponse.json({ message: "Forbidden: Only users can submit applications" }, { status: 403 });
    }

    // --- Request Body --- 
    const { jobId, coverLetter, resumeUrl } = await request.json()
    if (!jobId) {
      return NextResponse.json({ message: "Job ID is required" }, { status: 400 })
    }

    // --- Database Operation --- 
    await connectDB()

    // Optional: Check if user has already applied for this job
    const existingApplication = await Application.findOne({ user: userId, job: jobId });
    if (existingApplication) {
        return NextResponse.json({ message: "You have already applied for this job" }, { status: 409 }); // 409 Conflict
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      user: userId, // Add the authenticated userId
      status: "pending", // Default status
      coverLetter,
      resumeUrl,
    })

    return NextResponse.json(
      { message: "Application submitted successfully", application },
      { status: 201 },
    )
  } catch (error) {
    console.error("Application error:", error)
    // Provide more specific error messages if possible (e.g., from validation)
    const errorMessage = error instanceof Error ? error.message : "Server error"
    return NextResponse.json({ message: errorMessage }, { status: error instanceof Error && error.name === 'ValidationError' ? 400 : 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // --- Authentication --- 
    const token = request.cookies.get("token")?.value
    if (!token) return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    const decoded = await verifyToken(token)
    if (!decoded || typeof decoded.id !== 'string') return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    const userId = decoded.id

    // --- Database Operation --- 
    await connectDB()
    const applications = await Application.find({ user: userId })
        .populate("job", "title company location") // Populate job details
        .sort({ createdAt: -1 })

    return NextResponse.json(applications)

  } catch (error) {
    console.error("Get applications error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
