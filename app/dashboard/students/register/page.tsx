import { DashboardHeader } from "@/components/dashboard-header"
import { StudentRegistrationForm } from "@/components/student-registration-form"

export default function RegisterStudentPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Register Student" description="Add a new student to the system" />

      <StudentRegistrationForm />
    </div>
  )
}
