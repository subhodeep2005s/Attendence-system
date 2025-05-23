"use client"

import { useRouter } from "next/navigation"

export async function logoutTeacher() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to logout")
    }

    return true
  } catch (error) {
    console.error("Error logging out:", error)
    return false
  }
} 