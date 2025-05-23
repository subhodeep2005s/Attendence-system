import { clearToken } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await clearToken()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    )
  }
} 