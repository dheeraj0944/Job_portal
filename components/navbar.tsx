"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Briefcase, LogOut, Menu, User, Moon, Sun } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useTheme } from "next-themes"

// Theme Toggle Component (can be moved to its own file later)
function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Briefcase className="h-5 w-5" />
          <span>FunkyHire</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/jobs" className="text-sm font-medium hover:underline underline-offset-4">
            Browse Jobs
          </Link>

          {!user ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={user.role === "user" ? "/dashboard" : "/recruiter/dashboard"}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={user.role === 'user' ? '/profile' : '/recruiter/profile'}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Theme Toggle (Desktop) */}
        <div className="hidden md:flex items-center mr-4">
          <ModeToggle />
        </div>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            {/* Add Theme Toggle to Mobile Menu */}
            <div className="absolute top-4 right-4">
              <ModeToggle />
            </div>
            <nav className="flex flex-col gap-4 mt-8">
              <Link
                href="/jobs"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setOpen(false)}
              >
                Browse Jobs
              </Link>

              {!user ? (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={user.role === "user" ? "/dashboard" : "/recruiter/dashboard"}
                    className="text-sm font-medium hover:underline underline-offset-4"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={user.role === 'user' ? '/profile' : '/recruiter/profile'}
                    className="text-sm font-medium hover:underline underline-offset-4"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                  <Button
                    variant="outline"
                    className="gap-2 mt-4 text-red-500"
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
