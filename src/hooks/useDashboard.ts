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
  inProgress: number;
  totalHours: number;
  certificates: number;
  averageProgress: number;
}

export interface DashboardData {
  totalCourses: number;
  inProgress: number;
  completed: number;
  certificates: number;
  totalTimeSpent: number;
  avgProgress: number;
  enrollments: any[];
  recentCourses: any[];
}

export const useDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressData, setProgressData] = useState<CourseProgressSummary[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    inProgress: 0,
    totalHours: 0,
    certificates: 0,
    averageProgress: 0
  });

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch comprehensive dashboard data
      const dashboardResponse = await enrollmentService.getUserDashboard();
      const dashboardData = dashboardResponse.data;
      setDashboardData(dashboardData);
      
      // Set enrollments from dashboard data
      setEnrollments(dashboardData.enrollments || []);
      
      // Calculate stats from dashboard data
      const totalHours = Math.round((dashboardData.totalTimeSpent || 0) / 60); // Convert from seconds to hours
      
      setStats({
        totalCourses: dashboardData.totalCourses || 0,
        completedCourses: dashboardData.completed || 0,
        inProgress: dashboardData.inProgress || 0,
        totalHours,
        certificates: dashboardData.certificates || 0,
        averageProgress: dashboardData.avgProgress || 0
      });
      
      // If we have enrollments, fetch detailed progress for each
      if (dashboardData.enrollments && dashboardData.enrollments.length > 0) {
        try {
          const progressPromises = dashboardData.enrollments.map((enrollment: any) => 
            progressService.getCourseProgress(enrollment.course._id || enrollment.course)
          );
          const progressResults = await Promise.allSettled(progressPromises);
          const successfulResults = progressResults
            .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
            .map(result => result.value.data);
          setProgressData(successfulResults);
        } catch (progressError) {
          console.warn('Could not fetch detailed progress data:', progressError);
          // Continue without detailed progress data
        }
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = 'Failed to load dashboard data';
      setError(errorMessage);
      
      // Don't show error toast for missing enrollments
      if (!error?.toString().includes('404')) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

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
    dashboardData,
    loading,
    error,
    stats,
    getCourseProgress,
    getEnrollment,
    refetch
  };
};
