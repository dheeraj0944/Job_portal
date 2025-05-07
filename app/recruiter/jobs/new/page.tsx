"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Navbar } from "@/components/navbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const JOB_CATEGORIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Marketing",
  "Sales",
  "Design",
  "Engineering",
  "Customer Service",
  "Other",
]

export default function NewJobPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const jobData = {
      title: formData.get("title"),
      company: formData.get("company"),
      location: formData.get("location"),
      description: formData.get("description"),
      requirements: formData.get("requirements"),
      salaryMin: Number.parseInt(formData.get("salaryMin") as string),
      salaryMax: Number.parseInt(formData.get("salaryMax") as string),
      category: formData.get("category"),
    }

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create job")
      }

      toast({
        title: "Job created",
        description: "Your job listing has been created successfully!",
      })

      router.push("/recruiter/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create job",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Fill out the form below to create a new job listing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" name="title" placeholder="e.g. Frontend Developer" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" name="company" placeholder="e.g. Acme Inc." required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" placeholder="e.g. New York, NY or Remote" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Minimum Salary</Label>
                  <Input id="salaryMin" name="salaryMin" type="number" placeholder="e.g. 50000" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Maximum Salary</Label>
                  <Input id="salaryMax" name="salaryMax" type="number" placeholder="e.g. 80000" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                  className="min-h-[150px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="List the skills, experience, and qualifications required for this role..."
                  className="min-h-[150px]"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Job Listing"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
