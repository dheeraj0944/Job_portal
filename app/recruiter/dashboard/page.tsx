import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { RecruiterJobs } from "./recruiter-jobs"
import { RecruiterApplications } from "./recruiter-applications"
import { Plus } from "lucide-react"

export default function RecruiterDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
          <Link href="/recruiter/jobs/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="jobs">My Job Listings</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>My Job Listings</CardTitle>
                <CardDescription>Manage your posted job listings</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<JobsSkeleton />}>
                  <RecruiterJobs />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
                <CardDescription>Review applications for your job listings</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ApplicationsSkeleton />}>
                  <RecruiterApplications />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function JobsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
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

function ApplicationsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
