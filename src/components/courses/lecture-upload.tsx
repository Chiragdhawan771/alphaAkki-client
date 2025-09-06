"use client"

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { lectureService } from '@/services';
import { Upload, File, Video, FileText, Music, X, CheckCircle, Save } from 'lucide-react';

interface LectureUploadProps {
  lectureId: string;
  lectureType: 'video' | 'audio' | 'text' | 'pdf' | 'quiz';
  onUploadComplete?: (fileUrl: string, fileKey: string) => void;
  onCancel?: () => void;
}

export const LectureUpload: React.FC<LectureUploadProps> = ({
  lectureId,
  lectureType,
  onUploadComplete,
  onCancel
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [showTextEditor, setShowTextEditor] = useState(lectureType === 'text');

  const getAcceptedFileTypes = () => {
    switch (lectureType) {
      case 'video':
        return '.mp4,.mov,.avi,.mkv,.webm';
      case 'audio':
        return '.mp3,.wav,.m4a,.aac';
      case 'pdf':
        return '.pdf';
      case 'text':
        return '.txt,.md,.html';
      default:
        return '*';
    }
  };

  const getMaxFileSize = () => {
    switch (lectureType) {
      case 'video':
        return 500 * 1024 * 1024; // 500MB
      case 'audio':
        return 100 * 1024 * 1024; // 100MB
      case 'pdf':
        return 50 * 1024 * 1024; // 50MB
      case 'text':
        return 10 * 1024 * 1024; // 10MB
      default:
        return 100 * 1024 * 1024; // 100MB
    }
  };

  const getFileIcon = () => {
    switch (lectureType) {
      case 'video':
        return <Video className="h-8 w-8 text-blue-500" />;
      case 'audio':
        return <Music className="h-8 w-8 text-green-500" />;
      case 'pdf':
        return <File className="h-8 w-8 text-red-500" />;
      case 'text':
        return <FileText className="h-8 w-8 text-gray-500" />;
      default:
        return <Upload className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > getMaxFileSize()) {
      toast({
        title: "File too large",
        description: `File size must be less than ${formatFileSize(getMaxFileSize())}`,
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    const acceptedTypes = getAcceptedFileTypes().split(',');
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (acceptedTypes.length > 0 && acceptedTypes[0] !== '*' && !acceptedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: `Please select a ${lectureType} file`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
  };

  const uploadToAPI = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // Map lecture types to content types for the API
    const contentTypeMap = {
      'video': 'video',
      'audio': 'audio',
      'pdf': 'pdf',
      'text': 'resources', // Text files go as resources
      'quiz': 'resources'
    };

    const contentType = contentTypeMap[lectureType] || 'resources';

    // Use XMLHttpRequest to track upload progress
    return new Promise<{url: string, key: string}>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          // Handle different response structures
          if (response.uploadResult) {
            resolve({ url: response.uploadResult.url, key: response.uploadResult.key });
          } else {
            resolve({ url: response.url, key: response.key });
          }
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      // Get auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/lectures/${lectureId}/upload/${contentType}`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload to the actual API
      const result = await uploadToAPI(selectedFile);

      setUploadComplete(true);
      toast({
        title: "Upload successful!",
        description: `${selectedFile.name} has been uploaded successfully.`
      });

      // Call the completion callback with the result
      onUploadComplete?.(result.url, result.key);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getFileIcon()}
          Upload {lectureType.charAt(0).toUpperCase() + lectureType.slice(1)} Content
        </CardTitle>
        <CardDescription>
          Upload your {lectureType} file for this lecture. Maximum file size: {formatFileSize(getMaxFileSize())}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Content Editor */}
        {showTextEditor && lectureType === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Lecture Content</label>
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter your lecture content here..."
                rows={10}
                className="min-h-[200px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  try {
                    setUploading(true);
                    await lectureService.updateLectureContent(lectureId, textContent);
                    setUploadComplete(true);
                    toast({
                      title: "Content saved!",
                      description: "Your text content has been saved successfully."
                    });
                    onUploadComplete?.('', '');
                  } catch (error) {
                    toast({
                      title: "Save failed",
                      description: "Failed to save content. Please try again.",
                      variant: "destructive"
                    });
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={uploading || !textContent.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {uploading ? 'Saving...' : 'Save Content'}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        {!showTextEditor && !selectedFile && !uploadComplete && (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop your {lectureType} file here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Accepted formats: {getAcceptedFileTypes().replace(/\./g, '').toUpperCase()}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={getAcceptedFileTypes()}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Show text editor option for text lectures */}
        {lectureType === 'text' && !showTextEditor && !selectedFile && !uploadComplete && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Or create text content directly:</p>
            <Button
              variant="outline"
              onClick={() => setShowTextEditor(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Write Text Content
            </Button>
          </div>
        )}

        {selectedFile && !uploadComplete && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              {getFileIcon()}
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {uploadComplete && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Complete!</h3>
            <p className="text-gray-600 mb-4">
              Your {lectureType} content has been uploaded successfully.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={onCancel}>
                Done
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setUploadComplete(false);
                  setUploadProgress(0);
                }}
              >
                Upload Another
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
