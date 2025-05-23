"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function AttendanceOverview() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [filteredAttendance, setFilteredAttendance] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("all")
  const [semester, setSemester] = useState("all")

  useEffect(() => {
    fetch('/api/attendance')
      .then(res => res.json())
      .then(data => {
        setAttendance(data)
        setFilteredAttendance(data)
      })
  }, [])

  useEffect(() => {
    let result = [...attendance]
    if (search) {
      const query = search.toLowerCase()
      result = result.filter(
        (record) =>
          record.studentName.toLowerCase().includes(query) ||
          record.rollNumber.toLowerCase().includes(query)
      )
    }
    if (department !== "all") {
      result = result.filter((record) => record.department === department)
    }
    if (semester !== "all") {
      result = result.filter((record) => record.semester === semester)
    }
    setFilteredAttendance(result)
  }, [search, department, semester, attendance])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-black/50" />
            <Input
              placeholder="Search by name or roll number..."
              className="pl-8 bg-white text-black placeholder:text-black/50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="bg-white text-black">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="CSE">CSE</SelectItem>
              <SelectItem value="Civil">Civil</SelectItem>
              <SelectItem value="Mechanical">Mechanical</SelectItem>
              <SelectItem value="Electrical">Electrical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="bg-white text-black">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="all">All Semesters</SelectItem>
              <SelectItem value="1">Semester 1</SelectItem>
              <SelectItem value="2">Semester 2</SelectItem>
              <SelectItem value="3">Semester 3</SelectItem>
              <SelectItem value="4">Semester 4</SelectItem>
              <SelectItem value="5">Semester 5</SelectItem>
              <SelectItem value="6">Semester 6</SelectItem>
              <SelectItem value="7">Semester 7</SelectItem>
              <SelectItem value="8">Semester 8</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          {filteredAttendance.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-200 p-8 text-center">
              <h3 className="text-lg font-medium">No attendance records found</h3>
              <p className="mt-1 text-sm text-black/70">Try adjusting your search or filters.</p>
            </div>
          ) : (
            filteredAttendance.map((record) => (
              <div
                key={record._id.toString()}
                className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col justify-between sm:flex-row">
                    <p className="font-medium">{record.studentName}</p>
                    <p className="text-sm text-black/70">ID: {record.rollNumber}</p>
                  </div>
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <p className="text-sm text-black/70">
                      {record.department}, Semester {record.semester}
                    </p>
                    <Badge variant={record.isPresent ? "success" : "destructive"}>
                      {record.isPresent ? "Present" : "Absent"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
