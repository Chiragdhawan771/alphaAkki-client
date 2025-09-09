"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { enrollmentService, courseService } from "@/services";
import SimplifiedCourseManager from "@/components/courses/SimplifiedCourseManager";
import UserCourseViewer from "@/components/courses/UserCourseViewer";
import EnrollmentStats from "@/components/dashboard/EnrollmentStats";
import {
  BookOpen,
  Plus,
  Settings,
  BarChart3,
  Users,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { useSearchParams } from "next/navigation";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // read `tab` from URL, fallback = "dashboard"
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeSection, setActiveSection] = useState(initialTab);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const isInstructor = user?.role === "instructor" || user?.role === "admin";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BookOpen },
    { id: "courses", label: "My Courses", icon: BookOpen },
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        if (isInstructor) {
          // Fetch instructor/admin dashboard data
          const coursesResponse = await courseService.getCourses({
            limit: 100,
          });
          console.log(coursesResponse,"coursesResponsecoursesResponse")
          const courses = coursesResponse.data || [];
          setStats({
            totalCourses: courses.length,
            totalStudents: courses.reduce(
              (sum, course) => sum + (course.enrollmentCount || 0),
              0
            ),
            totalRevenue: courses.reduce(
              (sum, course) =>
                sum + (course.price || 0) * (course.enrollmentCount || 0),
              0
            ),
          });
        } else {
          // Fetch student dashboard data with comprehensive stats
          try {
// <<<<<<< client-dashboard-changes
//             const dashboardResponse =
//               await enrollmentService.getUserDashboard();
//             const enrollments = dashboardResponse ;
//             setStats({
//               totalCourses: enrollments.totalCourses,
//               totalStudents: 0,
//               totalRevenue: 0,
//             });
// =======
            const dashboardResponse = await enrollmentService.getUserDashboard();
            const dashboardData = dashboardResponse.data;
            
            // Check if we have the new comprehensive data structure
            if (dashboardData && typeof dashboardData.totalCourses !== 'undefined') {
              setStats({
                totalCourses: dashboardData.totalCourses || 0,
                totalStudents: dashboardData.completed || 0, // Using completed courses for students
                totalRevenue: Math.round((dashboardData.totalTimeSpent || 0) / 60) || 0, // Using total hours for students
              });
            } else {
              // Fallback to old data structure
              const enrollments = dashboardData.enrollments || [];
              setStats({
                totalCourses: enrollments.length,
                totalStudents: 0,
                totalRevenue: 0,
              });
            }
// >>>>>>> main
          } catch (error) {
            // User might not have any enrollments yet
            console.warn("No enrollment data found:", error);
            setStats({
              totalCourses: 0,
              totalStudents: 0,
              totalRevenue: 0,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast, isInstructor]);
  useEffect(() => {
    setActiveSection(initialTab);
  }, [initialTab]);

  const handleCourseCreated = (courseId: string) => {
    setActiveSection("courses");
    setSelectedCourseId(courseId);
    toast({
      title: "Success!",
      description: "Course created successfully. Now add your content!",
    });
  };

  const handleEditCourse = (courseId: string) => {
    setActiveSection("courses");
    setSelectedCourseId(courseId);
  };

  const handleBackToCourses = () => {
    setActiveSection("courses");
    setSelectedCourseId(null);
  };

  const renderContent = () => {
    // Handle course management
    if (activeSection === "courses") {
      if (isInstructor) {
        return <SimplifiedCourseManager />;
      } else {
        return <UserCourseViewer />;
      }
    }

    switch (activeSection) {
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="text-gray-600">
                {isInstructor
                  ? "Manage your courses and create engaging content for your students."
                  : "Continue your learning journey and explore new courses."}
              </p>
            </div>

            {/* Stats Cards - Show instructor stats for instructors, enrollment stats for students */}
            {isInstructor ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            My Courses
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {loading ? "--" : stats.totalCourses}
                          </p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Students
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {loading ? "--" : stats.totalStudents}
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Revenue
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${loading ? "--" : stats.totalRevenue.toFixed(2)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <>
                {/* Student Enrollment Statistics */}
                <EnrollmentStats userId={user?.id} />
              </>
            )}

            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  {isInstructor
                    ? "Ready to create your first course? Follow these steps to get started."
                    : "Start your learning journey with these quick actions."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isInstructor ? (
                    <>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Plus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            Create Your First Course
                          </h4>
                          <p className="text-sm text-gray-600">
                            Set up course details and structure
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Add Content</h4>
                          <p className="text-sm text-gray-600">
                            Upload videos and create lectures
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
<!-- <<<<<<< client-dashboard-changes
                      <div className="flex items-center gap-3 p-4 border rounded-lg" onClick={()=>setActiveSection("courses")}>
======= -->
                      <Link href="/courses" className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
<!-- >>>>>>> main -->
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Browse Courses</h4>
                          <p className="text-sm text-gray-600">
                            Find courses that interest you
                          </p>
                        </div>
                      </Link>
                      <button 
                        onClick={() => setActiveSection('courses')}
                        className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="bg-green-100 p-2 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Track Progress</h4>
                          <p className="text-sm text-gray-600">
                            Monitor your learning journey
                          </p>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Navigation */}
        {/* <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav> */}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </div>
    </ProtectedRoute>
  );
}
