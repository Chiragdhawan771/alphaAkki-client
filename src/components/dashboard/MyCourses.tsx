import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';
import { Enrollment } from '@/services/types';

interface MyCoursesProps {
  enrollments: Enrollment[];
  loading: boolean;
  getCourseProgress: (courseId: string) => number;
  onBrowseCourses: () => void;
}

export const MyCourses: React.FC<MyCoursesProps> = ({
  enrollments,
  loading,
  getCourseProgress,
  onBrowseCourses
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white shadow-sm border">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <Card className="bg-white shadow-sm border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Start your learning journey by exploring our course catalog.
            </p>
            <Button 
              onClick={onBrowseCourses}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => {
          const progress = getCourseProgress(enrollment.course);
          return (
            <Card key={enrollment.id} className="bg-white shadow-sm border hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{enrollment.course}</CardTitle>
                <CardDescription>Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between items-center pt-2">
                    <Badge variant={enrollment.status === 'completed' ? 'secondary' : 'default'}>
                      {enrollment.status}
                    </Badge>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      onClick={() => window.location.href = `/learn/${enrollment.course}`}
                    >
                      {enrollment.status === 'completed' ? 'Review' : 'Continue'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
