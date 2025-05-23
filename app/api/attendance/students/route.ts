import { NextResponse } from "next/server";
import { getStudentsForAttendance } from "@/lib/actions";

export async function GET() {
  const students = await getStudentsForAttendance();
  return NextResponse.json(students);
} 