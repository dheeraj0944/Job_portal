"use client"; // Make this a Client Component

import Link from "next/link"
// Remove useState, useEffect
// Remove server-only imports
// Remove useToast if only used for fetch errors

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading

// Define Application type (match serializable structure from API)
type JobInfo = {
  _id: string;
  title: string;
  company: string;
  location: string;
};

type Application = {
  _id: string;
  job: JobInfo | null; // Job could be null if deleted
  status: string;
  createdAt: string;
  // Add other relevant fields if needed
};

// Define props interface
interface UserApplicationsProps {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
}

// Component now receives props
export function UserApplications({ applications, isLoading, error }: UserApplicationsProps) {
  // Use props for loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  // Use props for error state
  if (error) {
    return <div className="text-center py-12 text-red-600">Error loading applications: {error}</div>;
  }

  // Use props for application data
  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No applications yet</h3>
        <p className="text-gray-500 mt-2">Start applying for jobs to see your applications here</p>
        <Link href="/jobs" className="mt-4 inline-block">
          <Button>Browse Jobs</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
         // Handle cases where job might be null (e.g., deleted job)
         application.job ? (
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
                <p className="text-sm text-gray-500">
                  {application.job.company} • {application.job.location}
                </p>
                <p className="text-xs text-gray-500 mt-1">Applied on {formatDate(new Date(application.createdAt))}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={application.status} />
                <Link href={`/jobs/${application.job._id}`}>
                  <Button variant="outline" size="sm">
                    View Job
                  </Button>
                </Link>
              </div>
            </div>
         ) : (
            <div key={application._id} className="p-4 border rounded-lg text-sm text-muted-foreground">
                Application details unavailable (Job may have been removed).
            </div>
         )
      ))}
    </div>
  )
}

// StatusBadge component remains the same
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
