import Link from "next/link"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Pencil, Users } from "lucide-react"
import connectDB from "@/lib/db"
import Job from "@/lib/models/job"
import Application from "@/lib/models/application"
import { verifyToken } from "@/lib/utils"
import { DeleteJobButton } from "./delete-job-button"

async function getRecruiterJobs() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    console.log("[getRecruiterJobs] No token found.")
    return []
  }

  const decoded = await verifyToken(token)
  console.log(`[getRecruiterJobs] Decoded token: ${JSON.stringify(decoded)}`)

  if (!decoded || typeof decoded.id !== 'string') {
    console.log("[getRecruiterJobs] Invalid token or missing user ID.")
    return []
  }

  const recruiterId = decoded.id
  console.log(`[getRecruiterJobs] Fetching jobs for recruiter ID: ${recruiterId}`)

  try {
    await connectDB()

    const jobs = await Job.find({ recruiter: recruiterId }).sort({ createdAt: -1 }).lean()
    console.log(`[getRecruiterJobs] Found ${jobs.length} jobs.`)

    // Get application counts for each job
    const jobIds = jobs.map((job: any) => job._id)
    const applicationCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ])

    // Create a map of job ID to application count
    const countMap = applicationCounts.reduce((acc: any, curr: any) => {
      acc[curr._id.toString()] = curr.count
      return acc
    }, {})

    return jobs.map((job: any) => ({
      ...job,
      _id: job._id.toString(),
      recruiter: job.recruiter.toString(),
      applicationCount: countMap[job._id.toString()] || 0,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("[getRecruiterJobs] Error fetching jobs:", error)
    return []
  }
}

export async function RecruiterJobs() {
  const jobs = await getRecruiterJobs()

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No job listings yet</h3>
        <p className="text-gray-500 mt-2">Post your first job to start receiving applications</p>
        <Link href="/recruiter/jobs/new" className="mt-4 inline-block">
          <Button>Post a Job</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job: any) => (
        <div key={job._id} className="p-4 border rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium">
                <Link href={`/jobs/${job._id}`} className="hover:underline">
                  {job.title}
                </Link>
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 mt-1 text-sm text-gray-500">
                <span>{job.location}</span>
                <span>Posted {formatDate(job.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{job.applicationCount} applications</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/recruiter/jobs/${job._id}/applications`}>
                <Button variant="outline" size="sm">
                  View Applications
                </Button>
              </Link>
              <Link href={`/recruiter/jobs/${job._id}/edit`}>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </Link>
              <DeleteJobButton jobId={job._id} />
            </div>
          </div>

          <div className="mt-2">
            <p className="text-sm line-clamp-2 text-gray-600">{job.description}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{job.category}</Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
