import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatSalary } from "@/lib/utils"
import { Building, MapPin } from "lucide-react"

// Define the expected structure of a job object prop
// (Adjust based on your actual Job model and serializable fields)
type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  // Add other relevant fields if needed
};

// Component now accepts jobs and isLoading as props
interface RecommendedJobsProps {
  jobs: Job[];
  isLoading: boolean;
}

// Make the component a standard function component, remove async
export function RecommendedJobs({ jobs, isLoading }: RecommendedJobsProps) {

  if (isLoading) {
    // Use the existing skeleton defined in the parent page (or define one here)
    // This assumes JobsSkeleton is available in scope or imported
    // return <JobsSkeleton />; 
    // Or a simpler loading indicator:
    return <div className="text-center py-12">Loading recommended jobs...</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No recommended jobs found</h3>
        <p className="text-gray-500 mt-2">We couldn't find any job recommendations right now.</p>
        <Link href="/jobs" className="mt-4 inline-block">
          <Button>Browse All Jobs</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Render jobs from props */}
      {jobs.map((job) => (
        <div key={job._id} className="p-4 border rounded-lg">
          <h3 className="font-medium">
            <Link href={`/jobs/${job._id}`} className="hover:underline">
              {job.title}
            </Link>
          </h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{job.location}</span>
            </div>
          </div>
          <p className="mt-2 text-sm line-clamp-2 text-gray-600">{job.description}</p>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-sm font-medium">
              {formatSalary(job.salaryMin ?? 0, job.salaryMax ?? 0)}
            </span>
            <Link href={`/jobs/${job._id}`}>
              {/* Consider changing button text if user has already applied? */}
              <Button size="sm">View Job</Button> 
            </Link>
          </div>
        </div>
      ))}

      <div className="text-center pt-4">
        <Link href="/jobs">
          <Button variant="outline">View All Jobs</Button>
        </Link>
      </div>
    </div>
  )
}
