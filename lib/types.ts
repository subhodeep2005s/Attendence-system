import type { Types } from "mongoose"

export interface Teacher {
  _id: Types.ObjectId
  username: string
  password: string
  name?: string
  email?: string
  createdAt: Date
  updatedAt: Date
}

export interface Student {
  _id: Types.ObjectId | string
  name: string
  department: string
  semester: string
  rollNumber: string
  phone: string
  email: string
  dob: string
  guardianContact: string
  address?: string
  profileImage?: string
  isPresent?: boolean
  attendancePercentage?: number
  daysPresent?: number
  totalDays?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Attendance {
  _id: Types.ObjectId
  studentId: Types.ObjectId
  date: Date
  status: "present" | "absent"
  createdAt: Date
  updatedAt: Date
}

export interface AttendanceRecord {
  date: string
  status: "present" | "absent"
}
