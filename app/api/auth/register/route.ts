import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/user"
import { generateToken } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { name, email, password, role, company } = await request.json()

    // Check if user already exists
    const userExists = await User.findOne({ email })

    if (userExists) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Create user
    const userData: any = {
      name,
      email,
      password,
      role: role || "user",
    }

    if (role === "recruiter" && company) {
      userData.company = company
    }

    const user = await User.create(userData)

    // Generate token
    const token = generateToken(user._id.toString())

    // Set cookie
    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        },
        token,
      },
      { status: 201 },
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
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
