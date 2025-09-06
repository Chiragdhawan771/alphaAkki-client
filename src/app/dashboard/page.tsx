"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const isAdmin = user?.role === "admin"

  const menuItems = isAdmin
    ? [
        { id: "dashboard", label: "Dashboard", icon: "🏠" },
        { id: "courses", label: "Manage Courses", icon: "📚" },
        { id: "students", label: "Students", icon: "👥" },
        { id: "analytics", label: "Analytics", icon: "📊" },
        { id: "settings", label: "Settings", icon: "⚙️" },
      ]
    : [
        { id: "dashboard", label: "Dashboard", icon: "🏠" },
        { id: "courses", label: "My Courses", icon: "📚" },
        { id: "browse", label: "Browse Courses", icon: "🔍" },
        { id: "progress", label: "Progress", icon: "📈" },
        { id: "certificates", label: "Certificates", icon: "🏆" },
      ]

  const profileMenuItems = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "help", label: "Help & Support", icon: "❓" },
  ]

  const sampleCourses = [
    {
      id: 1,
      title: "React Fundamentals",
      instructor: "John Doe",
      students: 45,
      progress: 75,
      status: "active",
      duration: "8 weeks",
      level: "Beginner",
    },
    {
      id: 2,
      title: "Advanced JavaScript",
      instructor: "Jane Smith",
      students: 32,
      progress: 60,
      status: "active",
      duration: "10 weeks",
      level: "Advanced",
    },
    {
      id: 3,
      title: "Node.js Backend",
      instructor: "Mike Johnson",
      students: 28,
      progress: 90,
      status: "completed",
      duration: "12 weeks",
      level: "Intermediate",
    },
    {
      id: 4,
      title: "Python for Data Science",
      instructor: "Sarah Wilson",
      students: 67,
      progress: 0,
      status: "upcoming",
      duration: "14 weeks",
      level: "Beginner",
    },
  ]

  const renderAdminCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Courses</h2>
        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
          ➕ Create New Course
        </Button>
      </div>

      <div className="grid gap-6">
        {sampleCourses.map((course) => (
          <Card key={course.id} className="bg-white shadow-sm border">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">Instructor: {course.instructor}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>👥 {course.students} students</span>
                    <span>⏱️ {course.duration}</span>
                    <span>📊 {course.level}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      course.status === "active" ? "default" : course.status === "completed" ? "secondary" : "outline"
                    }
                  >
                    {course.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderMyCourses = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleCourses
          .filter((course) => course.status !== "upcoming")
          .map((course) => (
            <Card key={course.id} className="bg-white shadow-sm border hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>by {course.instructor}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Badge variant={course.status === "completed" ? "secondary" : "default"}>{course.status}</Badge>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      {course.status === "completed" ? "Review" : "Continue"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )

  const renderBrowseCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Browse Courses</h2>
        <div className="flex space-x-2">
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option>All Levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleCourses.map((course) => (
          <Card key={course.id} className="bg-white shadow-sm border hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription>by {course.instructor}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>⏱️ {course.duration}</span>
                  <span>📊 {course.level}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span>👥 {course.students} students enrolled</span>
                </div>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  Enroll Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderStudents = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Students Management</h2>

      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
          <CardDescription>Manage student enrollments and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Alice Johnson", email: "alice@example.com", courses: 3, progress: 85 },
              { name: "Bob Smith", email: "bob@example.com", courses: 2, progress: 72 },
              { name: "Carol Davis", email: "carol@example.com", courses: 4, progress: 91 },
            ].map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-orange-700">{student.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{student.courses} courses</p>
                    <p className="text-sm text-gray-500">{student.progress}% avg progress</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderProgress = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Learning Progress</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">78%</div>
                <p className="text-sm text-gray-600">Average completion rate</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Courses Completed</span>
                  <span>2/4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Study Hours</span>
                  <span>45h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Certificates Earned</span>
                  <span>2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { activity: 'Completed "React Hooks" lesson', time: "2 hours ago" },
                { activity: 'Started "Advanced JavaScript" course', time: "1 day ago" },
                { activity: 'Earned "React Fundamentals" certificate', time: "3 days ago" },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.activity}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCertificates = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { course: "React Fundamentals", date: "2024-01-15", instructor: "John Doe" },
          { course: "Node.js Backend", date: "2024-02-20", instructor: "Mike Johnson" },
        ].map((cert, index) => (
          <Card key={index} className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{cert.course}</h3>
              <p className="text-sm text-gray-600 mb-2">Instructor: {cert.instructor}</p>
              <p className="text-sm text-gray-500 mb-4">Completed: {cert.date}</p>
              <Button variant="outline" size="sm">
                Download PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{sampleCourses.length}</p>
              </div>
              <span className="text-2xl">📚</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">172</p>
              </div>
              <span className="text-2xl">👥</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">78%</p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
              <span className="text-2xl">🏆</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <div className="grid gap-6">
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle>Learning Preferences</CardTitle>
            <CardDescription>Customize your learning experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates about your courses</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Study Reminders</p>
                <p className="text-sm text-gray-500">Get reminded to continue learning</p>
              </div>
              <Button variant="outline" size="sm">
                Set Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "courses":
        return isAdmin ? renderAdminCourses() : renderMyCourses()
      case "browse":
        return renderBrowseCourses()
      case "students":
        return renderStudents()
      case "progress":
        return renderProgress()
      case "certificates":
        return renderCertificates()
      case "analytics":
        return renderAnalytics()
      case "settings":
        return renderSettings()
      case "profile":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={user?.firstName || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={user?.lastName || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    value={user?.role || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    readOnly
                  />
                </div>
              </div>
              <div className="mt-6">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName}!</h2>
              <p className="text-gray-600">
                {isAdmin
                  ? "Here's an overview of your learning management system today."
                  : "Continue your learning journey and explore new courses."}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              {isAdmin ? (
                <>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    ➕ Create Course
                  </Button>
                  <Button variant="outline">👥 Manage Students</Button>
                  <Button variant="outline">📊 View Analytics</Button>
                </>
              ) : (
                <>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    🔍 Browse Courses
                  </Button>
                  <Button variant="outline">📚 My Courses</Button>
                  <Button variant="outline">📈 View Progress</Button>
                </>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {isAdmin ? "Total Courses" : "Enrolled Courses"}
                  </CardTitle>
                  <span className="text-2xl">📚</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{isAdmin ? sampleCourses.length : 3}</div>
                  <p className="text-xs text-gray-600">{isAdmin ? "+1 this month" : "2 in progress"}</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {isAdmin ? "Total Students" : "Certificates"}
                  </CardTitle>
                  <span className="text-2xl">{isAdmin ? "👥" : "🏆"}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{isAdmin ? "172" : "2"}</div>
                  <p className="text-xs text-gray-600">{isAdmin ? "15 new this week" : "Well done!"}</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {isAdmin ? "Completion Rate" : "Study Hours"}
                  </CardTitle>
                  <span className="text-2xl">{isAdmin ? "📊" : "⏱️"}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{isAdmin ? "78%" : "45h"}</div>
                  <p className="text-xs text-gray-600">{isAdmin ? "+5% from last month" : "This month"}</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {isAdmin ? "Active Courses" : "Progress"}
                  </CardTitle>
                  <span className="text-2xl">{isAdmin ? "✅" : "📈"}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{isAdmin ? "3" : "78%"}</div>
                  <p className="text-xs text-gray-600">{isAdmin ? "Currently running" : "Average completion"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
                  <CardDescription>
                    {isAdmin ? "Latest system updates and student activities" : "Your recent learning activities"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isAdmin ? (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              New student enrolled in &quot;React Fundamentals&quot;
                            </p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Course &quot;Advanced JavaScript&quot; updated
                            </p>
                            <p className="text-xs text-gray-500">4 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Certificate issued to Alice Johnson</p>
                            <p className="text-xs text-gray-500">6 hours ago</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Completed &quot;React Hooks&quot; lesson
                            </p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Started &quot;Advanced JavaScript&quot; course
                            </p>
                            <p className="text-xs text-gray-500">1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Earned &quot;React Fundamentals&quot; certificate
                            </p>
                            <p className="text-xs text-gray-500">3 days ago</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {isAdmin ? "Course Management" : "Learning Path"}
                  </CardTitle>
                  <CardDescription>
                    {isAdmin ? "Manage your courses and content" : "Continue your learning journey"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isAdmin ? (
                      <>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">📚</span>
                            <div>
                              <p className="text-sm font-medium">Active Courses</p>
                              <p className="text-xs text-gray-500">3 courses running</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">👥</span>
                            <div>
                              <p className="text-sm font-medium">Students</p>
                              <p className="text-xs text-gray-500">172 total enrolled</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View All
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">📊</span>
                            <div>
                              <p className="text-sm font-medium">Analytics</p>
                              <p className="text-xs text-gray-500">Performance metrics</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">📚</span>
                            <div>
                              <p className="text-sm font-medium">Current Courses</p>
                              <p className="text-xs text-gray-500">3 in progress</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Continue
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">🔍</span>
                            <div>
                              <p className="text-sm font-medium">Browse Courses</p>
                              <p className="text-xs text-gray-500">Discover new topics</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Explore
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">🏆</span>
                            <div>
                              <p className="text-sm font-medium">Certificates</p>
                              <p className="text-xs text-gray-500">2 earned</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 border-b border-gray-200/50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex h-16 sm:h-18 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <Link className="flex items-center space-x-2 sm:space-x-3" href="/">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm sm:text-base">A</span>
                  </div>
                  <div>
                    <span className="font-bold text-lg sm:text-xl text-gray-900">AlphaAkki</span>
                    <p className="text-xs text-gray-500 hidden sm:block">Learning Management System</p>
                  </div>
                </Link>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Search */}
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <span className="text-lg">🔔</span>
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white">
                    3
                  </Badge>
                </Button>

                {/* User Menu with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
                  >
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-orange-700">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 rounded-lg shadow-lg border border-gray-200/50 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200/50">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {user?.role}
                        </Badge>
                      </div>

                      {profileMenuItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id)
                            setIsProfileDropdownOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}

                      <div className="border-t border-gray-200/50 mt-2 pt-2">
                        <button
                          onClick={() => {
                            logout()
                            setIsProfileDropdownOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <span>🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile menu button */}
                <button
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    activeSection === item.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-700 hover:text-orange-600 hover:border-gray-300"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderContent()}</main>
      </div>
    </ProtectedRoute>
  )
}
