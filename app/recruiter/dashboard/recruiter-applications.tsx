import Link from "next/link"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import connectDB from "@/lib/db"
import Job from "@/lib/models/job"
import Application from "@/lib/models/application"
import { verifyToken } from "@/lib/utils"

async function getRecruiterApplications() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    console.log("[getRecruiterApplications] No token found.")
    return []
  }

  const decoded = await verifyToken(token)
  console.log(`[getRecruiterApplications] Decoded token: ${JSON.stringify(decoded)}`)

  if (!decoded || typeof decoded.id !== 'string') {
    console.log("[getRecruiterApplications] Invalid token or missing user ID.")
    return []
  }

  const recruiterId = decoded.id
  console.log(`[getRecruiterApplications] Fetching data for recruiter ID: ${recruiterId}`)

  try {
    await connectDB()

    // Get all jobs posted by the recruiter
    const jobs = await Job.find({ recruiter: recruiterId }).lean()
    const jobIds = jobs.map((job: any) => job._id)
    console.log(`[getRecruiterApplications] Found ${jobs.length} jobs for recruiter.`)

    // Get all applications for those jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate({
        path: "job",
        select: "title company location",
      })
      .populate({
        path: "user",
        select: "name email",
      })
      .sort({ createdAt: -1 })
      .lean()
    console.log(`[getRecruiterApplications] Found ${applications.length} applications.`)

    return applications.map((app: any) => ({
      ...app,
      _id: app._id.toString(),
      job: {
        ...app.job,
        _id: app.job._id.toString(),
      },
      user: {
        ...app.user,
        _id: app.user._id.toString(),
      },
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("[getRecruiterApplications] Error fetching data:", error)
    return []
  }
}

export async function RecruiterApplications() {
  const applications = await getRecruiterApplications()

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No applications yet</h3>
        <p className="text-gray-500 mt-2">You haven't received any applications for your job listings yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((application: any) => (
        <div
          key={application._id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
        >
          <div>
            <h3 className="font-medium">
              <Link href={`/jobs/${application.job._id}`} className="hover:underline">
                {application.job.title}
              </Link>
            </h3>
            <p className="text-sm">
              Applicant: {application.user.name} ({application.user.email})
            </p>
            <p className="text-xs text-gray-500 mt-1">Applied on {formatDate(application.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={application.status} />
            <Link href={`/recruiter/applications/${application._id}`}>
              <Button variant="outline" size="sm">
                Review
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let variant: "outline" | "secondary" | "destructive" = "outline"

  switch (status) {
    case "accepted":
      variant = "secondary"
      break
    case "rejected":
      variant = "destructive"
      break
    default:
      variant = "outline"
  }

  return <Badge variant={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}
