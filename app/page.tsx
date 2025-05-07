"use client"; // Add this directive for framer-motion

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Keep Input if needed elsewhere, otherwise remove
import { Search, Briefcase, Building, Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion"; // Import motion

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const transitionSettings = {
  duration: 0.6, // Slightly longer duration for smoother effect
  ease: "easeOut",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar is likely rendered in RootLayout now */}
      <main className="flex-1">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible" // Animate hero immediately on load
          variants={sectionVariants}
          transition={transitionSettings}
          // Adjusted dark mode gradient for a slightly deeper look
          className="w-full overflow-hidden bg-gradient-to-b from-white to-gray-100 py-12 dark:from-gray-950 dark:to-gray-800 md:py-24 lg:py-32 xl:py-48"
        >
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-balance text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Find Your Dream Job Today
                  </h1>
                  <p className="max-w-[600px] text-balance text-gray-500 dark:text-gray-400 md:text-xl">
                    Connect with top employers and discover opportunities that
                    match your skills and aspirations.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {/* Updated Link for registration clarity */}
                  <Link href="/register?role=user">
                    <Button size="lg" className="w-full">
                      Job Seeker Sign Up
                    </Button>
                  </Link>
                  <Link href="/register?role=recruiter">
                    <Button size="lg" variant="outline" className="w-full">
                      Recruiter Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
              <motion.div
                className="hidden lg:block"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, ...transitionSettings }}
              >
                {/* --- IMPORTANT --- */}
                {/* TODO: Replace '/placeholder.svg' with a relevant, high-quality image for your brand. */}
                {/* Suggestions: Unsplash, Pexels, or a custom illustration. */}
                {/* Ensure the image is optimized for web use. */}
                {/* --- IMPORTANT --- */}
                <img
                  alt="Diverse group of professionals collaborating" // More descriptive alt text
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                  // Using a dynamic placeholder image service - REPLACE with your actual image path in /public
                  src="https://picsum.photos/seed/jobportalhero/800/550" 
                  width={800}
                  height={550}
                />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // Trigger when 20% is visible
          variants={sectionVariants}
          transition={transitionSettings}
          className="w-full bg-white py-12 dark:bg-gray-950 md:py-24 lg:py-32"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-balance text-3xl font-bold tracking-tighter sm:text-5xl">
                  Why Choose FunkyHire?
                </h2>{" "}
                {/* Updated Name */}
                <p className="max-w-[900px] text-balance text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform connects talented professionals with leading
                  companies looking for the perfect fit.
                </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 lg:gap-12">
                {/* Feature 1 */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={sectionVariants}
                  transition={{ delay: 0.1, ...transitionSettings }}
                  className="flex flex-col items-center space-y-4 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 hover:scale-110">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Easy Job Search</h3>
                  <p className="text-balance text-gray-500 dark:text-gray-400">
                    Find relevant opportunities with our powerful search and
                    filtering tools.
                </p>
                </motion.div>
                {/* Feature 2 */}
                <motion.div
                   initial="hidden"
                   whileInView="visible"
                   viewport={{ once: true, amount: 0.3 }}
                   variants={sectionVariants}
                   transition={{ delay: 0.2, ...transitionSettings }}
                   className="flex flex-col items-center space-y-4 text-center"
                 >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 hover:scale-110">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Top Companies</h3>
                  <p className="text-balance text-gray-500 dark:text-gray-400">
                    Connect with industry-leading employers looking for talent
                    like you.
                </p>
                </motion.div>
                {/* Feature 3 */}
                 <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={sectionVariants}
                    transition={{ delay: 0.3, ...transitionSettings }}
                    className="flex flex-col items-center space-y-4 text-center"
                  >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 hover:scale-110">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Career Growth</h3>
                  <p className="text-balance text-gray-500 dark:text-gray-400">
                    Discover opportunities that align with your career goals
                    and aspirations.
                </p>
                 </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          transition={transitionSettings}
          className="w-full bg-gray-100 py-12 dark:bg-gray-800 md:py-24 lg:py-32"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-balance text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Start Your Journey?
                </h2>
                <p className="max-w-[600px] text-balance text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of professionals who found their dream jobs
                  through FunkyHire. {/* Updated Name */}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                <Link href="/jobs">
                  <Button size="lg">Browse Jobs</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      {/* No animation added to footer by default, but you can wrap it with motion.footer if desired */}
      <footer className="w-full bg-gray-100 py-6 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Briefcase className="h-5 w-5" />
              <span>FunkyHire</span> {/* Updated Name */}
            </Link>
            <nav className="flex gap-4 sm:gap-6">
              {/* Minimal footer nav */}
              <Link
                href="/jobs"
                className="text-sm hover:underline underline-offset-4"
              >
                Jobs
              </Link>
              {/* Add other footer links as needed */}
            </nav>
          </div>
          <div className="mt-6 flex justify-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} FunkyHire. All rights reserved.{" "}
            {/* Updated Name */}
          </div>
        </div>
      </footer>
    </div>
  );
}