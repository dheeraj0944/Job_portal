import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatSalary, formatDate } from "@/lib/utils"
import { Building, MapPin } from "lucide-react"
import connectDB from "@/lib/db"
import Job from "@/lib/models/job"

// Define a more specific type for searchParams expected by this page
type JobsPageSearchParams = {
  location?: string;
  category?: string;
  minSalary?: string;
  // Add other potential params if needed
}

async function getJobs(searchParams: JobsPageSearchParams) {
  await connectDB()

  const query: any = {}

  // Destructure and use properties safely
  const { location, category, minSalary: minSalaryParam } = searchParams;

  // Apply filters if provided
  if (location) {
    query.location = { $regex: location, $options: "i" }
  }

  // Handle category filter (ensure 'all' isn't treated as a filter)
  if (category && category.toLowerCase() !== 'all') {
    query.category = category
  }

  if (minSalaryParam) {
    // Ensure parsing is safe and respects the filter logic
    const minSalary = Number.parseInt(minSalaryParam);
    if (!isNaN(minSalary) && minSalary > 0) {
      // Assuming you want jobs where the max salary is at least the minimum filter
      // Adjust field (salaryMin/salaryMax/salary) based on your Job model if needed
      query.salaryMax = { $gte: minSalary }
    }
  }

  const jobs = await Job.find(query).sort({ createdAt: -1 }).populate("recruiter", "name company").lean()

  return jobs
}

export async function JobsList({ searchParams }: { searchParams?: JobsPageSearchParams }) {
  const jobs = await getJobs(searchParams || {})

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No jobs found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job: any) => (
        <Card key={job._id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <Badge variant="outline" className="ml-2">
                {job.category}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="line-clamp-2 text-gray-600">{job.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">{formatSalary(job.salaryMin, job.salaryMax)}</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <p className="text-sm text-gray-500">Posted {formatDate(job.createdAt)}</p>
            <Link href={`/jobs/${job._id}`}>
              <Button>View Details</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
