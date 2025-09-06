"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/services';
import { Course } from '@/services/types';
import { Edit, Eye, Upload, Settings, Plus } from 'lucide-react';

interface ManageCoursesProps {
  onCreateCourse?: (courseId: string) => void;
  onEditCourse?: (courseId: string) => void;
}

export const ManageCourses: React.FC<ManageCoursesProps> = ({ onCreateCourse, onEditCourse }) => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: 0,
    type: 'paid' as 'free' | 'paid',
    categories: [] as string[],
    tags: [] as string[]
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // For instructors, we might need to fetch courses by instructor
      const response = await courseService.getCourses({
        page: 1,
        limit: 20
      });
      
      console.log('Courses API response:', response);
      
      // Handle nested response structure - API returns { courses: [...], pagination: {...} }
      const coursesData = (response.data as any)?.courses || (response as any).courses || response.data || [];
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]); // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a course title.",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreating(true);
      const response = await courseService.createCourse(newCourse);
      
      console.log('Course creation response:', response);
      
      // Add the new course to the list - ensure we have the correct data structure
      const newCourseData = response.data || response;
      setCourses([newCourseData, ...courses]);
      
      // Refresh the courses list to get the latest data
      await fetchCourses();
      
      // Reset form
      setNewCourse({
        title: '',
        description: '',
        level: 'beginner',
        price: 0,
        type: 'paid',
        categories: [],
        tags: []
      });
      
      setShowCreateDialog(false);
      
      toast({
        title: "Success!",
        description: "Course created successfully."
      });
      
      // Call the callback with the new course ID
      if (onCreateCourse) {
        const courseId = newCourseData.id || (newCourseData as any)._id;
        if (courseId) {
          onCreateCourse(courseId);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number, type: string) => {
    return type === 'free' ? 'Free' : `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Manage Courses</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Courses</h2>
          <p className="text-gray-600">Create and manage your course content</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Fill in the details to create your course.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Course Title</label>
                  <Input
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    placeholder="Enter course title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Level</label>
                  <Select 
                    value={newCourse.level} 
                    onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                      setNewCourse({ ...newCourse, level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Enter course description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select 
                    value={newCourse.type} 
                    onValueChange={(value: 'free' | 'paid') => 
                      setNewCourse({ ...newCourse, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price ($)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    disabled={newCourse.type === 'free'}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateCourse} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Course'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {(courses || []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Get started by creating your first course. Share your knowledge with the world!
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(courses || []).filter(course => course && (course.id || (course as any)._id)).map((course) => (
            <Card key={course.id || (course as any)._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{course.title || 'Untitled Course'}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {course.description || 'No description available'}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(course.status || 'draft')}>
                    {course.status || 'draft'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">{formatPrice(course.price || 0, course.type || 'free')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{course.enrollmentCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium capitalize">{course.level || 'beginner'}</span>
                  </div>
                  
                  {(course.categories && course.categories.length > 0) && (
                    <div className="flex flex-wrap gap-1">
                      {course.categories.slice(0, 2).map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                      {course.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{course.categories.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 flex items-center gap-1"
                      onClick={() => window.open(`/courses/${course.id || (course as any)._id}`, '_blank')}
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 flex items-center gap-1"
                      onClick={() => onEditCourse?.(course.id || (course as any)._id)}
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full flex items-center gap-1"
                    onClick={() => onEditCourse?.(course.id || (course as any)._id)}
                  >
                    <Settings className="h-3 w-3" />
                    Manage Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
