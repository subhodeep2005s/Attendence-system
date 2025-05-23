"use server"

import { connectToDatabase, Teacher, Student, Attendance } from "@/lib/db"
import { createToken, clearToken } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import type { Student as StudentType } from "@/lib/types"

export async function loginTeacher(username: string, password: string) {
  try {
    await connectToDatabase()

    const teacher = await Teacher.findOne({ username })

    if (!teacher) {
      return { success: false, error: "Invalid credentials" }
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password)

    if (!isPasswordValid) {
      return { success: false, error: "Invalid credentials" }
    }

    await createToken(teacher._id.toString())

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

export async function logoutTeacher() {
  try {
    await clearToken()
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: "An error occurred during logout" }
  }
}

export async function registerStudent(formData: any, profileImage: File | null) {
  try {
    await connectToDatabase()

    // Check if student with same roll number already exists
    const existingStudent = await Student.findOne({ rollNumber: formData.rollNumber })

    if (existingStudent) {
      return {
        success: false,
        error: "A student with this roll number already exists",
      }
    }

    // In a real app, you would upload the image to a storage service
    // and store the URL in the database
    let profileImageUrl = ""
    if (profileImage) {
      // Simulate image upload - in a real app, use a service like Vercel Blob
      profileImageUrl = `/placeholder.svg?height=200&width=200`
    }

    // Create new student
    const student = await Student.create({
      ...formData,
      profileImage: profileImageUrl,
    })

    revalidatePath("/dashboard/students")

    return { success: true, studentId: student._id.toString() }
  } catch (error) {
    console.error("Student registration error:", error)
    return {
      success: false,
      error: "An error occurred while registering the student",
    }
  }
}

// Add this function to check if a student's attendance has been marked today
export async function getStudentsForAttendance(): Promise<StudentType[]> {
  try {
    await connectToDatabase()

    // Get all students
    const students = (await Student.find().lean()) as unknown as StudentType[]

    // Get today's date (YYYY-MM-DD format)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get today's attendance records
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    }).lean()

    // Create a map of student IDs to attendance status
    const attendanceMap = new Map()
    attendanceRecords.forEach((record) => {
      attendanceMap.set(record.studentId.toString(), {
        isPresent: record.status === "present",
        attendanceMarkedToday: true,
      })
    })

    // Add isPresent and attendanceMarkedToday properties to each student
    const studentsWithAttendance = students.map((student) => {
      const attendanceInfo = attendanceMap.get(student._id.toString())
      return {
        ...student,
        isPresent: attendanceInfo ? attendanceInfo.isPresent : false,
        attendanceMarkedToday: attendanceInfo ? true : false,
      } as StudentType
    })

    return studentsWithAttendance
  } catch (error) {
    console.error("Error fetching students for attendance:", error)
    throw new Error("Failed to fetch students")
  }
}

// Update the markAttendance function to handle individual student marking
export async function markAttendance(attendanceData: Record<string, boolean>, date: string) {
  try {
    await connectToDatabase()

    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    // Process each student's attendance
    const operations = Object.entries(attendanceData).map(async ([studentId, isPresent]) => {
      // Find if there's an existing record for this student on this date
      const existingRecord = await Attendance.findOne({
        studentId,
        date: {
          $gte: attendanceDate,
          $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
        },
      })

      if (existingRecord) {
        // Update existing record
        await Attendance.updateOne({ _id: existingRecord._id }, { status: isPresent ? "present" : "absent" })
      } else {
        // Create new record
        await Attendance.create({
          studentId,
          date: attendanceDate,
          status: isPresent ? "present" : "absent",
        })
      }
    })

    await Promise.all(operations)

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/attendance")
    revalidatePath("/dashboard/students")

    return { success: true }
  } catch (error) {
    console.error("Error marking attendance:", error)
    return {
      success: false,
      error: "An error occurred while marking attendance",
    }
  }
}
