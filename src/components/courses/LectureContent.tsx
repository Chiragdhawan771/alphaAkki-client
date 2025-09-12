import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Volume2, Download, CheckCircle } from 'lucide-react';

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
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lecture.content || 'No content available' }} />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="space-y-4">
            {lecture.pdfUrl ? (
              <iframe
                src={lecture.pdfUrl}
                className="w-full h-96 border rounded-lg"
                title={lecture.title}
              />
            ) : (
              <p className="text-gray-500">PDF not available</p>
            )}
            {lecture.pdfUrl && (
              <Button variant="outline" asChild>
                <a href={lecture.pdfUrl} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            )}
          </div>
        );
      
      case 'audio':
        return (
          <div className="space-y-4">
            {lecture.audioUrl ? (
              <audio controls className="w-full">
                <source src={lecture.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p className="text-gray-500">Audio not available</p>
            )}
          </div>
        );
      
      case 'quiz':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">Quiz functionality coming soon...</p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">
                This lecture contains a quiz. Quiz functionality will be implemented in a future update.
              </p>
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          {lecture.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderContent()}
        
        {/* Resources */}
        {lecture.resources && lecture.resources.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Resources</h4>
            <div className="space-y-1">
              {lecture.resources.map((resource, index) => (
                <Button key={index} variant="outline" size="sm" asChild>
                  <a href={resource} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3 w-3 mr-2" />
                    Resource {index + 1}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Complete Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={onComplete}
            disabled={lecture.isCompleted}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {lecture.isCompleted ? 'Completed' : 'Mark as Complete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureContent;
