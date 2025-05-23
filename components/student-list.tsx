"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Search, Trash2 } from "lucide-react"

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white text-black rounded-lg shadow-lg p-6 min-w-[300px] relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  )
}

export function StudentList() {
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [deleteStudent, setDeleteStudent] = useState<any | null>(null)
  const [imageError, setImageError] = useState<{ [id: string]: boolean }>({})
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("all")
  const [semester, setSemester] = useState("all")

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        setStudents(data)
        setFilteredStudents(data)
      })
  }, [])

  useEffect(() => {
    let result = [...students]
    if (search) {
      const query = search.toLowerCase()
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.rollNumber.toLowerCase().includes(query)
      )
    }
    if (department !== "all") {
      result = result.filter((student) => student.department === department)
    }
    if (semester !== "all") {
      result = result.filter((student) => student.semester === semester)
    }
    setFilteredStudents(result)
  }, [search, department, semester, students])

  const handleDelete = () => {
    // TODO: Call your delete API here
    setStudents((prev) => prev.filter((s) => s._id !== deleteStudent._id))
    setDeleteStudent(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Students</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-black/50" />
            <Input
              placeholder="Search students..."
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
          {filteredStudents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-200 p-8 text-center">
              <h3 className="text-lg font-medium">No students found</h3>
              <p className="mt-1 text-sm text-black/70">Get started by registering a new student.</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/students/register">Register Student</Link>
              </Button>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student._id.toString()}
                className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={imageError[student._id] ? undefined : student.profileImage || undefined}
                    alt={student.name}
                    onError={() => setImageError((prev) => ({ ...prev, [student._id]: true }))}
                  />
                  <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col justify-between sm:flex-row">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-black/70">ID: {student.rollNumber}</p>
                  </div>
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <p className="text-sm text-black/70">
                      {student.department}, Semester {student.semester}
                    </p>
                    <Badge variant={student.isPresent ? "success" : "destructive"}>
                      {student.isPresent ? "Present" : "Absent"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="destructive" onClick={() => setDeleteStudent(student)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Modal */}
        <Modal open={!!deleteStudent} onClose={() => setDeleteStudent(null)}>
          <div>
            <p>Are you sure you want to delete this student?</p>
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              <Button variant="outline" onClick={() => setDeleteStudent(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      </CardContent>
    </Card>
  )
}
