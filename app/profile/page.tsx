import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import mongoose, { Document as MongooseDocument } from "mongoose";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { verifyToken } from "@/lib/utils";
import connectToDB from "@/lib/db";
import Application from "@/lib/models/application"; 
import ApplicationStatusPieChart from "@/components/charts/ApplicationStatusPieChart";
import { FileText, Hourglass, CheckCircle2, XCircle, Eye } from 'lucide-react'; // Icons for app stats

// FIXME: Verify this against the actual structure from verifyToken in lib/utils.ts
// Ensure this DecodedUser matches the one in recruiter profile or is defined in lib/utils.ts
interface DecodedUser {
  id: string; 
  name: string;
  email: string;
  role: 'user' | 'recruiter';
  company?: string; // For recruiters
  resumeUrl?: string; // For users
}

// FIXME: Ensure this ApplicationDocument matches the one in recruiter profile or is defined alongside the model
interface ApplicationDocument extends MongooseDocument { 
  _id: mongoose.Types.ObjectId | string;
  job: mongoose.Types.ObjectId | string; // Populate if you need job details
  user: mongoose.Types.ObjectId | string;
  coverLetter?: string;
  resumeUrl?: string; // This is distinct from user.resumeUrl which is the user's primary resume
  status: 'pending' | 'reviewed' | 'rejected' | 'accepted';
  createdAt?: Date;
  updatedAt?: Date;
}

export default async function UserProfilePage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");
  const token = tokenCookie?.value;

  if (!token) {
    redirect("/login?message=Please login to view your profile.");
  }

  const user = await verifyToken(token) as DecodedUser | null;

  if (!user || user.role !== 'user') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            You must be logged in as a job seeker to view this page.
            {user && user.role === 'recruiter' ? (
                <Link href="/recruiter/profile" className="ml-2 font-semibold underline">Go to Recruiter Profile.</Link>
            ) : (
                <Link href="/login" className="ml-2 font-semibold underline">Login here.</Link>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  await connectToDB();
  const applications = await Application.find({ user: user.id }).lean() as unknown as ApplicationDocument[];

  // Calculate Application Statistics
  const totalApplicationsSubmitted = applications.length;
  const applicationsPending = applications.filter(app => app.status === 'pending').length;
  const applicationsReviewed = applications.filter(app => app.status === 'reviewed').length;
  const applicationsAccepted = applications.filter(app => app.status === 'accepted').length;
  const applicationsRejected = applications.filter(app => app.status === 'rejected').length;

  // Prepare data for Pie Chart
  const applicationStatusData = [
    { name: 'Pending', value: applicationsPending, fill: '#FFBB28' }, // Yellow
    { name: 'Reviewed', value: applicationsReviewed, fill: '#0088FE' }, // Blue
    { name: 'Accepted', value: applicationsAccepted, fill: '#00C49F' }, // Green
    { name: 'Rejected', value: applicationsRejected, fill: '#FF8042' },  // Orange
  ].filter(status => status.value > 0); // Only include statuses with counts > 0

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Profile & Applications</h1>

      {/* User Profile Information Card */}
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{String(user.name || '')}</CardTitle>
          <CardDescription>Manage your job seeker profile information.</CardDescription>
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
          {user.resumeUrl && (
            <div className="space-y-1">
              <Label htmlFor="resumeUrl">My Resume Link</Label>
              <div className="flex items-center gap-2">
                 <Input id="resumeUrl" value={user.resumeUrl} readOnly disabled />
                 <Button variant="outline" size="sm" asChild>
                    <Link href={user.resumeUrl} target="_blank" rel="noopener noreferrer">View</Link>
                 </Button>
              </div>
            </div>
           )}
           {/* TODO: Add Edit Profile functionality */}
        </CardContent>
      </Card>

      {/* Application Statistics Summary Card */}
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
          <CardDescription>Overview of your job applications.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 bg-secondary/30 rounded-lg flex flex-col items-center justify-center text-center">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2 sm:mb-3" />
            <p className="text-2xl sm:text-3xl font-bold">{totalApplicationsSubmitted}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Submitted</p>
          </div>
          <div className="p-4 sm:p-6 bg-secondary/30 rounded-lg flex flex-col items-center justify-center text-center">
            <Hourglass className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500 mb-2 sm:mb-3" />
            <p className="text-2xl sm:text-3xl font-bold">{applicationsPending}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="p-4 sm:p-6 bg-secondary/30 rounded-lg flex flex-col items-center justify-center text-center">
            <Eye className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 mb-2 sm:mb-3" /> 
            <p className="text-2xl sm:text-3xl font-bold">{applicationsReviewed}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Reviewed</p>
          </div>
          <div className="p-4 sm:p-6 bg-secondary/30 rounded-lg flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 mb-2 sm:mb-3" />
            <p className="text-2xl sm:text-3xl font-bold">{applicationsAccepted}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Accepted</p>
          </div>
          {/* Optionally add rejected count here if desired */}
        </CardContent>
      </Card>
      
      {/* Application Status Distribution Chart */}
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Application Status Distribution</CardTitle>
          <CardDescription>Breakdown of your application statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationStatusPieChart data={applicationStatusData} />
        </CardContent>
      </Card>

    </div>
  );
} 