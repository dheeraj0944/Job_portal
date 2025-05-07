"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ArrowLeft } from 'lucide-react'

// Define types for Application and Job (adjust as needed)
type UserSummary = {
    _id: string;
    name: string;
    email: string;
};

type JobSummary = {
    _id: string;
    title: string;
}

type ApplicationData = {
    _id: string;
    job: JobSummary;
    user: UserSummary;
    status: string;
    coverLetter?: string;
    resumeUrl?: string;
    createdAt: string; // Assuming ISO string format from API
};

async function fetchJobApplications(jobId: string): Promise<ApplicationData[]> {
    // Fetch applications specifically for this job
    // NOTE: This assumes an API endpoint exists at /api/jobs/[jobId]/applications
    // We may need to create this endpoint.
    const response = await fetch(`/api/jobs/${jobId}/applications`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) // Handle non-JSON error responses
        throw new Error(errorData.message || 'Failed to fetch applications');
    }
    return await response.json();
}

async function fetchJobTitle(jobId: string): Promise<string> {
    // Fetch job details just to get the title
    const response = await fetch(`/api/jobs/${jobId}`);
    if (!response.ok) return "Job"; // Fallback title
    const jobData = await response.json();
    return jobData?.title || "Job";
}


export default function JobApplicationsPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params?.jobId as string;

    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [jobTitle, setJobTitle] = useState<string>("Job");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!jobId) return;

        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch job title and applications concurrently
                const [title, apps] = await Promise.all([
                    fetchJobTitle(jobId),
                    fetchJobApplications(jobId)
                ]);
                setJobTitle(title);
                setApplications(apps);
            } catch (err) {
                 const message = err instanceof Error ? err.message : "An unknown error occurred";
                 console.error("Error loading applications:", message);
                 setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [jobId]);

     if (isLoading) {
        return <div className="p-6 text-center">Loading applications...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold mb-6">Applications for {jobTitle}</h1>

            {error && (
                 <div className="p-6 text-center text-red-500 bg-red-50 border border-red-200 rounded-md">
                     Error loading applications: {error}
                     <p className="text-sm text-gray-600 mt-2">Ensure the API endpoint `/api/jobs/{jobId}/applications` exists and is working correctly.</p>
                 </div>
            )}

            {!error && applications.length === 0 && (
                <div className="text-center py-12 border rounded-md">
                    <h3 className="text-lg font-medium">No applications received yet</h3>
                    <p className="text-gray-500 mt-2">Check back later for new applications.</p>
                </div>
            )}

            {!error && applications.length > 0 && (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div key={app._id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="font-medium">{app.user.name}</p>
                                <p className="text-sm text-gray-600">{app.user.email}</p>
                                <p className="text-xs text-gray-500 mt-1">Applied on {formatDate(new Date(app.createdAt))}</p>
                                {app.coverLetter && <p className="text-sm mt-2 italic line-clamp-2">"{app.coverLetter}"</p>}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <StatusBadge status={app.status} />
                                {/* Link to a future detailed application review page */}
                                <Button variant="outline" size="sm" disabled>Review</Button> 
                                {app.resumeUrl && (
                                     <Button variant="secondary" size="sm" asChild>
                                        <Link href={app.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</Link>
                                     </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Re-use StatusBadge or import if defined elsewhere
function StatusBadge({ status }: { status: string }) {
  let variant: "outline" | "secondary" | "destructive" = "outline";
  let className = "";

  switch (status?.toLowerCase()) {
    case "accepted":
      variant = "secondary";
      className = "bg-green-100 text-green-800 border-green-200";
      break;
    case "rejected":
      variant = "destructive";
      className = "bg-red-100 text-red-800 border-red-200";
      break;
    case "pending":
    default:
      variant = "outline";
      className = "bg-yellow-50 text-yellow-800 border-yellow-200";
      status = "Pending"; // Ensure consistent capitalization
      break;
  }

  return <Badge variant={variant} className={className}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
} 