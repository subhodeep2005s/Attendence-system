import { Suspense } from "react"
import { getStudentById } from "@/lib/data"
import { DashboardHeader } from "@/components/dashboard-header"
import { StudentProfile } from "@/components/student-profile"
import { AttendanceCalendar } from "@/components/attendance-calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from "next/navigation"
import type { Student } from "@/lib/types"

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const student = await getStudentById(params.id)

  if (!student) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={student.name}
        description={`Student details and attendance for ${student.department}, Semester ${student.semester}`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <StudentProfile student={student} />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <AttendanceCalendar studentId={student._id} />
        </Suspense>
      </div>
    </div>
  )
}
