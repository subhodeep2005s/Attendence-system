import { LoginForm } from "@/components/login-form"
import { getTeacherFromCookies } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const teacher = await getTeacherFromCookies()

  if (teacher) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Teacher Login</h1>
          <p className="mt-2 text-slate-600">Sign in to manage student attendance</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
