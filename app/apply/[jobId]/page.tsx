"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input" // Added for resume URL placeholder
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Function to fetch minimal job details (like title)
async function fetchJobTitle(jobId: string): Promise<string | null> {
    try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) return null;
        const jobData = await response.json();
        return jobData?.title || null;
    } catch (error) {
        console.error("Error fetching job title:", error);
        return null;
    }
}

export default function ApplyPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params?.jobId as string
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [jobTitle, setJobTitle] = useState<string | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [resumeUrl, setResumeUrl] = useState("") // Placeholder state
  const [isLoading, setIsLoading] = useState(true) // For fetching job title
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch Job Title
  useEffect(() => {
    if (!jobId) {
        setError("Job ID not found in URL.")
        setIsLoading(false)
        return;
    }
    setIsLoading(true);
    fetchJobTitle(jobId).then(title => {
        if (title) {
            setJobTitle(title);
        } else {
            setError("Could not load job details.");
        }
        setIsLoading(false);
    });
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!jobId || !user) {
      setError("Cannot submit application. Missing job ID or user not logged in.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization header not needed if using httpOnly cookie
        },
        body: JSON.stringify({
            jobId: jobId,
            coverLetter: coverLetter,
            resumeUrl: resumeUrl || undefined, // Send resumeUrl or undefined
         }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit application')
      }

      toast({
        title: "Application Submitted",
        description: "Your application has been sent successfully.",
      })
      router.push('/dashboard') // Redirect user to their dashboard
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(message)
      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle loading states
  if (authLoading || isLoading) {
    return <div className="p-6 text-center">Loading application form...</div>
  }

  // Handle not logged in
  if (!user) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Alert variant="destructive">
                <AlertDescription>
                    You must be logged in to apply. 
                    <Link href={`/login?redirect=/apply/${jobId}`} className="ml-2 font-semibold underline">Login here.</Link>
                </AlertDescription>
            </Alert>
        </div>
    )
  }
  
  // Handle user not being a 'user' role
    if (user.role !== 'user') {
      return (
        <div className="container mx-auto px-4 py-8">
            <Alert variant="destructive">
                <AlertDescription>
                   Only registered job seekers can apply for jobs. Recruiters cannot apply.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  // Handle error loading job title
  if (error && !jobTitle) {
     return <div className="p-6 text-center text-red-500">Error: {error}</div>
  }

  // Render the form
  return (
    <div className="container mx-auto px-4 py-8">
       <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Job Details
       </Button>
      <h1 className="text-2xl font-bold mb-2">Apply for: {jobTitle || `Job ID: ${jobId}`}</h1>
      <p className="text-muted-foreground mb-6">Submit your application below.</p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto border p-6 rounded-lg">
        <div>
          <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
          <Textarea
            id="coverLetter"
            name="coverLetter"
            rows={8}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="mt-1"
            placeholder="Write a brief message to the recruiter..."
          />
        </div>

        {/* Basic Resume URL Input - Replace with actual file upload later */}
        <div>
            <Label htmlFor="resumeUrl">Resume URL (Optional)</Label>
            <Input
                id="resumeUrl"
                name="resumeUrl"
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="mt-1"
                placeholder="https://linkedin.com/in/yourprofile or https://yourdomain.com/resume.pdf"
            />
            <p className="text-xs text-muted-foreground mt-1">Link to your online resume or portfolio (e.g., LinkedIn, personal website, PDF link).</p>
        </div>

        {/* Display Submission Error */}
        {error && (
          <p className="text-sm text-red-500">Error: {error}</p>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
             <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
             </Button>
             <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting ? 'Submitting...' : 'Submit Application'}
             </Button>
        </div>
      </form>
    </div>
  )
} 