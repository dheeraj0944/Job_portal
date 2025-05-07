"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Briefcase, Building, Upload } from "lucide-react"

export default function RegisterPage() {
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "user"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, role: "user" | "recruiter") => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const userData: any = { name, email, password }

      if (role === "recruiter") {
        const company = formData.get("company") as string
        if (!company) {
          setError("Company name is required")
          setIsLoading(false)
          return
        }
        userData.company = company
      }

      await register(userData, role)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unexpected error occurred")
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-gray-500 dark:text-gray-400">Enter your information to get started</p>
          </div>

          <Tabs defaultValue={defaultRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Seeker
              </TabsTrigger>
              <TabsTrigger value="recruiter" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Recruiter
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={(e) => handleSubmit(e, "user")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-user">Full Name</Label>
                  <Input id="name-user" name="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-user">Email</Label>
                  <Input id="email-user" name="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-user">Password</Label>
                  <Input id="password-user" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword-user">Confirm Password</Label>
                  <Input id="confirmPassword-user" name="confirmPassword" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resume-user" className="flex items-center gap-2">
                    Resume (Optional)
                    <Upload className="h-4 w-4" />
                  </Label>
                  <Input id="resume-user" name="resume" type="file" accept=".pdf,.doc,.docx" />
                  <p className="text-xs text-gray-500">Upload your resume to make applying for jobs easier</p>
                </div>
                {error && <div className="text-sm text-red-500">{error}</div>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="recruiter">
              <form onSubmit={(e) => handleSubmit(e, "recruiter")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-recruiter">Full Name</Label>
                  <Input id="name-recruiter" name="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-recruiter">Company Name</Label>
                  <Input id="company-recruiter" name="company" placeholder="Acme Inc." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-recruiter">Email</Label>
                  <Input id="email-recruiter" name="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-recruiter">Password</Label>
                  <Input id="password-recruiter" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword-recruiter">Confirm Password</Label>
                  <Input id="confirmPassword-recruiter" name="confirmPassword" type="password" required />
                </div>
                {error && <div className="text-sm text-red-500">{error}</div>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
