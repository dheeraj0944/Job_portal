import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import mongoose, { Document as MongooseDocument } from "mongoose"; // Import mongoose and Document
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { verifyToken } from "@/lib/utils";
import connectToDB from "@/lib/db";
// Reverting to alias path for Job model, assuming tsconfig paths are set up
import Job from "@/lib/models/job"; 
import { Briefcase, FileText, PlusCircle, Users, FileSignature, TrendingUp } from 'lucide-react';
import JobCategoryPieChart from "@/components/charts/JobCategoryPieChart";
import JobsPostedBarChart from "@/components/charts/JobsPostedBarChart";
import Application from "@/lib/models/application"; // Import Application model

// FIXME: Verify this against the actual structure from verifyToken in lib/utils.ts
interface DecodedUser {
  id: string; 
  name: string;
  email: string;
  role: 'user' | 'recruiter';
  company?: string;
}

interface JobDocument extends MongooseDocument { 
  _id: mongoose.Types.ObjectId | string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salaryMin: number;
  salaryMax: number;
  category: string;
  recruiter: mongoose.Types.ObjectId | string; 
  createdAt?: Date;
  updatedAt?: Date;
  // status?: 'open' | 'closed' | 'pending'; // Add if you have a status field
}

// Define ApplicationDocument interface based on lib/models/application.ts
interface ApplicationDocument extends MongooseDocument {
  _id: mongoose.Types.ObjectId | string;
  job: mongoose.Types.ObjectId | string;
  user: mongoose.Types.ObjectId | string;
  coverLetter?: string;
  resumeUrl?: string;
  status: 'pending' | 'reviewed' | 'rejected' | 'accepted';
  createdAt?: Date;
  updatedAt?: Date;
}

export default async function RecruiterProfilePage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");
  const token = tokenCookie?.value;

  if (!token) {
    redirect("/login?message=Please login to view your profile.");
  }

  const user = await verifyToken(token) as DecodedUser | null;

  if (!user || user.role !== 'recruiter') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Access denied. You must be a logged-in recruiter.
            <Link href="/login" className="ml-2 font-semibold underline">Login here.</Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  await connectToDB();
  const jobs = await Job.find({ recruiter: user.id }).lean() as unknown as JobDocument[];

  // --- Fetch Applications Data ---
  let applications: ApplicationDocument[] = [];
  if (jobs.length > 0) {
    const jobIds = jobs.map(job => job._id);
    applications = await Application.find({ job: { $in: jobIds } }).lean() as unknown as ApplicationDocument[];
  }

  // --- Calculate Job Statistics (existing) ---
  const totalJobsPosted = jobs.length;
  
  // FIXME: Logic for active jobs. Update if you add a status field to your Job model.
  const activeJobs = totalJobsPosted; 

  // --- Calculate Application Statistics ---
  const totalApplicationsReceived = applications.length;
  const averageApplicationsPerJob = jobs.length > 0 ? parseFloat((totalApplicationsReceived / totalJobsPosted).toFixed(1)) : 0;
  const applicationsPendingReview = applications.filter(app => app.status === 'pending').length;

  // --- DATA PROCESSING FOR CHARTS --- 

  // 1. Job Categories Distribution
  const categoryCounts: { [key: string]: number } = {};
  jobs.forEach(job => {
    if (job.category) { // Ensure category exists
      categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
    }
  });
  const jobCategoriesData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // 2. Jobs Posted Monthly (last 12 months)
  const monthlyJobCounts: { [key: string]: number } = {};
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear() -1, now.getMonth(), 1);

  // Initialize counts for the last 12 months to ensure all months appear
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthYearKey = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyJobCounts[monthYearKey] = 0;
  }

  jobs.forEach(job => {
    if (job.createdAt) {
      const createdAtDate = new Date(job.createdAt);
      if (createdAtDate >= twelveMonthsAgo) {
        const monthYearKey = createdAtDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (monthlyJobCounts.hasOwnProperty(monthYearKey)) { // Only count if it's within our initialized 12 months
             monthlyJobCounts[monthYearKey] = (monthlyJobCounts[monthYearKey] || 0) + 1;
        }
      }
    }
  });
  
  // Sort monthly data chronologically before mapping
  const jobsPostedMonthlyData = Object.entries(monthlyJobCounts)
    .map(([name, jobsCount]) => ({ name, jobs: jobsCount }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()); // Ensure chronological order

  // For verification (remove later)
  console.log("Job Categories Data:", JSON.stringify(jobCategoriesData, null, 2));
  console.log("Jobs Posted Monthly Data:", JSON.stringify(jobsPostedMonthlyData, null, 2));

  // --- END DATA PROCESSING FOR CHARTS ---

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Recruiter Dashboard</h1>

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{String(user.name || '')}</CardTitle>
          <CardDescription>Your recruiter profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={String(user.name || '')} readOnly disabled />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={String(user.email || '')} readOnly disabled />
          </div>
          {user.company && (
            <div className="space-y-1">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={String(user.company || '')} readOnly disabled />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/recruiter/jobs/new" legacyBehavior passHref>
            <a className="block">
              <Button className="w-full h-full text-left justify-start py-4">
                <PlusCircle className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Post a New Job</p>
                  <p className="text-sm text-muted-foreground">Create and publish a new job listing.</p>
                </div>
              </Button>
            </a>
          </Link>
          <Link href="/recruiter/dashboard" legacyBehavior passHref> 
            <a className="block">
              <Button variant="outline" className="w-full h-full text-left justify-start py-4">
                <Briefcase className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">View My Job Postings</p>
                  <p className="text-sm text-muted-foreground">Manage your existing job listings.</p>
                </div>
              </Button>
            </a>
          </Link>
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Job Statistics</CardTitle>
          <CardDescription>Overview of your job posting activity.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 bg-secondary/30 rounded-lg flex flex-col items-center justify-center text-center">
            <FileText className="h-10 w-10 text-primary mb-3" />
            <p className="text-3xl font-bold">{totalJobsPosted}</p>
            <p className="text-muted-foreground">Total Jobs Posted</p>
          </div>
          <div className="p-6 bg-secondary/30 rounded-lg flex flex-col items-center justify-center text-center">
            <Briefcase className="h-10 w-10 text-green-600 mb-3" />
            <p className="text-3xl font-bold">{activeJobs}</p>
            <p className="text-muted-foreground">Active Jobs</p>
          </div>
        </CardContent>
      </Card>

      {/* --- NEW Application Statistics Card --- */}
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Application Statistics</CardTitle>
          <CardDescription>Overview of applications received.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-secondary/30 rounded-lg flex flex-col items-center justify-center text-center">
            <Users className="h-10 w-10 text-blue-600 mb-3" />
            <p className="text-3xl font-bold">{totalApplicationsReceived}</p>
            <p className="text-muted-foreground">Total Applications</p>
          </div>
          <div className="p-6 bg-secondary/30 rounded-lg flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-10 w-10 text-purple-600 mb-3" />
            <p className="text-3xl font-bold">{averageApplicationsPerJob}</p>
            <p className="text-muted-foreground">Avg. Apps / Job</p>
          </div>
          <div className="p-6 bg-secondary/30 rounded-lg flex flex-col items-center justify-center text-center">
            <FileSignature className="h-10 w-10 text-orange-500 mb-3" />
            <p className="text-3xl font-bold">{applicationsPendingReview}</p>
            <p className="text-muted-foreground">Pending Review</p>
          </div>
        </CardContent>
      </Card>

      {/* Job Categories Chart */}
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Job Category Distribution</CardTitle>
          <CardDescription>Breakdown of jobs by category.</CardDescription>
        </CardHeader>
        <CardContent>
          <JobCategoryPieChart data={jobCategoriesData} />
        </CardContent>
      </Card>

      {/* Jobs Posted Monthly Chart */}
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Monthly Job Postings</CardTitle>
          <CardDescription>Number of jobs posted in the last 12 months.</CardDescription>
        </CardHeader>
        <CardContent>
          <JobsPostedBarChart data={jobsPostedMonthlyData} />
        </CardContent>
      </Card>
    </div>
  );
} 