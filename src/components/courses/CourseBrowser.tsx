"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, BookOpen, GraduationCap, Users, TrendingUp, Sparkles } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CourseCard from "./CourseCard"
import StudentCourseViewer from "./StudentCourseViewer"
import simplifiedCourseService, { type SimplifiedCourse } from "@/services/simplifiedCourseService"
import { enrollmentService } from "@/services/enrollmentService"
import { Header } from "../layout/header"
import { usePayment } from "@/hooks/usePayment"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import CourseDetailModal from "./CourseDetailModal"

interface CourseBrowserProps {
  userRole?: "admin" | "student"
}

const CourseBrowser: React.FC<CourseBrowserProps> = ({ userRole = "student" }) => {
  const [courses, setCourses] = useState<SimplifiedCourse[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedCourse, setSelectedCourse] = useState<SimplifiedCourse | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()
    const { paymentState, initiatePayment, enrollInFreeCourse } = usePayment();
    const {user}=useAuth()
    const router=useRouter()
  

  useEffect(() => {
    loadCourses()
    loadEnrollmentStatus()
  }, [currentPage, searchTerm])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const response = await simplifiedCourseService.getPublishedCourses(
        currentPage,
        12,
        searchTerm.trim() || undefined,
      )
      setCourses(response.courses)
      setTotalPages(Math.ceil(response.total / 12))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadEnrollmentStatus = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await enrollmentService.getUserDashboard()
      const enrolledCourseIds = new Set(
        response.data.enrollments.map((enrollment: any) =>
          typeof enrollment.course === "string" ? enrollment.course : enrollment.course._id,
        ),
      )
      setEnrolledCourses(enrolledCourseIds)
    } catch (error) {
      // Silently fail if user is not logged in or error occurs
      console.log("Could not load enrollment status:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadCourses()
  }

   const handleEnrollInCourse = async (course: SimplifiedCourse) => {

    if(!user){
      router.push("/login")
    }

    if (course.type === "free") {
      console.log("Enrolling in free course");
      await enrollInFreeCourse(course._id);
    } else {
      console.log("Initiating payment for paid course");
      await initiatePayment(course._id);
    }
  };
  const filteredCourses = courses.filter((course) => {
    if (selectedCategory === "all") return true
    return course.category === selectedCategory
  })

  const categories = ["all", ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean)))]

  // if (selectedCourse) {
  //   return <StudentCourseViewer courseId={selectedCourse} onBack={() => setSelectedCourse(null)} />
  // }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-background">
       

        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for courses, topics, or instructors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-base border-0 bg-muted/50 focus:bg-background transition-colors"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-48 border-0 bg-muted/50">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category || "all"}>
                            {category === "all" ? "All Categories" : category || "Uncategorized"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button type="submit" className="w-full sm:w-auto shadow-md">
                      <Search className="h-4 w-4 mr-2" />
                      Search Courses
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCourses.length} courses
                {searchTerm && ` for "${searchTerm}"`}
              </p>
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {selectedCategory}
                </Badge>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse border-0 shadow-md">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-6 space-y-3">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="relative inline-block mb-4">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <Search className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchTerm
                      ? "Try adjusting your search terms or filters to find what you're looking for"
                      : "No courses available at the moment"}
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setCurrentPage(1)
                      loadCourses()
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    onViewDetails={() => {setSelectedCourse(course)
                      setIsDetailModalOpen(true)
                    }}
                    onEnroll={handleEnrollInCourse}
                    onContinue={() => setSelectedCourse(course._id)}
                    isEnrolled={enrolledCourses.has(course._id)}
                    showActions={true}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 pt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}

       
          </div>
          <CourseDetailModal
        course={selectedCourse}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEnroll={handleEnrollInCourse}
        isEnrolled={
      enrolledCourses?.has(selectedCourse?._id) ||false
        }
      />
        </div>
      </div>
    </div>
  )
}

export default CourseBrowser
