"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Save, FileDown, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

// Grade system as per Anna University 2021
const gradeSystem = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  RA: 0,
  SA: 0,
  W: 0,
}

type Course = {
  id: string
  name: string
  grade: string
  creditHours: number
}

export function CgpaCalculator() {
  const [courses, setCourses] = useState<Course[]>(() => {
    // Try to load from localStorage on initial render (client-side only)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cgpaCourses")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("Failed to parse saved courses", e)
        }
      }
    }

    // Default initial state with two empty courses
    return [
      { id: "1", name: "Course 1", grade: "", creditHours: 3 },
      { id: "2", name: "Course 2", grade: "", creditHours: 3 },
    ]
  })

  const [cgpa, setCgpa] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [autoCalculate, setAutoCalculate] = useState(true)
  const { theme, setTheme } = useTheme()

  // Memoize the calculateCgpa function with useCallback
  const calculateCgpa = useCallback(() => {
    let totalCreditHours = 0
    let totalGradePoints = 0

    courses.forEach((course) => {
      if (course.grade && course.creditHours) {
        const gradePoint = gradeSystem[course.grade as keyof typeof gradeSystem] || 0
        totalGradePoints += gradePoint * course.creditHours
        totalCreditHours += course.creditHours
      }
    })

    if (totalCreditHours > 0) {
      const calculatedCgpa = totalGradePoints / totalCreditHours
      setCgpa(calculatedCgpa)
      setShowResult(true)
    } else {
      setCgpa(null)
      setShowResult(false)
    }
  }, [courses]) // Add courses as a dependency

  // Save to localStorage whenever courses change
  useEffect(() => {
    localStorage.setItem("cgpaCourses", JSON.stringify(courses))

    // If autoCalculate is enabled, calculate the CGPA when courses change
    if (autoCalculate) {
      calculateCgpa()
    }
  }, [courses, autoCalculate, calculateCgpa])

  // This effect is no longer needed as we've combined it with the above effect
  // to avoid having two effects that depend on similar dependencies
  /*
  useEffect(() => {
    if (autoCalculate) {
      calculateCgpa()
    }
  }, [autoCalculate, calculateCgpa])
  */

  const addCourse = () => {
    const newId = (courses.length + 1).toString()
    setCourses([...courses, { id: newId, name: `Course ${newId}`, grade: "", creditHours: 3 }])
  }

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter((course) => course.id !== id))
    }
  }

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(courses.map((course) => (course.id === id ? { ...course, [field]: value } : course)))
  }

  const exportAsPdf = () => {
    // In a real implementation, you would use a library like jsPDF
    // For this example, we'll just show an alert
    alert("PDF export functionality would be implemented here")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Switch id="auto-calculate" checked={autoCalculate} onCheckedChange={setAutoCalculate} />
            <Label htmlFor="auto-calculate">Auto-calculate</Label>
          </div>
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                  <div key={course.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 sm:col-span-4">
                      <Label htmlFor={`course-name-${course.id}`}>Course Name</Label>
                      <Input
                          id={`course-name-${course.id}`}
                          value={course.name}
                          onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                          placeholder="Enter course name"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Label htmlFor={`grade-${course.id}`}>Grade</Label>
                      <Select value={course.grade} onValueChange={(value) => updateCourse(course.id, "grade", value)}>
                        <SelectTrigger id={`grade-${course.id}`}>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(gradeSystem).map((grade) => (
                              <SelectItem key={grade} value={grade}>
                                {grade} ({gradeSystem[grade as keyof typeof gradeSystem]})
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Label htmlFor={`credit-${course.id}`}>Credit Hours</Label>
                      <Input
                          id={`credit-${course.id}`}
                          type="number"
                          min="1"
                          max="6"
                          value={course.creditHours}
                          onChange={(e) => updateCourse(course.id, "creditHours", Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-2 flex justify-end items-end">
                      <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeCourse(course.id)}
                          disabled={courses.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4">
            <Button onClick={addCourse} variant="outline" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Course
            </Button>
            <Button onClick={calculateCgpa} className="w-full sm:w-auto" disabled={autoCalculate}>
              Calculate CGPA
            </Button>
            <Button
                onClick={() => localStorage.setItem("cgpaCourses", JSON.stringify(courses))}
                variant="outline"
                className="w-full sm:w-auto"
            >
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button onClick={exportAsPdf} variant="outline" className="w-full sm:w-auto">
              <FileDown className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </CardFooter>
        </Card>

        {showResult && cgpa !== null && (
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Your CGPA</h3>
                  <div className="text-4xl font-bold text-primary">{cgpa.toFixed(2)}</div>
                  <p className="mt-2 text-muted-foreground">
                    Based on {courses.filter((c) => c.grade).length} courses with a total of{" "}
                    {courses.reduce((sum, course) => sum + (course.grade ? course.creditHours : 0), 0)} credit hours
                  </p>
                </div>
              </CardContent>
            </Card>
        )}

        <Alert>
          <AlertDescription>
            <strong>Grade System:</strong> O (10), A+ (9), A (8), B+ (7), B (6), C (5), RA/SA/W (0)
          </AlertDescription>
        </Alert>
      </div>
  )
}