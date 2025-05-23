import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { AttendanceForm } from "@/components/attendance-form"
import { Skeleton } from "@/components/ui/skeleton"
import { getTeacherFromCookies } from "@/lib/auth"

export default async function AttendancePage() {
  const teacher = await getTeacherFromCookies()
  const teacherName = teacher?.name || "HoD"
  const collegeName = "College of Engineering"

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Mark Attendance"
        description="Record daily attendance for students"
        showGreeting={true}
        teacherName={teacherName}
        collegeName={collegeName}
      />

      <Suspense fallback={<Skeleton className="h-[600px]" />}>
        <AttendanceForm />
      </Suspense>
    </div>
  )
}
