import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { enrollmentService, progressService } from '@/services';
import { Enrollment, Progress as ProgressType } from '@/services/types';

export interface CourseProgressSummary {
  courseId: string;
  progressPercentage: number;
  completedLectures: number;
  totalLectures: number;
  totalTimeSpent: number;
  lastAccessedLecture?: string;
  lectureProgress: ProgressType[];
}

export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  certificates: number;
  averageProgress: number;
}

export const useDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressData, setProgressData] = useState<CourseProgressSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    certificates: 0,
    averageProgress: 0
  });

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch enrollments
      const dashboardResponse = await enrollmentService.getUserDashboard();
      const enrollments = dashboardResponse.data.enrollments;
      setEnrollments(enrollments);
      
      // Fetch progress for each enrollment
      const progressPromises = enrollments.map((enrollment: Enrollment) => 
        progressService.getCourseProgress(enrollment.course)
      );
      const progressResults = await Promise.all(progressPromises);
      const progressDataArray = progressResults.map(result => result.data);
      setProgressData(progressDataArray);
      
      // Calculate stats
      const totalCourses = enrollments.length;
      const completedCourses = progressDataArray.filter(p => p.progressPercentage >= 100).length;
      const totalHours = progressDataArray.reduce((sum: number, p) => sum + (p.totalTimeSpent / 3600), 0);
      const averageProgress = totalCourses > 0 
        ? progressDataArray.reduce((sum: number, p) => sum + p.progressPercentage, 0) / totalCourses 
        : 0;
      
      setStats({
        totalCourses,
        completedCourses,
        totalHours: Math.round(totalHours),
        certificates: completedCourses,
        averageProgress: Math.round(averageProgress)
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = 'Failed to load dashboard data';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, toast]);

  const getCourseProgress = (courseId: string) => {
    const progress = progressData.find(p => p.courseId === courseId);
    return progress ? progress.progressPercentage : 0;
  };

  const getEnrollment = (courseId: string) => {
    return enrollments.find(e => e.course === courseId);
  };

  const refetch = () => {
    fetchDashboardData();
  };

  return {
    enrollments,
    progressData,
    loading,
    error,
    stats,
    getCourseProgress,
    getEnrollment,
    refetch
  };
};
