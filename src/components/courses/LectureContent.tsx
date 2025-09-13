import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Volume2, Download, CheckCircle, ExternalLink } from 'lucide-react';

interface Lecture {
  id: string;
  title: string;
  type: 'video' | 'text' | 'pdf' | 'audio' | 'quiz';
  content?: string;
  pdfUrl?: string;
  audioUrl?: string;
  resources?: string[];
  isCompleted?: boolean;
}

interface LectureContentProps {
  lecture: Lecture;
  onComplete: () => void;
}

const LectureContent: React.FC<LectureContentProps> = ({ lecture, onComplete }) => {
  const renderContent = () => {
    switch (lecture.type) {
      case 'text':
        return (
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-orange">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: lecture.content || '<p class="text-gray-500 text-center py-8">No content available</p>' 
              }} 
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="space-y-4">
            {lecture.pdfUrl ? (
              <div className="w-full">
                <iframe
                  src={lecture.pdfUrl}
                  className="w-full h-64 sm:h-80 md:h-96 border rounded-lg"
                  title={lecture.title}
                />
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={lecture.pdfUrl} download>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={lecture.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">PDF not available</p>
              </div>
            )}
          </div>
        );
      
      case 'audio':
        return (
          <div className="space-y-4">
            {lecture.audioUrl ? (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 sm:p-6 rounded-xl border border-orange-200">
                <div className="flex items-center mb-4">
                  <Volume2 className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-800">Audio Lecture</span>
                </div>
                <audio 
                  controls 
                  className="w-full h-10 sm:h-12"
                  style={{
                    filter: 'sepia(20%) saturate(70%) hue-rotate(15deg)'
                  }}
                >
                  <source src={lecture.audioUrl} type="audio/mpeg" />
                  <source src={lecture.audioUrl} type="audio/wav" />
                  <source src={lecture.audioUrl} type="audio/ogg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : (
              <div className="text-center py-8">
                <Volume2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Audio not available</p>
              </div>
            )}
          </div>
        );
      
      case 'quiz':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Interactive Quiz</h3>
                <p className="text-blue-700 mb-4">Test your knowledge with this interactive quiz</p>
                <div className="bg-blue-100 rounded-lg p-4">
                  <p className="text-sm text-blue-600">
                    🚀 Quiz functionality coming soon! This will include multiple choice questions, 
                    instant feedback, and progress tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <p className="text-gray-500">Content type not supported</p>;
    }
  };

  const getIcon = () => {
    switch (lecture.type) {
      case 'text':
        return <FileText className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'audio':
        return <Volume2 className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
          <div className="p-2 rounded-lg bg-gradient-to-r from-orange-100 to-red-100">
            {getIcon()}
          </div>
          <span className="break-words">{lecture.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="min-h-0">
          {renderContent()}
        </div>
        
        {/* Resources */}
        {lecture.resources && lecture.resources.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Additional Resources
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {lecture.resources.map((resource, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm" 
                  asChild 
                  className="justify-start h-auto py-3 px-4"
                >
                  <a href={resource} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Resource {index + 1}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Complete Button */}
        <div className="flex justify-center sm:justify-end pt-4 border-t">
          <Button 
            onClick={onComplete}
            disabled={lecture.isCompleted}
            size="lg"
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              lecture.isCompleted 
                ? 'bg-green-100 text-green-700 border-green-200' 
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <CheckCircle className="h-5 w-5" />
            {lecture.isCompleted ? 'Completed ✓' : 'Mark as Complete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureContent;
