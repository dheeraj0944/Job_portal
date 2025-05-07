import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { SignJWT, jwtVerify } from 'jose'
import type { JWTPayload } from 'jose'

const secretKey = process.env.JWT_SECRET || "jobhubsecret"
const key = new TextEncoder().encode(secretKey)

console.log(`[Utils] JWT Secret Used: ${process.env.JWT_SECRET ? 'Loaded from env' : 'Using fallback'}`)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSalary(min: number, max: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })

  return `${formatter.format(min)} - ${formatter.format(max)}`
}

export async function generateToken(userId: string, role: string) {
  console.log(`[Utils] Generating token for user: ${userId}, role: ${role}`)
  try {
    return await new SignJWT({ id: userId, role: role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(key)
  } catch (error) {
      console.error("[Utils] Error generating token:", error);
      throw new Error("Failed to generate token");
  }
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  if (!token) {
      return null
  }
  console.log("[Utils] Verifying token...")
  try {
    const { payload } = await jwtVerify(token, key, {
        algorithms: ['HS256']
    })
    console.log("[Utils] Token verified successfully.")
    return payload
  } catch (error) {
    console.error("[Utils] Token verification failed:", error instanceof Error ? error.message : String(error))
    return null
  }
}

export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
