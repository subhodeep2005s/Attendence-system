"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { markAttendance } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertCircle, Check, Search, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Student } from "@/lib/types"

interface StudentWithAttendance extends Student {
  isPresent: boolean
  attendanceMarkedToday: boolean
}

export function AttendanceForm() {
  const router = useRouter()
  const [students, setStudents] = useState<StudentWithAttendance[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentWithAttendance[]>([])
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [department, setDepartment] = useState("all")
  const [semester, setSemester] = useState("all")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isPending, startTransition] = useTransition()
  const [markedStudents, setMarkedStudents] = useState<Set<string>>(new Set())

  useEffect(() => {
    let isMounted = true

    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/attendance/students')
        const data = await res.json()
        if (!isMounted) return
        // Filter out students who already have attendance marked for today
        const unmarkedStudents = data.filter((student: StudentWithAttendance) => !student.attendanceMarkedToday)
        setStudents(unmarkedStudents)
        setFilteredStudents(unmarkedStudents)
        // Initialize attendance data
        const initialAttendance: Record<string, boolean> = {}
        unmarkedStudents.forEach((student: StudentWithAttendance) => {
          if (student._id) {
            initialAttendance[student._id.toString()] = false
          }
        })
        setAttendanceData(initialAttendance)
        setIsLoading(false)
      } catch (err) {
        if (!isMounted) return
        console.error("Error fetching students:", err)
        setError("Failed to load students. Please try again.")
        setIsLoading(false)
      }
    }

    fetchStudents()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    try {
      let result = [...students]

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim()
        result = result.filter(
          (student) => 
            (student.name?.toLowerCase().includes(query) || 
            student.rollNumber?.toLowerCase().includes(query)) &&
            !markedStudents.has(student._id.toString())
        )
      }

      // Filter by department
      if (department !== "all") {
        result = result.filter(
          (student) => 
            student.department === department &&
            !markedStudents.has(student._id.toString())
        )
      }

      // Filter by semester
      if (semester !== "all") {
        result = result.filter(
          (student) => 
            student.semester === semester &&
            !markedStudents.has(student._id.toString())
        )
      }

      // If no filters are active, show all unmarked students
      if (!searchQuery && department === "all" && semester === "all") {
        result = students.filter(student => !markedStudents.has(student._id.toString()))
      }

      setFilteredStudents(result)
    } catch (err) {
      console.error("Error filtering students:", err)
      setError("Error filtering students. Please try again.")
    }
  }, [searchQuery, department, semester, students, markedStudents])

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    try {
      setAttendanceData((prev) => ({
        ...prev,
        [studentId]: isPresent,
      }))
    } catch (err) {
      console.error("Error updating attendance:", err)
      setError("Error updating attendance. Please try again.")
    }
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const result = await markAttendance(attendanceData, date)
      if (result.success) {
        setSuccess("Attendance marked successfully!")

        // Add marked students to the set
        const newMarkedStudents = new Set(markedStudents)
        Object.keys(attendanceData).forEach((id) => {
          newMarkedStudents.add(id)
        })
        setMarkedStudents(newMarkedStudents)

        // Clear attendance data for remaining students
        const remainingStudents = students.filter((student) => student._id && !newMarkedStudents.has(student._id.toString()))
        const newAttendanceData: Record<string, boolean> = {}
        remainingStudents.forEach((student) => {
          if (student._id) {
            newAttendanceData[student._id.toString()] = false
          }
        })
        setAttendanceData(newAttendanceData)

        startTransition(() => {
          router.refresh()
        })
      } else {
        setError(result.error || "Failed to mark attendance")
      }
    } catch (err) {
      console.error("Error marking attendance:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleMarkIndividual = async (studentId: string) => {
    setIsSaving(true)
    setError("")

    try {
      const isPresent = attendanceData[studentId]
      const individualData = { [studentId]: isPresent }
      const result = await markAttendance(individualData, date)

      if (result.success) {
        // Add to marked students
        setMarkedStudents((prev) => new Set(prev).add(studentId))

        // Remove from attendance data
        const newAttendanceData = { ...attendanceData }
        delete newAttendanceData[studentId]
        setAttendanceData(newAttendanceData)

        startTransition(() => {
          router.refresh()
        })
      } else {
        setError(result.error || "Failed to mark attendance")
      }
    } catch (err) {
      console.error("Error marking individual attendance:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const refreshStudentList = async () => {
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch('/api/attendance/students')
      const data = await res.json()

      // Filter out students who already have attendance marked for today
      const unmarkedStudents = data.filter((student: StudentWithAttendance) => !student.attendanceMarkedToday)

      setStudents(unmarkedStudents)

      // Reset marked students
      setMarkedStudents(new Set())

      // Initialize attendance data
      const initialAttendance: Record<string, boolean> = {}
      unmarkedStudents.forEach((student: StudentWithAttendance) => {
        if (student._id) {
          initialAttendance[student._id.toString()] = false
        }
      })
      setAttendanceData(initialAttendance)
    } catch (err) {
      console.error("Error refreshing student list:", err)
      setError("Failed to refresh student list. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const markAllPresent = () => {
    try {
      const newAttendanceData = { ...attendanceData }
      filteredStudents.forEach((student) => {
        if (student._id) {
          newAttendanceData[student._id.toString()] = true
        }
      })
      setAttendanceData(newAttendanceData)
    } catch (err) {
      console.error("Error marking all present:", err)
      setError("Error marking all present. Please try again.")
    }
  }

  const markAllAbsent = () => {
    try {
      const newAttendanceData = { ...attendanceData }
      filteredStudents.forEach((student) => {
        if (student._id) {
          newAttendanceData[student._id.toString()] = false
        }
      })
      setAttendanceData(newAttendanceData)
    } catch (err) {
      console.error("Error marking all absent:", err)
      setError("Error marking all absent. Please try again.")
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleDepartmentChange = (value: string) => {
    setDepartment(value)
  }

  const handleSemesterChange = (value: string) => {
    setSemester(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mark Attendance</CardTitle>
        <Button variant="outline" size="sm" onClick={refreshStudentList} disabled={isLoading} className="bg-white text-black border-neutral-200 hover:bg-neutral-50">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh List
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50 text-green-700">
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 bg-white text-black border-neutral-200" />
            </div>
            <div className="flex-1">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={handleDepartmentChange}>
                <SelectTrigger id="department" className="mt-1 bg-white text-black border-neutral-200">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="Civil">Civil</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="semester">Semester</Label>
              <Select value={semester} onValueChange={handleSemesterChange}>
                <SelectTrigger id="semester" className="mt-1 bg-white text-black border-neutral-200">
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  <SelectItem value="all">All Semesters</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-black/50" />
            <Input
              placeholder="Search by name or roll number..."
              className="pl-8 bg-white text-black border-neutral-200"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-black/70">
              Showing {filteredStudents.length} of {students.length} students pending attendance
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={markAllPresent} className="bg-white text-black border-neutral-200 hover:bg-neutral-50">
                Mark All Present
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={markAllAbsent} className="bg-white text-black border-neutral-200 hover:bg-neutral-50">
                Mark All Absent
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 rounded-lg border border-neutral-200 p-4">
                <div className="h-10 w-10 rounded-full bg-neutral-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-neutral-100" />
                  <div className="h-3 w-1/4 rounded bg-neutral-100" />
                </div>
                <div className="h-6 w-12 rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-200 p-8 text-center">
            <h3 className="text-lg font-medium">No students pending attendance</h3>
            <p className="mt-1 text-sm text-black/70">
              {students.length > 0
                ? "All visible students have been marked for today."
                : "Try adjusting your filters or search query."}
            </p>
            {students.length === 0 && (
              <Button onClick={refreshStudentList} className="mt-4 bg-white text-black border-neutral-200 hover:bg-neutral-50">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh List
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div
                key={student._id.toString()}
                className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4"
              >
                <Avatar>
                  <AvatarImage src={student.profileImage || ""} alt={student.name} />
                  <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-black/70">
                    {student.rollNumber} | {student.department}, Semester {student.semester}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`attendance-${student._id}`} className="sr-only">
                    Mark Attendance
                  </Label>
                  <span
                    className={`text-sm ${attendanceData[student._id.toString()] ? "text-green-600" : "text-red-600"}`}
                  >
                    {attendanceData[student._id.toString()] ? "Present" : "Absent"}
                  </span>
                  <Switch
                    id={`attendance-${student._id}`}
                    checked={attendanceData[student._id.toString()] || false}
                    onCheckedChange={(checked) => handleAttendanceChange(student._id.toString(), checked)}
                    className="data-[state=checked]:bg-neutral-900"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkIndividual(student._id.toString())}
                    disabled={isSaving}
                    className="bg-white text-black border-neutral-200 hover:bg-neutral-50"
                  >
                    Mark
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit} disabled={isLoading || isSaving || filteredStudents.length === 0} className="bg-white text-black border-neutral-200 hover:bg-neutral-50">
            {isSaving ? "Saving..." : "Save All Attendance"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
