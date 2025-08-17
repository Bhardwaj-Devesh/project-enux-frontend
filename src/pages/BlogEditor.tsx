import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Eye, EyeOff, FileText, Tag, Globe, Lock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { uploadPlaybook } from '@/lib/api';

interface PlaybookFormData {
  title: string;
  description: string;
  tags: string[];
  license: string;
  visibility: 'public' | 'private';
  files: File[];
}

export default function BlogEditor() {
  const [formData, setFormData] = useState<PlaybookFormData | null>(null);
  const [blogContent, setBlogContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Retrieve form data from sessionStorage
    const storedData = sessionStorage.getItem('playbook_form_data');
    if (!storedData) {
      toast({
        title: 'No playbook data found',
        description: 'Please start creating a playbook from the beginning.',
        variant: 'destructive',
      });
      navigate('/create');
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      setFormData(parsedData);
    } catch (error) {
      toast({
        title: 'Invalid playbook data',
        description: 'Please start creating a playbook from the beginning.',
        variant: 'destructive',
      });
      navigate('/create');
    }
  }, [navigate, toast]);

  const handleBack = () => {
    navigate('/create');
  };

  const handleCreatePlaybook = async () => {
    if (!formData || !blogContent.trim()) {
      toast({
        title: 'Missing content',
        description: 'Please write some blog content before creating the playbook.',
        variant: 'destructive',
      });
      return;
    }

    // Get files from global variable
    const files = (window as any).playbookFiles || [];

    setIsSubmitting(true);

    try {
      // Call the API to upload the playbook with files
      const response = await uploadPlaybook({
        title: formData.title,
        description: formData.description,
        owner_id: user?.id || 'anonymous', // Fallback if user ID is not available
        files: files,
        blog_content: blogContent,
      });

      // Clear session storage and global variables
      sessionStorage.removeItem('playbook_form_data');
      sessionStorage.removeItem('playbook_files_metadata');
      delete (window as any).playbookFiles;

      toast({
        title: 'Playbook created successfully!',
        description: response.message || 'Your playbook has been published.',
      });

      // Navigate to the created playbook
      navigate(`/playbook/${response.playbook.id}`);
    } catch (error) {
      console.error('Error creating playbook:', error);
      toast({
        title: 'Failed to create playbook',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMarkdownPreview = (content: string) => {
    // Simple markdown rendering for demo
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mb-4">{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold mb-3">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium mb-2">{line.substring(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-3">{line}</p>;
      });
  };

  // Show loading while loading form data
  if (!formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
              
              <Button
                onClick={handleCreatePlaybook}
                disabled={isSubmitting || !blogContent.trim()}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Creating...' : 'Create Playbook'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Playbook Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">{formData.title}</CardTitle>
              <p className="text-muted-foreground">{formData.description}</p>
              
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
                
                <Badge variant="outline" className="flex items-center gap-1">
                  {formData.visibility === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {formData.visibility}
                </Badge>
                
                <Badge variant="outline">
                  {formData.license}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Editor/Preview */}
          <Card>
            <CardContent className="p-0">
              {isPreview ? (
                <div className="p-8 prose max-w-none">
                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Blog Content Preview</h3>
                    <p className="text-sm text-muted-foreground">
                      This is how your blog content will appear to readers.
                    </p>
                  </div>
                  {renderMarkdownPreview(blogContent)}
                </div>
              ) : (
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Write Your Blog Content</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Write your playbook content in Markdown format. Use # for headings, - for lists, and regular text for paragraphs.
                    </p>
                    
                    <div className="mb-4 p-4 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Markdown Tips:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li># Heading 1</li>
                        <li>## Heading 2</li>
                        <li>- List item</li>
                        <li>**Bold text**</li>
                        <li>*Italic text*</li>
                      </ul>
                    </div>
                  </div>
                  
                  <textarea
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    placeholder="Start writing your playbook content here...
                    
# Introduction
Write your introduction here...

## Key Concepts
- First concept
- Second concept
- Third concept

## Implementation Steps
1. Step one
2. Step two
3. Step three

## Conclusion
Wrap up your playbook here..."
                    className="w-full h-96 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Files Summary */}
          {(() => {
            const fileMetadata = sessionStorage.getItem('playbook_files_metadata');
            const files = fileMetadata ? JSON.parse(fileMetadata) : [];
            
            return files.length > 0 ? (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Uploaded Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {files.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{file.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
} 
