import { cookies } from "next/headers"
import { verify, sign } from "jsonwebtoken"
import { connectToDatabase, Teacher } from "@/lib/db"
import bcrypt from "bcryptjs"
import type { Teacher as TeacherType } from "@/lib/types"
import type { Document } from "mongoose"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

interface JWTPayload {
  id: string
}

// Server-side functions
export async function getTeacherFromCookies() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")

  if (!token) {
    return null
  }

  try {
    const decoded = verify(token.value, JWT_SECRET) as JWTPayload

    await connectToDatabase()
    const teacher = await Teacher.findById(decoded.id).lean()

    if (!teacher) {
      return null
    }

    // Remove sensitive data
    const teacherDoc = teacher as unknown as TeacherType & Document
    const { password, ...teacherWithoutPassword } = teacherDoc
    return teacherWithoutPassword
  } catch (error) {
    return null
  }
}

export async function createToken(teacherId: string) {
  const token = sign({ id: teacherId }, JWT_SECRET, {
    expiresIn: "7d",
  })

  const cookieStore = await cookies()
  cookieStore.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return token
}

export async function clearToken() {
  const cookieStore = await cookies()
  cookieStore.delete("token")
}

export async function initializeTeacher() {
  try {
    await connectToDatabase()

    // Check if the default teacher already exists
    const existingTeacher = await Teacher.findOne({ username: "hod" })

    if (!existingTeacher) {
      // Create the default teacher
      const hashedPassword = await bcrypt.hash("admin", 10)

      await Teacher.create({
        username: "hod",
        password: hashedPassword,
        name: "Department Head",
        email: "hod@example.com",
      })

      console.log("Default teacher account created")
    }
  } catch (error) {
    console.error("Error initializing teacher:", error)
  }
}

// Initialize the default teacher on app startup
initializeTeacher()
