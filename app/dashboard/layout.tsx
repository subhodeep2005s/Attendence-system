import type React from "react"
import { getTeacherFromCookies } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const teacher = await getTeacherFromCookies()

  if (!teacher) {
    redirect("/login")
  }

  const teacherName = teacher.name || "HoD"
  const collegeName = "College of Engineering"

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <MobileHeader teacherName={teacherName} collegeName={collegeName} />
        <div className="flex flex-1">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
