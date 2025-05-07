import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Create a response object
    const response = NextResponse.json({ message: "Logout successful" }, { status: 200 })

    // Clear the token cookie by setting it with an immediate expiration date
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      expires: new Date(0), // Set expiry date to the past
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
