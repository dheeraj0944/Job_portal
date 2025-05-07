import connectDB from "@/lib/db"
import Job from "@/lib/models/job"
import { notFound } from "next/navigation"
// import ApplyButton from "./apply-button" // Ensure this line is removed or commented
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatSalary, formatDate } from "@/lib/utils"
import { Briefcase, MapPin, Building, Calendar } from "lucide-react" // Removed unused Users, Clock
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"

async function getJob(jobId: string) {
    try {
        await connectDB()
        // Fetch job and populate recruiter details
        const job = await Job.findById(jobId).populate("recruiter", "name company email")
        if (!job) return null

        // Return a plain object suitable for client components/props
        return {
            _id: job._id.toString(),
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            requirements: job.requirements,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            category: job.category,
            recruiter: {
                _id: job.recruiter._id.toString(),
                name: job.recruiter.name,
                company: job.recruiter.company,
                email: job.recruiter.email
            },
            createdAt: job.createdAt.toISOString(),
            updatedAt: job.updatedAt.toISOString(),
        }
    } catch (error) {
        console.error(`Error fetching job ${jobId}:`, error)
        return null
    }
}

// Ensure params correctly uses jobId
export default async function JobDetailsPage({ params }: { params: { jobId: string } }) {
  const job = await getJob(params.jobId)

  if (!job) {
    notFound()
  }

  // Determine apply link/action (simple link for now)
  // TODO: Implement actual application submission logic (e.g., via modal or separate page)
  const applyHref = `/apply/${job._id}`; // Example link structure

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        {/* Header */}
        <div className="mb-6 pb-4 border-b">
          <h1 className="text-3xl font-bold text-primary mb-1">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
            <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {job.company || job.recruiter.company || 'N/A'}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Posted {formatDate(new Date(job.createdAt))}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column (Description, Requirements) */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Job Description</h2>
              <p className="text-card-foreground whitespace-pre-wrap">{job.description}</p>
            </div>
            {job.requirements && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Requirements</h2>
                <p className="text-card-foreground whitespace-pre-wrap">{job.requirements}</p>
              </div>
            )}
          </div>

          {/* Right Column (Summary, Apply Button) */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Category:</span>
                  <span>{job.category}</span>
                </div>
                 {(job.salaryMin || job.salaryMax) && (
                  <div className="flex items-center gap-2">
                     <span className="font-medium">Salary:</span>
                     <span>{formatSalary(job.salaryMin || 0, job.salaryMax || job.salaryMin || 0)}</span>
                  </div>
                 )}
                 <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Recruiter:</span>
                    <span>{job.recruiter.name}</span>
                 </div>
              </CardContent>
            </Card>
            <Button asChild size="lg" className="w-full mt-4"> 
                {/* Link to a future application page or trigger modal */}
                {/* For now, just a placeholder link */}
                 <Link href={applyHref}>Apply Now</Link> 
             </Button> 
          </div>
        </div>
      </div>
    </div>
  )
} 