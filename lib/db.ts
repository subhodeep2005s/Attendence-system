import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/attendance-system"

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Teacher Schema
const teacherSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    email: { type: String },
  },
  { timestamps: true },
)

// Student Schema
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    dob: { type: String, required: true },
    guardianContact: { type: String, required: true },
    address: { type: String },
    profileImage: { type: String },
  },
  { timestamps: true },
)

// Attendance Schema
const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
  },
  { timestamps: true },
)

// Create compound index for studentId and date to ensure uniqueness
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true })

export const Teacher = mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema)
export const Student = mongoose.models.Student || mongoose.model("Student", studentSchema)
export const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema)
