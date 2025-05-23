import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Student } from "@/lib/types"
import { Edit, Mail, Phone, Calendar, User2 } from "lucide-react"
import Link from "next/link"

interface StudentProfileProps {
  student: Student
}

export function StudentProfile({ student }: StudentProfileProps) {
  const attendancePercentage = student.attendancePercentage || 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Student Profile</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/students/${student._id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4 pb-4 pt-2">
          <Avatar className="h-24 w-24">
            <AvatarImage src={student.profileImage || ""} alt={student.name} />
            <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-xl font-semibold">{student.name}</h3>
            <p className="text-sm text-slate-500">
              {student.department}, Semester {student.semester}
            </p>
          </div>
          <div className="flex w-full justify-center gap-2">
            <Badge variant={student.isPresent ? "success" : "destructive"}>
              {student.isPresent ? "Present Today" : "Absent Today"}
            </Badge>
            <Badge variant={attendancePercentage >= 75 ? "outline" : "secondary"}>
              {attendancePercentage}% Attendance
            </Badge>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-2">
            <User2 className="mt-0.5 h-4 w-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium">Roll Number / ID</p>
              <p className="text-sm text-slate-500">{student.rollNumber}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Mail className="mt-0.5 h-4 w-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium">Email Address</p>
              <p className="text-sm text-slate-500">{student.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium">Phone Number</p>
              <p className="text-sm text-slate-500">{student.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium">Date of Birth</p>
              <p className="text-sm text-slate-500">{new Date(student.dob).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium">Parent/Guardian Contact</p>
              <p className="text-sm text-slate-500">{student.guardianContact}</p>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Attendance Statistics</p>
              <p className="text-sm text-slate-500">
                {student.daysPresent} / {student.totalDays} days
              </p>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full ${attendancePercentage >= 75 ? "bg-green-500" : "bg-amber-500"}`}
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
