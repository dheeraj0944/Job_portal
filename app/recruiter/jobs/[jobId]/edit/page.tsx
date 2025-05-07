"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Define a type for the job data (adjust fields as needed)
type JobData = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salaryMin?: number;
  salaryMax?: number;
  category: string;
};

export default function EditJobPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params?.jobId as string // Get jobId from dynamic route parameter
  const { toast } = useToast()

  const [job, setJob] = useState<JobData | null>(null)
  const [formData, setFormData] = useState<Partial<JobData>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch job details')
        }
        const data: JobData = await response.json()
        setJob(data)
        setFormData({
            title: data.title,
            company: data.company,
            location: data.location,
            description: data.description,
            requirements: data.requirements,
            salaryMin: data.salaryMin,
            salaryMax: data.salaryMax,
            category: data.category,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        toast({
          title: "Error fetching job",
          description: err instanceof Error ? err.message : "Could not load job data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [jobId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update job')
      }

      toast({
        title: "Job updated",
        description: "Job details have been saved successfully.",
      })
      router.push('/recruiter/dashboard') // Redirect back to dashboard after update
      router.refresh() // Ensure dashboard data is fresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      toast({
        title: "Error updating job",
        description: err instanceof Error ? err.message : "Could not save job data.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading job details...</div>
  }

  if (error || !job) {
    return <div className="p-6 text-red-500">Error loading job: {error || 'Job not found'}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Job Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        {/* Job Title */}
        <div>
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>

        {/* Company */}
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            value={formData.company || ''}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category</Label>
          <Input // Consider using a Select component if categories are predefined
            id="category"
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salaryMin">Minimum Salary (Optional)</Label>
            <Input
              id="salaryMin"
              name="salaryMin"
              type="number"
              value={formData.salaryMin === undefined ? '' : formData.salaryMin}
              onChange={handleChange}
              className="mt-1"
              placeholder="e.g., 50000"
            />
          </div>
          <div>
            <Label htmlFor="salaryMax">Maximum Salary (Optional)</Label>
            <Input
              id="salaryMax"
              name="salaryMax"
              type="number"
              value={formData.salaryMax === undefined ? '' : formData.salaryMax}
              onChange={handleChange}
              className="mt-1"
              placeholder="e.g., 80000"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description || ''}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>

        {/* Requirements */}
        <div>
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
            id="requirements"
            name="requirements"
            rows={5}
            value={formData.requirements || ''}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-500">Error: {error}</p>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
             <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
             </Button>
             <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting ? 'Saving...' : 'Save Changes'}
             </Button>
        </div>
      </form>
    </div>
  )
} 