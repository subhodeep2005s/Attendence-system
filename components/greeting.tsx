"use client"

import { useEffect, useState } from "react"

interface GreetingProps {
  teacherName?: string
  collegeName: string
}

export function Greeting({ teacherName = "Teacher", collegeName }: GreetingProps) {
  const [greeting, setGreeting] = useState("Hello")

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) {
        setGreeting("Good Morning")
      } else if (hour < 17) {
        setGreeting("Good Afternoon")
      } else {
        setGreeting("Good Evening")
      }
    }

    updateGreeting()
    // Update greeting if user keeps the app open across time boundaries
    const interval = setInterval(updateGreeting, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-semibold text-slate-900">
        {greeting}, {teacherName}
      </h2>
      <p className="text-sm text-slate-500">{collegeName}</p>
    </div>
  )
}
