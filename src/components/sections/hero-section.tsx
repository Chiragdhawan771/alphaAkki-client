"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import CourseCard from "@/components/courses/CourseCard";
import CourseDetailModal from "@/components/courses/CourseDetailModal";
import simplifiedCourseService, {
  SimplifiedCourse,
} from "@/services/simplifiedCourseService";
import enrollmentService from "@/services/enrollmentService";
import { useToast } from "@/hooks/use-toast";
import { Dashboard } from "@/services";

export function HeroSection() {
  const [featuredCourses, setFeaturedCourses] = useState<SimplifiedCourse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [detailModalCourse, setDetailModalCourse] =
    useState<SimplifiedCourse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedCourses();
    loadEnrollmentStatus();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      setLoading(true);
      const response = await simplifiedCourseService.getPublishedCourses(1, 6);
      setFeaturedCourses(response.courses || []);
    } catch (error: any) {
      console.error("Failed to fetch featured courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollmentStatus = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await enrollmentService.getUserDashboard();
      setEnrolledCourses(response);
    } catch (error) {
      // Silently fail if user is not logged in or error occurs
      console.log("Could not load enrollment status:", error);
    }
  };

  const handleViewCourseDetails = (courseId: string) => {
    const course = featuredCourses.find((c) => c._id === courseId);
    if (course) {
      setDetailModalCourse(course);
      setIsDetailModalOpen(true);
    }
  };

  const handleEnrollInCourse = async (courseId: string) => {
    // This function is no longer used - CourseCard handles enrollment internally
    console.log("Enrollment handled by CourseCard for course:", courseId);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 right-1/4 w-32 h-32 bg-gradient-to-br from-orange-300/40 to-orange-400/40 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 left-10 w-24 h-24 bg-gradient-to-br from-blue-300/40 to-blue-400/40 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-32 right-1/3 w-20 h-20 bg-gradient-to-br from-teal-300/40 to-teal-400/40 rounded-full blur-lg"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      <div className="container relative mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20 max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Content */}
          <div className="flex flex-col space-y-6 sm:space-y-8 order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium w-fit">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              New: Advanced Learning Tracks Available
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight text-gray-900">
              Master Skills with{" "}
              <span className="inline-block bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                AlphaAkki
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed">
              Transform your career with cutting-edge courses in web
              development, e-commerce, UX/UI design, and digital marketing.
              Learn from industry experts and build real-world projects.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Button
                onClick={() => {
                  document.getElementById("featured-courses")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                size="lg"
                className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Learning Free
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Button>
              {/* <Button variant="outline" size="lg" className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full font-semibold group">
                <svg className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Demo
              </Button> */}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 sm:pt-8">
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Active Students
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  200+
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Expert Courses
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  4.9★
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Student Rating
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual - Hero Image */}
          <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl">
              {/* Main hero image */}
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-orange-100 to-blue-100">
                <Image
                  src="/assets/home-page-cover.png"
                  alt="AlphaAkki - Learn and grow with expert-led courses"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                />

                {/* Overlay gradient for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>

              {/* Floating achievement card */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-gray-900">
                      Course Completed!
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      +500 XP Earned
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating progress card */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base">
                      A
                    </span>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-gray-900">
                      Learning Streak
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      15 days strong! 🔥
                    </div>
                  </div>
                </div>
              </div>

              {/* Background decorative elements */}
              <div className="absolute -top-8 -left-8 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-300/30 to-blue-400/30 rounded-2xl transform rotate-12 blur-sm"></div>
              <div className="absolute -bottom-8 -right-8 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-300/30 to-orange-400/30 rounded-full blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Featured Courses Section */}
        <div className="mt-16 lg:mt-24" id="featured-courses">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Featured{" "}
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Courses
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start your learning journey with our most popular and highly-rated
              courses
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 animate-pulse"
                >
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => {
                const isEnroll=enrolledCourses?.data?.recentCourses?.some((c:any)=> c.course._id==course._id
              )
              console.log(enrolledCourses,"isEnroll",course)
                return (
                <CourseCard
                  key={course._id}
                  course={course}
                  onViewDetails={handleViewCourseDetails}
                  onEnroll={undefined}
                  compact={true}
                  isEnrolled={isEnroll}
                  onContinue={() => window.location.href = `/courses/${course._id}/learn`}
                />
              )})}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No courses available yet
              </h3>
              <p className="text-gray-600">
                Check back soon for exciting new courses!
              </p>
            </div>
          )}

          {/* View All Courses Button */}
          {featuredCourses.length > 0 && (
            <div className="text-center mt-12">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-full font-semibold"
              >
                View All Courses
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={detailModalCourse}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEnroll={undefined}
        isEnrolled={false}
      />
    </section>
  );
}
