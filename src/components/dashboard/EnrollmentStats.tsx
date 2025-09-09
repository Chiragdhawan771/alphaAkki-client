import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { enrollmentService } from '@/services';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Play,
  CheckCircle,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';
import Link from 'next/link';

interface EnrollmentStatsProps {
  userId?: string;
}

interface DashboardData {
  totalCourses: number;
  inProgress: number;
  completed: number;
  certificates: number;
  totalTimeSpent: number;
  avgProgress: number;
  enrollments: any[];
  recentCourses: any[];
}

const EnrollmentStats: React.FC<EnrollmentStatsProps> = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getUserDashboard();
      const data = response.data;
      
      // Ensure we have the right data structure
      if (data && typeof data.totalCourses !== 'undefined') {
        setDashboardData(data);
      } else {
        // Handle old format with just enrollments
        const enrollments = (data as any)?.enrollments || [];
        setDashboardData({
          totalCourses: enrollments.length,
          inProgress: enrollments.filter((e: any) => e.status === 'active').length,
          completed: enrollments.filter((e: any) => e.status === 'completed').length,
          certificates: enrollments.filter((e: any) => e.status === 'completed').length,
          totalTimeSpent: 0,
          avgProgress: 0,
          enrollments: enrollments,
          recentCourses: enrollments.slice(0, 5)
        });
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Enrollment Data</h3>
          <p className="text-gray-600 mb-4">
            You haven't enrolled in any courses yet.
          </p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.totalCourses}
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
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.inProgress}
                </p>
              </div>
              <Play className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.completed}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(dashboardData.totalTimeSpent)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Progress Overview */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Learning Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Progress</span>
                <span className={`text-sm font-bold ${getProgressColor(dashboardData.avgProgress)}`}>
                  {dashboardData.avgProgress}%
                </span>
              </div>
              <Progress value={dashboardData.avgProgress} className="h-3" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm font-bold text-blue-600">
                  {dashboardData.totalCourses > 0 
                    ? Math.round((dashboardData.completed / dashboardData.totalCourses) * 100)
                    : 0}%
                </span>
              </div>
              <Progress 
                value={dashboardData.totalCourses > 0 
                  ? (dashboardData.completed / dashboardData.totalCourses) * 100 
                  : 0} 
                className="h-3" 
              />
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.certificates}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Recent Courses */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentCourses.length > 0 ? (
                dashboardData.recentCourses.slice(0, 3).map((enrollment: any) => (
                  <div key={enrollment._id} className="flex items-center space-x-4 p-3 rounded-lg border">
                    <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {enrollment.course?.title || 'Course Title'}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={enrollment.status === 'completed' ? 'default' : 'secondary'}>
                          {enrollment.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {enrollment.progressPercentage || 0}% complete
                        </span>
                      </div>
                    </div>
                    <Link href={`/learn/${enrollment.course?._id || enrollment.course}`}>
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3 mr-1" />
                        Continue
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">Complete {dashboardData.inProgress} courses</span>
                  <span className="text-blue-600 text-sm">In Progress</span>
                </div>
                <p className="text-blue-700 text-sm">
                  You have {dashboardData.inProgress} course{dashboardData.inProgress !== 1 ? 's' : ''} in progress
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">Learning Streak</span>
                  <span className="text-green-600 text-sm">Active</span>
                </div>
                <p className="text-green-700 text-sm">
                  Keep learning daily to maintain your streak!
                </p>
              </div>
              
              {dashboardData.avgProgress < 100 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-yellow-900">Improve Average Progress</span>
                    <span className="text-yellow-600 text-sm">{dashboardData.avgProgress}%</span>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    Aim to increase your average course completion rate
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};

export default EnrollmentStats;