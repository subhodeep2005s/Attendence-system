"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { useEffect, useState } from "react"
import type { AttendanceRecord } from "@/lib/types"
import type { DayProps } from "react-day-picker"

interface AttendanceCalendarProps {
  studentId: string
}

export function AttendanceCalendar({ studentId }: AttendanceCalendarProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const response = await fetch(`/api/attendance/${studentId}`)
        const data = await response.json()
        setAttendance(data)
      } catch (error) {
        console.error("Error fetching attendance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [studentId])

  // Create a map of dates to attendance status
  const attendanceMap = new Map()
  attendance.forEach((record) => {
    const date = new Date(record.date).toISOString().split("T")[0]
    attendanceMap.set(date, record.status)
  })

  // Custom day renderer for the calendar
  const renderDay = (day: Date) => {
    const dateString = day.toISOString().split("T")[0]
    const status = attendanceMap.get(dateString)

    if (!status) return null

    return (
      <div className="relative h-full w-full p-2">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`h-8 w-8 rounded-full ${
              status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            } flex items-center justify-center text-sm font-medium`}
          >
            {day.getDate()}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            Loading...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-1">
          <Calendar
            mode="multiple"
            selected={attendance.map((a) => new Date(a.date))}
            className="rounded-md border"
            components={{
              Day: (props: DayProps) => renderDay(props.date),
            }}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-sm">Absent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
