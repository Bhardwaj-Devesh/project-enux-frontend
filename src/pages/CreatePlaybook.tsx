import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, FileText, File, XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createPlaybook, checkRequiredBuckets, createRequiredBuckets, REQUIRED_BUCKETS } from '@/lib/playbook';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CreatePlaybook() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [license, setLicense] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bucketWarning, setBucketWarning] = useState<string | null>(null);
  const [checkingBuckets, setCheckingBuckets] = useState(false);
  const [creatingBuckets, setCreatingBuckets] = useState(false);
  const [missingBuckets, setMissingBuckets] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if required storage buckets exist when component mounts
  useEffect(() => {
    async function checkBuckets() {
      try {
        setCheckingBuckets(true);
        const { exists, missingBuckets } = await checkRequiredBuckets();
        setMissingBuckets(missingBuckets);
        
        if (!exists && missingBuckets.length > 0) {
          setBucketWarning(
            `Missing required storage buckets: ${missingBuckets.join(', ')}. ` +
            `Please create these buckets in your Supabase dashboard or click the button below to attempt to create them.`
          );
        } else {
          setBucketWarning(null);
        }
      } catch (error) {
        console.error('Error checking buckets:', error);
        // Don't show a warning for errors, as we're assuming buckets exist in this case
      } finally {
        setCheckingBuckets(false);
      }
    }
    
    if (user) {
      checkBuckets();
    }
  }, [user]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true, // Prevent opening file dialog on dropzone click
  });

  const handleFileBrowseClick = () => {
    // Programmatically trigger the file input click
    const inputElement = document.getElementById('file-upload-input');
    if (inputElement) {
      inputElement.click();
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  // Handle creating the required buckets
  const handleCreateBuckets = async () => {
    if (creatingBuckets || missingBuckets.length === 0) return;
    
    setCreatingBuckets(true);
    try {
      const result = await createRequiredBuckets();
      
      if (result.success) {
        toast({
          title: "Buckets created",
          description: result.message,
        });
        
        // Recheck buckets
        const { exists, missingBuckets: stillMissing } = await checkRequiredBuckets();
        setMissingBuckets(stillMissing);
        
        if (exists) {
          setBucketWarning(null);
        } else {
          setBucketWarning(
            `Some buckets could not be created: ${stillMissing.join(', ')}. ` +
            `You may need administrator privileges. Please create these buckets in your Supabase dashboard.`
          );
        }
      } else {
        toast({
          title: "Failed to create buckets",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating buckets:", error);
      toast({
        title: "Error creating buckets",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setCreatingBuckets(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create a playbook.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if required buckets exist before attempting to create playbook
      const { exists, missingBuckets } = await checkRequiredBuckets();
      if (!exists) {
        setMissingBuckets(missingBuckets);
        setBucketWarning(
          `Missing required storage buckets: ${missingBuckets.join(', ')}. ` +
          `Please create these buckets in your Supabase dashboard or click the button below to attempt to create them.`
        );
        throw new Error('Required storage buckets are missing. Please create them before proceeding.');
      }
      
      const result = await createPlaybook(
        {
          title,
          description,
          license,
          visibility: visibility as 'public' | 'private',
        },
        files,
        user.id
      );

      if (result.success) {
        toast({
          title: 'Playbook created successfully!',
          description: result.message || 'Your playbook has been published.',
        });
        // Redirect to the newly created playbook's page
        if (result.playbookId) {
          navigate(`/playbook/${result.playbookId}`);
        } else {
          navigate('/dashboard'); // Fallback to dashboard if no ID
        }
      } else {
        toast({
          title: 'Failed to create playbook.',
          description: result.message || 'Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Unexpected error during playbook creation:', error);
      toast({
        title: 'An unexpected error occurred.',
        description: 'Please check your network connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Create a New Playbook</CardTitle>
          <CardDescription className="text-muted-foreground">Build your playbook by uploading files and adding metadata.</CardDescription>
          
          {bucketWarning && (
            <div className="space-y-4 mt-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Storage Configuration Issue</AlertTitle>
                <AlertDescription>{bucketWarning}</AlertDescription>
              </Alert>
              
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleCreateBuckets} 
                  disabled={creatingBuckets || missingBuckets.length === 0}
                  className="flex items-center gap-2"
                >
                  {creatingBuckets ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Creating Buckets...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Attempt to Create Required Buckets
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Section */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragActive ? 'border-primary bg-muted' : 'border-gray-300 bg-background'}`}
            >
              <input id="file-upload-input" {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or'}
              </p>
              <Button type="button" variant="outline" className="mt-2" onClick={handleFileBrowseClick}>
                Browse files
              </Button>
            </div>

            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Files to Upload:</h3>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        <File className="h-5 w-5 mr-2 text-gray-500" />
                        <span>{file.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">({(file.size / 1024).toFixed(2)} KB)</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(file)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metadata Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., B2B SaaS Growth Hacking Playbook"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="A detailed description of your playbook..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <div>
                <Label htmlFor="license">Licensing</Label>
                <Select value={license} onValueChange={setLicense} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a license" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC-BY">Creative Commons Attribution (CC-BY)</SelectItem>
                    <SelectItem value="MIT">MIT License</SelectItem>
                    <SelectItem value="Custom">Custom License</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Visibility</Label>
                <RadioGroup value={visibility} onValueChange={setVisibility} className="flex space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public">Public</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private">Private</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || files.length === 0 || !!bucketWarning || checkingBuckets}
            >
              {isSubmitting ? 'Creating Playbook...' : checkingBuckets ? 'Checking Storage Configuration...' : 'Create Playbook'}
            </Button>
            
            {bucketWarning && (
              <p className="text-sm text-red-500 mt-2">
                Please resolve the storage configuration issues before creating a playbook.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}