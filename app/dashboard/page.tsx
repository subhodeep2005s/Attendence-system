import { Suspense } from "react"
import { DashboardStats } from "@/components/dashboard-stats"
import { DashboardHeader } from "@/components/dashboard-header"
import { RecentStudents } from "@/components/recent-students"
import { AttendanceOverview } from "@/components/attendance-overview"
import { Skeleton } from "@/components/ui/skeleton"
import { getTeacherFromCookies } from "@/lib/auth"

export default async function DashboardPage() {
  const teacher = await getTeacherFromCookies()
  const teacherName = teacher?.name || "HoD"
  const collegeName = "College of Engineering"

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Dashboard"
        description="Overview of student attendance"
        showGreeting={true}
        teacherName={teacherName}
        collegeName={collegeName}
      />

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[350px]" />}>
          <AttendanceOverview />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[350px]" />}>
          <RecentStudents />
        </Suspense>
      </div>
    </div>
  )
}
