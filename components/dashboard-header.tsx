import { Greeting } from "@/components/greeting"

interface DashboardHeaderProps {
  title: string
  description?: string
  showGreeting?: boolean
  teacherName?: string
  collegeName?: string
}

export function DashboardHeader({
  title,
  description,
  showGreeting = false,
  teacherName = "HoD",
  collegeName = "College of Engineering",
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      {showGreeting && (
        <div className="mb-4 md:mb-0">
          <Greeting teacherName={teacherName} collegeName={collegeName} />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">{title}</h1>
        {description && <p className="mt-1 text-sm text-black/70">{description}</p>}
      </div>
    </div>
  )
}
