import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { JobsList } from "./jobs-list"
import { JobFilters } from "./job-filters"
import { Skeleton } from "@/components/ui/skeleton"

export default function JobsPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <JobFilters />
          </div>
          <div className="md:col-span-3">
            <Suspense fallback={<JobsListSkeleton />}>
              <JobsList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}

function JobsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
