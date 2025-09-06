import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Clock, 
  Play,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import simplifiedCourseService, { SimplifiedCourse } from '@/services/simplifiedCourseService';
import StudentCourseViewer from './StudentCourseViewer';

interface CourseBrowserProps {
  userRole?: 'admin' | 'student';
}

const CourseBrowser: React.FC<CourseBrowserProps> = ({ userRole = 'student' }) => {
  const [courses, setCourses] = useState<SimplifiedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadCourses();
  }, [currentPage, searchTerm]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await simplifiedCourseService.getPublishedCourses(
        currentPage, 
        12, 
        searchTerm.trim() || undefined
      );
      setCourses(response.courses);
      setTotalPages(Math.ceil(response.total / 12));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCourses();
  };

  const filteredCourses = courses.filter(course => {
    if (selectedCategory === 'all') return true;
    return course.category === selectedCategory;
  });

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))];

  if (selectedCourse) {
    return (
      <StudentCourseViewer 
        courseId={selectedCourse} 
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Browse Courses</h1>
          <p className="text-gray-600">Discover and enroll in courses</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category || 'all'}>
                    {category === 'all' ? 'All Categories' : (category || 'Uncategorized')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No courses available at the moment'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Card 
              key={course._id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCourse(course._id)}
            >
              {/* Course Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500 rounded-t-lg overflow-hidden">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="h-12 w-12 text-white/80" />
                  </div>
                )}
                
                {/* Price Badge */}
                <div className="absolute top-3 right-3">
                  <Badge variant={course.type === 'free' ? 'secondary' : 'default'}>
                    {course.type === 'free' ? 'Free' : `$${course.price}`}
                  </Badge>
                </div>
                
                {/* Video Count */}
                {course.videos && course.videos.length > 0 && (
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                      <Play className="h-3 w-3 mr-1" />
                      {course.videos.length} videos
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Title and Category */}
                  <div>
                    <h3 className="font-semibold line-clamp-2 mb-1">{course.title}</h3>
                    {course.category && (
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                    )}
                  </div>

                  {/* Instructor */}
                  <p className="text-sm text-gray-600">
                    by {course.instructor.firstName} {course.instructor.lastName}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {course.shortDescription || course.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {course.enrollmentCount}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {course.estimatedDuration || 0}h
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {course.averageRating.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {course.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {course.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{course.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseBrowser;
