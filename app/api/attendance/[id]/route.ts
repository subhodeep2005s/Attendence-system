import { NextResponse } from "next/server"
import { getStudentAttendance } from "@/lib/data"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attendance = await getStudentAttendance(params.id)
    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error fetching student attendance:", error)
    return NextResponse.json(
      { error: "Failed to fetch student attendance" },
      { status: 500 }
    )
  }
}
