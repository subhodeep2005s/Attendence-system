import { redirect } from "next/navigation"
import { getTeacherFromCookies } from "@/lib/auth"

export default async function Home() {
  const teacher = await getTeacherFromCookies()

  if (!teacher) {
    redirect("/login")
  } else {
    redirect("/dashboard")
  }
}
