"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete job")
      }

      toast({
        title: "Job deleted",
        description: "The job listing has been deleted successfully",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete job",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4 text-red-500" />
          <span className="sr-only">Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the job listing and all associated applications.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-red-500 hover:bg-red-600">
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
