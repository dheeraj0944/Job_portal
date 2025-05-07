import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/user"
import { verifyToken } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get token from header (adjust if using httpOnly cookie approach later)
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
       // If using cookies, you'd check request.cookies here instead
      return NextResponse.json({ message: "Not authorized, no token" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1] // Adjust if using cookies

    // Verify token
    const decoded = await verifyToken(token) // Assuming verifyToken is async now

    if (!decoded) {
      return NextResponse.json({ message: "Not authorized, token failed" }, { status: 401 })
    }

    // Get user (adjust model if needed)
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Return user data (adjust fields as needed)
    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // Add other fields like company or resumeUrl if applicable
      // company: user.company,
      // resumeUrl: user.resumeUrl,
    })

  } catch (error) {
    console.error("Auth check error in /api/auth/me:", error)
     // Handle specific errors like invalid token differently if needed
    return NextResponse.json({ message: "Server error during auth check" }, { status: 500 })
  }
}
