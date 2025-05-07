"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [minSalary, setMinSalary] = useState(
    searchParams.get("minSalary") ? Number.parseInt(searchParams.get("minSalary")!) : 0,
  )

  const handleFilter = () => {
    const params = new URLSearchParams()

    if (location) params.set("location", location)
    if (category) params.set("category", category)
    if (minSalary > 0) params.set("minSalary", minSalary.toString())

    router.push(`/jobs?${params.toString()}`)
  }

  const handleReset = () => {
    setLocation("")
    setCategory("")
    setMinSalary(0)
    router.push("/jobs")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Jobs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, State, or Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {JOB_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="salary">Minimum Salary</Label>
            <span className="text-sm">${minSalary.toLocaleString()}</span>
          </div>
          <Slider
            id="salary"
            min={0}
            max={200000}
            step={10000}
            value={[minSalary]}
            onValueChange={(value) => setMinSalary(value[0])}
          />
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleFilter}>Apply Filters</Button>
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
