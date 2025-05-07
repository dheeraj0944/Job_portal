"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ArrowLeft, Check, X } from "lucide-react"

// Type for detailed application data (adjust based on API response)
type ApplicationDetails = {
  _id: string;
  job: { _id: string; title: string };
  user: { _id: string; name: string; email: string; resumeUrl?: string };
  status: string;
  coverLetter?: string;
  createdAt: string;
};

async function fetchApplicationDetails(applicationId: string): Promise<ApplicationDetails | null> {
  try {
    const response = await fetch(`/api/applications/${applicationId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to fetch application details');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching application details:", error);
    return null;
  }
}

export default function ReviewApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params?.applicationId as string;
  const { toast } = useToast();

  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch application details
  useEffect(() => {
    if (!applicationId) {
        setError("Application ID not found in URL.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    fetchApplicationDetails(applicationId).then(data => {
        if (data) {
            setApplication(data);
        } else {
            setError("Could not load application details.");
        }
        setIsLoading(false);
    });
  }, [applicationId]);

  // Handler to update status
  const handleUpdateStatus = async (newStatus: 'accepted' | 'rejected') => {
    if (!applicationId) return;
    setIsUpdating(true);
    try {
        const response = await fetch(`/api/applications/${applicationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to update status');
        }
        setApplication(prev => prev ? { ...prev, status: newStatus } : null); // Update local state
        toast({ title: "Status Updated", description: `Application marked as ${newStatus}.` });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update status";
        console.error("Status update error:", message);
        toast({ title: "Update Failed", description: message, variant: "destructive" });
    } finally {
        setIsUpdating(false);
    }
  };

  // Loading state
  if (isLoading) {
    return <div className="p-6 text-center">Loading application details...</div>;
  }

  // Error state
  if (error || !application) {
    return <div className="container mx-auto p-6 text-center text-red-500">
        Error: {error || 'Application not found'}
        <div className="mt-4">
             <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
             </Button>
        </div>
    </div>;
  }

  // Render application details
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Applications
       </Button>
      <h1 className="text-2xl font-bold mb-6">Review Application</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
           <Card>
             <CardHeader>
                <CardTitle>Applicant Information</CardTitle>
             </CardHeader>
             <CardContent className="space-y-2">
                <p><strong>Name:</strong> {application.user.name}</p>
                <p><strong>Email:</strong> {application.user.email}</p>
                {application.user.resumeUrl && (
                    <p><strong>Resume/Link:</strong> <Link href={application.user.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Online</Link></p>
                )}
             </CardContent>
           </Card>

           {application.coverLetter && (
             <Card>
                <CardHeader>
                    <CardTitle>Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{application.coverLetter}</p>
                </CardContent>
             </Card>
           )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            <Card>
               <CardHeader>
                   <CardTitle>Application Details</CardTitle>
               </CardHeader>
               <CardContent className="space-y-2">
                   <p><strong>Job:</strong> {application.job.title}</p>
                   <p><strong>Applied on:</strong> {formatDate(new Date(application.createdAt))}</p>
                   <div className="flex items-center gap-2 text-sm">
                       <strong>Current Status:</strong> <StatusBadge status={application.status} />
                   </div>
               </CardContent>
            </Card>

            {/* Action Buttons */}
            {application.status === 'pending' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-2">
                        <Button 
                            variant="outline"
                            className="flex-1 gap-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleUpdateStatus('accepted')}
                            disabled={isUpdating}
                        >
                            <Check className="w-4 h-4" /> Accept
                        </Button>
                        <Button 
                            variant="outline"
                            className="flex-1 gap-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleUpdateStatus('rejected')}
                            disabled={isUpdating}
                         >
                             <X className="w-4 h-4" /> Reject
                         </Button>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}

// Copy or import StatusBadge component
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