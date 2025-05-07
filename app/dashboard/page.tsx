"use client";

import { Suspense, useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { UserApplications } from "./user-applications"
import { RecommendedJobs } from "./recommended-jobs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, FileText, PieChart as PieChartIcon } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
};

type JobInfo = { _id: string; title: string; company: string; location: string; };
type Application = { _id: string; job: JobInfo | null; status: string; createdAt: string; };

// Type for chart data
type StatusCount = { name: string; value: number };

export default function UserDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError, setJobsError] = useState<string | null>(null)

  const [applications, setApplications] = useState<Application[]>([])
  const [appsLoading, setAppsLoading] = useState(true)
  const [appsError, setAppsError] = useState<string | null>(null)

  // State for chart data
  const [applicationStats, setApplicationStats] = useState<StatusCount[]>([])

  // State for the edit form (initialize with user data)
  const [editName, setEditName] = useState(user?.name || '')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Update form state if user data changes (e.g., after initial load)
  useEffect(() => {
    if (user) {
      setEditName(user.name)
    }
  }, [user])

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      setJobsLoading(true)
      setJobsError(null)
      try {
        const response = await fetch('/api/jobs/recommended')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Failed to fetch recommendations: ${response.statusText}`)
        }
        const data = await response.json()
        setRecommendedJobs(data.jobs || [])
      } catch (error) {
        console.error("Error fetching recommended jobs:", error)
        const message = error instanceof Error ? error.message : "An unknown error occurred"
        setJobsError(message)
        toast({
          title: "Error Fetching Jobs",
          description: `Could not load recommended jobs: ${message}`,
          variant: "destructive",
        })
      } finally {
        setJobsLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchRecommendedJobs()
    } else if (!authLoading && !user) {
      setJobsLoading(false)
    }
  }, [authLoading, user, toast])

  useEffect(() => {
    if (!authLoading && user) {
      const fetchApplicationsAndStats = async () => {
        setAppsLoading(true)
        setAppsError(null)
        setApplicationStats([])
        try {
          const response = await fetch('/api/applications/user')
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || `Failed to fetch applications: ${response.statusText}`)
          }
          const data = await response.json()
          const fetchedApps: Application[] = data.applications || []
          setApplications(fetchedApps)

          // --- Calculate Stats ---
          const stats: { [key: string]: number } = {}
          fetchedApps.forEach(app => {
            const status = app.status?.toLowerCase() || 'unknown'
            stats[status] = (stats[status] || 0) + 1
          })
          const chartData = Object.entries(stats).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
          }))
          setApplicationStats(chartData)
          // -----------------------
        } catch (err) {
          console.error("Error fetching user applications:", err)
          const message = err instanceof Error ? err.message : "An unknown error occurred"
          setAppsError(message)
          toast({
            title: "Error Fetching Applications",
            description: `Could not load your applications: ${message}`,
            variant: "destructive",
          })
        } finally {
          setAppsLoading(false)
        }
      }
      fetchApplicationsAndStats()
    } else if (!authLoading && !user) {
      setAppsLoading(false)
    }
  }, [authLoading, user, toast])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setResumeFile(event.target.files[0])
    } else {
      setResumeFile(null)
    }
  }

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', editName)
    if (resumeFile) {
      formData.append('resume', resumeFile)
    }
    try {
      const response = await fetch('/api/user/profile/update', {
        method: 'PUT',
        body: formData,
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile')
      }
      toast({ title: 'Profile Updated', description: result.message || 'Your profile has been saved.' })
      
      if (result.user?.name) {
        setEditName(result.user.name)
      }
      
      setResumeFile(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Profile update error:", error)
      toast({ title: 'Update Failed', description: error instanceof Error ? error.message : 'An unknown error occurred', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return <LoadingSkeleton />
  }

  if (!user || user.role !== "user") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Unauthorized access. Please log in as a user.</p>
        <Link href="/login">
          <Button variant="link">Login</Button>
        </Link>
      </div>
    )
  }

  // Chart Colors (example, customize as needed)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560']

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Welcome, {user.name}!</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                {user.resumeUrl ? (
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Resume Uploaded
                  </span>
                ) : (
                  <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> Resume not uploaded
                  </span>
                )}
              </div>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          value={user?.email || ''}
                          className="col-span-3"
                          readOnly
                          disabled
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="resume" className="text-right">
                          Resume
                        </Label>
                        <Input
                          id="resume"
                          type="file"
                          className="col-span-3 file:text-sm file:font-medium file:text-primary-foreground file:bg-primary file:border-0 file:rounded file:px-3 file:py-1.5 file:mr-3 hover:file:bg-primary/90"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt"
                        />
                      </div>
                      {resumeFile && (
                        <div className="grid grid-cols-4 items-center gap-4 text-sm"><span className="col-start-2 col-span-3 text-muted-foreground truncate">Selected: {resumeFile.name}</span></div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save changes'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-muted-foreground" /> Application Stats</CardTitle>
              <CardDescription>Summary of your application statuses.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {appsLoading ? (
                <div className="flex justify-center items-center h-40"><Skeleton className="h-32 w-32 rounded-full" /></div>
              ) : appsError ? (
                <div className="text-center text-sm text-red-600 py-4 px-2">Could not load application stats.</div>
              ) : applicationStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={applicationStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={5}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {applicationStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} applications`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10 text-sm text-muted-foreground">Apply for jobs to see your stats.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <h1 className="text-3xl font-bold mb-6">My Activity</h1>
        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="recommended">Recommended Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track the status of your job applications</CardDescription>
              </CardHeader>
              <CardContent>
                <UserApplications applications={applications} isLoading={appsLoading} error={appsError} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommended">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Jobs</CardTitle>
                <CardDescription>Jobs that match your profile and interests</CardDescription>
              </CardHeader>
              <CardContent>
                {jobsError ? (
                  <div className="text-red-600 text-center py-4">Error: {jobsError}</div>
                ) : (
                  <RecommendedJobs jobs={recommendedJobs} isLoading={jobsLoading} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function ApplicationsSkeleton() {
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
  )
}

function JobsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <Skeleton className="h-5 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
         <Skeleton className="h-32 w-full mb-8" />
         <Skeleton className="h-10 w-64 mb-6" />
         <Skeleton className="h-10 w-full mb-6" />
         <Skeleton className="h-64 w-full" />
      </main>
    </div>
  )
}
