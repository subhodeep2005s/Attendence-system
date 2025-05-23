import { NextResponse } from "next/server"
import { getAttendanceOverview } from "@/lib/data"

export async function GET() {
  try {
    const data = await getAttendanceOverview()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching attendance overview:", error)
    return NextResponse.json(
      { error: "Failed to fetch attendance overview" },
      { status: 500 }
    )
  }
} 