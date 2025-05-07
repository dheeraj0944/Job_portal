import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Job from "@/lib/models/job"
import { verifyToken } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Get token from cookie
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "Not authorized, no token" }, { status: 401 })
    }

    // Verify token (now async)
    const decoded = await verifyToken(token)

    // Check if decoded is null OR if id is missing/not a string
    if (!decoded || typeof decoded.id !== 'string') {
      console.error("[API /jobs POST] Invalid token or missing user ID in token payload.")
      return NextResponse.json({ message: "Not authorized, invalid token" }, { status: 401 })
    }

    const recruiterId = decoded.id // We know it's valid now
    const userRole = decoded.role as string

    // Optional: Check if the user role is actually 'recruiter'
    if (userRole !== 'recruiter') {
        console.warn(`[API /jobs POST] User ${recruiterId} attempting job post with role ${userRole}`);
        return NextResponse.json({ message: "Forbidden: Only recruiters can post jobs" }, { status: 403 });
    }

    const { title, company, location, description, requirements, salaryMin, salaryMax, category } = await request.json()

    // Validate required fields explicitly (optional but good practice)
    if (!title || !company || !location || !description || !category) {
        return NextResponse.json({ message: "Missing required job fields" }, { status: 400 });
    }

    // Create job
    const job = await Job.create({
      title,
      company,
      location,
      description,
      requirements,
      salaryMin,
      salaryMax,
      category,
      recruiter: recruiterId, // Use the validated recruiterId
    })

    return NextResponse.json(
      {
        message: "Job created successfully",
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          requirements: job.requirements,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          category: job.category,
          recruiter: job.recruiter,
          createdAt: job.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Job creation error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const query: any = {}

    // Apply filters if provided
    if (searchParams.has("location")) {
      query.location = { $regex: searchParams.get("location"), $options: "i" }
    }

    if (searchParams.has("category")) {
      query.category = searchParams.get("category")
    }

    if (searchParams.has("minSalary")) {
      query.salaryMax = { $gte: Number.parseInt(searchParams.get("minSalary")!) }
    }

    // Get jobs
    const jobs = await Job.find(query).sort({ createdAt: -1 }).populate("recruiter", "name company")

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Get jobs error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
