import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { StudentList } from "@/components/student-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { getTeacherFromCookies } from "@/lib/auth"

export default async function StudentsPage() {
  const teacher = await getTeacherFromCookies()
  const teacherName = teacher?.name || "HoD"
  const collegeName = "College of Engineering"

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <DashboardHeader
          title="Students"
          description="Manage and view all registered students"
          showGreeting={true}
          teacherName={teacherName}
          collegeName={collegeName}
        />
        <Button asChild>
          <Link href="/dashboard/students/register">
            <PlusCircle className="mr-2 h-4 w-4" />
            Register Student
          </Link>
        </Button>
      </div>

      <Suspense fallback={<Skeleton className="h-[500px]" />}>
        <StudentList />
      </Suspense>
    </div>
  )
}
