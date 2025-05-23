import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getRecentStudents } from "@/lib/data"
import Link from "next/link"

export async function RecentStudents() {
  const students = await getRecentStudents()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Added Students</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.length === 0 ? (
            <p className="text-sm text-slate-500">No students added yet.</p>
          ) : (
            students.map((student) => (
              <Link
                key={student._id.toString()}
                href={`/dashboard/students/${student._id.toString()}`}
                className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-slate-100"
              >
                <Avatar>
                  <AvatarImage src={student.profileImage || ""} alt={student.name} />
                  <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{student.name}</p>
                    <Badge variant={student.isPresent ? "success" : "destructive"}>
                      {student.isPresent ? "Present" : "Absent"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {student.department}, Semester {student.semester}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
