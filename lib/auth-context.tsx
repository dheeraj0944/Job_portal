"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// import * as Cookies from "js-cookie" // Remove js-cookie import
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  name: string
  email: string
  role: "user" | "recruiter"
  company?: string
  resumeUrl?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string, role: "user" | "recruiter") => Promise<void>
  register: (userData: any, role: "user" | "recruiter") => Promise<void>
  logout: () => void
  updateUser: (updatedUserData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in by fetching user data
    // Relies on the browser automatically sending the httpOnly cookie
    const checkAuth = async () => {
      setLoading(true) // Start loading
      try {
        // No need to manually get token, fetch sends cookie automatically
        const response = await fetch("/api/auth/me", {
           headers: {
             // No Authorization header needed if using httpOnly cookie
           }
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // If /api/auth/me fails (e.g., 401), assume not logged in
          setUser(null)
          // No need to remove cookie here, middleware handles redirects
        }
      } catch (error) {
        console.error("Authentication check error:", error)
        setUser(null) // Clear state on error
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, []) // Run only on mount

  const login = async (email: string, password: string, role: "user" | "recruiter") => {
    // No setLoading(true) needed here? Let the form handle its own loading state.
    // setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // API route now sets the httpOnly cookie.
      // No need to set cookie or token in localStorage/js-cookie here.
      // We need to update the user state based on the API response
      setUser(data.user)

      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.name}!`, // Use name from response
      })

      // Redirect based on role from response
      const targetPath = data.user.role === "user" ? "/dashboard" : "/recruiter/dashboard"
      console.log(`(Login) Attempting redirect to: ${targetPath}`)
      router.push(targetPath)
      console.log(`(Login) Redirect call to ${targetPath} initiated.`)

      // Do NOT set loading false here, redirect should unmount

    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      })
      // setLoading(false) // Form should handle its own loading state on error
      throw error // Re-throw for the form component to catch
    }
    // No finally block needed if form handles loading state
  }

  const register = async (userData: any, role: "user" | "recruiter") => {
    // setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...userData, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // API route should set the httpOnly cookie.
      // Update user state based on response
      setUser(data.user)

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
      })

      // Redirect based on role from response
      const targetPath = data.user.role === "user" ? "/dashboard" : "/recruiter/dashboard"
       console.log(`(Register) Attempting redirect to: ${targetPath}`)
      router.push(targetPath)
      console.log(`(Register) Redirect call to ${targetPath} initiated.`)

      // Do NOT set loading false here

    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
      // setLoading(false)
      throw error // Re-throw for the form component to catch
    }
  }

  const logout = async () => {
    try {
        // Call an API endpoint to clear the httpOnly cookie
        await fetch("/api/auth/logout", { method: "POST" })
        setUser(null)
        router.push("/") // Redirect to home
        toast({
            title: "Logged out",
            description: "You have been logged out successfully",
        })
    } catch (error) {
        console.error("Logout error:", error)
        toast({
            title: "Logout failed",
            description: "An error occurred during logout.",
            variant: "destructive",
        })
    }
  }

  const updateUser = (updatedUserData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...updatedUserData };
    });
    console.log('[AuthContext] User state updated locally.');
  };

  // Provide the context value
  // Note: The loading state here primarily reflects the initial checkAuth status.
  // Login/Register forms should manage their own submission loading state.
  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
