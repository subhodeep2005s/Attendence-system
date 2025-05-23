import { connectToDatabase, Student, Attendance } from "@/lib/db"
import { Types } from "mongoose"
import type { Student as StudentType, Attendance as AttendanceType } from "@/lib/types"

export async function getStats() {
  await connectToDatabase()

  // Get total number of students
  const totalStudents = await Student.countDocuments()

  // Get today's date (YYYY-MM-DD format)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get attendance for today
  const todayAttendance = await Attendance.find({
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  })

  const presentToday = todayAttendance.filter((record) => record.status === "present").length

  const absentToday = todayAttendance.filter((record) => record.status === "absent").length

  // Calculate average attendance
  const totalAttendanceRecords = await Attendance.countDocuments()
  const totalPresentRecords = await Attendance.countDocuments({
    status: "present",
  })

  const averageAttendance =
    totalAttendanceRecords > 0 ? Math.round((totalPresentRecords / totalAttendanceRecords) * 100) : 0

  return {
    totalStudents,
    presentToday,
    absentToday,
    averageAttendance,
  }
}

export async function getStudents() {
  await connectToDatabase()

  const students = (await Student.find().sort({ createdAt: -1 }).lean()) as unknown as StudentType[]

  // Get today's date (YYYY-MM-DD format)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get today's attendance records
  const todayAttendance = (await Attendance.find({
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  }).lean()) as unknown as AttendanceType[]

  // Create a map of student IDs to attendance status
  const attendanceMap = new Map()
  todayAttendance.forEach((record) => {
    attendanceMap.set(record.studentId.toString(), record.status === "present")
  })

  // Add isPresent property to each student
  const studentsWithAttendance = students.map((student) => ({
    ...student,
    isPresent: attendanceMap.has(student._id.toString()) ? attendanceMap.get(student._id.toString()) : false,
  }))

  return studentsWithAttendance
}

export async function getRecentStudents() {
  await connectToDatabase()

  const students = (await Student.find().sort({ createdAt: -1 }).limit(5).lean()) as unknown as StudentType[]

  // Get today's date (YYYY-MM-DD format)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get today's attendance records
  const todayAttendance = (await Attendance.find({
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
    studentId: { $in: students.map((s) => s._id) },
  }).lean()) as unknown as AttendanceType[]

  // Create a map of student IDs to attendance status
  const attendanceMap = new Map()
  todayAttendance.forEach((record) => {
    attendanceMap.set(record.studentId.toString(), record.status === "present")
  })

  // Add isPresent property to each student
  const studentsWithAttendance = students.map((student) => ({
    ...student,
    isPresent: attendanceMap.has(student._id.toString()) ? attendanceMap.get(student._id.toString()) : false,
  }))

  return studentsWithAttendance
}

export async function getStudentById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null
  }

  await connectToDatabase()

  const student = (await Student.findById(id).lean()) as unknown as StudentType

  if (!student) {
    return null
  }

  // Get today's date (YYYY-MM-DD format)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get today's attendance record for this student
  const todayAttendance = (await Attendance.findOne({
    studentId: id,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  }).lean()) as unknown as AttendanceType | null

  // Get all attendance records for this student
  const allAttendance = (await Attendance.find({
    studentId: id,
  }).lean()) as unknown as AttendanceType[]

  const daysPresent = allAttendance.filter((record) => record.status === "present").length
  const totalDays = allAttendance.length
  const attendancePercentage = totalDays > 0 ? Math.round((daysPresent / totalDays) * 100) : 0

  return {
    _id: student._id.toString(),
    name: student.name,
    department: student.department,
    semester: student.semester,
    rollNumber: student.rollNumber,
    phone: student.phone,
    email: student.email,
    dob: student.dob,
    guardianContact: student.guardianContact,
    address: student.address || "",
    profileImage: student.profileImage || "",
    isPresent: todayAttendance ? todayAttendance.status === "present" : false,
    daysPresent,
    totalDays,
    attendancePercentage,
  }
}

export async function getStudentAttendance(studentId: string) {
  await connectToDatabase()

  const attendance = await Attendance.find({
    studentId,
  })
    .sort({ date: -1 })
    .lean()

  return attendance.map((record) => ({
    date: record.date,
    status: record.status,
  }))
}

export async function getAttendanceOverview() {
  await connectToDatabase()

  // Get the last 7 days
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    dates.push(date)
  }

  // Get attendance for each day
  const result = await Promise.all(
    dates.map(async (date) => {
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const records = await Attendance.find({
        date: {
          $gte: date,
          $lt: nextDay,
        },
      }).lean()

      const present = records.filter((record) => record.status === "present").length

      const absent = records.filter((record) => record.status === "absent").length

      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        present,
        absent,
      }
    }),
  )

  return result
}
