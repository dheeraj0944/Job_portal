import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/user"
import { generateToken } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password, role } = await request.json()

    // Find user
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Check if role matches
    if (role && user.role !== role) {
      return NextResponse.json({ message: `Invalid account type. Please login as a ${role}` }, { status: 401 })
    }

    // Check password
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Generate token (now async)
    const token: string = await generateToken(user._id.toString(), user.role)

    // Set cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        },
        token,
      },
      { status: 200 },
    )

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
