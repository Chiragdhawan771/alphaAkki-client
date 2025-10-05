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
import AdminReviewManager from "@/components/reviews/AdminReviewManager";
import UserReviewSection from "@/components/reviews/UserReviewSection";
import {
  BookOpen,
  Plus,
  Settings,
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Award,
  Target,
  PlayCircle,
  Calendar,
  Star,
  ChevronRight,
  Activity,
  Zap,
  Globe,
  Search,
  MessageSquare
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
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const isInstructor = user?.role === "instructor" || user?.role === "admin";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BookOpen },
    { id: "courses", label: "My Courses", icon: BookOpen },
    ...(user?.role === "admin" ? [{ id: "reviews", label: "Review Management", icon: MessageSquare }] : []),
    ...(!isInstructor ? [{ id: "my-reviews", label: "My Reviews", icon: MessageSquare }] : []),
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
          // Fetch student dashboard data and enrolled courses
          try {
            setLoadingCourses(true);
            const dashboardResponse = await enrollmentService.getUserDashboard();
            const dashboardData = dashboardResponse.data;
            
            // Set enrolled courses
            if (dashboardData && dashboardData.recentCourses) {
              setEnrolledCourses(dashboardData.recentCourses);
            }
            
            // Check if we have the new comprehensive data structure
            if (dashboardData && typeof dashboardData.totalCourses !== 'undefined') {
              setStats({
                totalCourses: dashboardData.totalCourses || 0,
                totalStudents: dashboardData.completed || 0,
                totalRevenue: Math.round((dashboardData.totalTimeSpent || 0) / 60) || 0,
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
          } catch (error) {
            console.warn("No enrollment data found:", error);
            setStats({
              totalCourses: 0,
              totalStudents: 0,
              totalRevenue: 0,
            });
            setEnrolledCourses([]);
          } finally {
            setLoadingCourses(false);
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





  const renderContent = () => {
    // Handle course management
    if (activeSection === "courses") {
      if (isInstructor) {
        return <SimplifiedCourseManager />;
      } else {
        // return <UserCourseViewer />;
      }
    }

    // Handle review management (admin only)
    if (activeSection === "reviews" && user?.role === "admin") {
      return <AdminReviewManager />;
    }

    // Handle user reviews (students only)
    if (activeSection === "my-reviews" && !isInstructor) {
      return <UserReviewSection />;
    }

    switch (activeSection) {
      default:
        return (
          <div className="space-y-6">
            {/* Simplified Welcome Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-white/20 text-white border-white/30 text-xs">
                      {isInstructor ? "Instructor" : "Student"}
                    </Badge>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    Welcome back, {user?.firstName}!
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base">
                    {isInstructor
                      ? "Ready to create amazing courses?"
                      : "Ready to continue learning?"}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Simplified Stats Section */}
            {isInstructor && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? "--" : stats.totalCourses}
                      </p>
                      <p className="text-sm text-gray-600">My Courses</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? "--" : stats.totalStudents}
                      </p>
                      <p className="text-sm text-gray-600">Students</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${loading ? "--" : stats.totalRevenue.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {isInstructor ? (
                <>
                  <button 
                    onClick={() => setActiveSection('courses')}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-200 group text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Create Course</h3>
                    <p className="text-sm text-gray-600">Start building your next course</p>
                  </button>

                  <button 
                    onClick={() => setActiveSection('courses')}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-200 group text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">My Courses</h3>
                    <p className="text-sm text-gray-600">Manage your content</p>
                  </button>

                  <Link href="/courses" className="block">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-200 group text-left">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Browse All</h3>
                      <p className="text-sm text-gray-600">Explore the marketplace</p>
                    </div>
                  </Link>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Pro Tip</h3>
                    <p className="text-sm text-gray-600">Keep videos under 15 minutes for better engagement</p>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/courses" className="block">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-200 group text-left">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Explore Courses</h3>
                      <p className="text-sm text-gray-600">Find new learning paths</p>
                    </div>
                  </Link>

                  <button 
                    onClick={() => setActiveSection('courses')}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-200 group text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">My Learning</h3>
                    <p className="text-sm text-gray-600">Continue where you left off</p>
                  </button>

                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Daily Goal</h3>
                    <p className="text-sm text-gray-600">Learn for 30 minutes today</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Weekly Goal</h3>
                    <p className="text-sm text-gray-600">Complete 3 lessons this week</p>
                  </div>
                </>
              )}
            </div>

            {/* Enrolled Courses Section for Students */}
            {!isInstructor && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                  <Link href="/courses">
                    <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                      Browse More
                    </Button>
                  </Link>
                </div>
                
                {loadingCourses ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="animate-pulse">
                          <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : enrolledCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrolledCourses.map((enrollment: any) => {
                      const course = enrollment.course;
                      return (
                        <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 group">
                          <div className="relative">
                            {course.thumbnail ? (
                              <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-orange-500" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-green-500 text-white text-xs">
                                Enrolled
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {course.description}
                            </p>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{course.estimatedDuration + " Hours" || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600">{course.rating || '4.5'}</span>
                              </div>
                            </div>
                            
                            <Link href={`/courses/${course._id}/learn`}>
                              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Continue Learning
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Yet</h3>
                    <p className="text-gray-600 mb-4">Start your learning journey by exploring our courses</p>
                    <Link href="/courses">
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                        <Search className="h-4 w-4 mr-2" />
                        Explore Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Navigation */}
        <nav className="bg-white border-b">
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
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </div>
    </ProtectedRoute>
  );
}
