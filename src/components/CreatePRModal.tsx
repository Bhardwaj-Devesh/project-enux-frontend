import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { createPullRequest, CreatePullRequestRequest } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, GitBranch, Edit3, X } from 'lucide-react';

interface CreatePRModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
  currentContent: string;
  baseVersionId: string;
  playbookTitle: string;
  onSuccess?: (prId: string) => void;
}

export function CreatePRModal({
  isOpen,
  onClose,
  playbookId,
  currentContent,
  baseVersionId,
  playbookTitle,
  onSuccess
}: CreatePRModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newBlogText, setNewBlogText] = useState(currentContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your pull request.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a description for your pull request.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create pull requests.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const prData: CreatePullRequestRequest = {
        title: title.trim(),
        description: description.trim(),
        new_blog_text: newBlogText,
        base_version_id: baseVersionId,
      };

      const response = await createPullRequest(playbookId, prData);
      
      toast({
        title: "Pull Request Created!",
        description: response.message,
      });

      // Call success callback with the new PR ID
      if (onSuccess) {
        onSuccess(response.pull_request.id);
      }

      // Reset form and close modal
      setTitle('');
      setDescription('');
      setNewBlogText(currentContent);
      onClose();
      
    } catch (error) {
      console.error('Error creating pull request:', error);
      toast({
        title: "Failed to create pull request",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('');
      setDescription('');
      setNewBlogText(currentContent);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Create Pull Request
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Playbook Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Playbook</Badge>
              <span className="font-medium">{playbookTitle}</span>
            </div>
                         <div className="text-sm text-muted-foreground">
               Base Version ID: {baseVersionId}
             </div>
             <div className="text-xs text-muted-foreground mt-1">
               This pull request will be based on the current version of the playbook.
             </div>
          </div>

          <Separator />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="pr-title">Pull Request Title *</Label>
            <Input
              id="pr-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of your changes..."
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="pr-description">Description *</Label>
            <Textarea
              id="pr-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of your changes, motivation, and any additional context..."
              rows={4}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pr-content">Updated Content</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {newBlogText.length} characters
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewBlogText(currentContent)}
                  disabled={isSubmitting}
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
            <Textarea
              id="pr-content"
              value={newBlogText}
              onChange={(e) => setNewBlogText(e.target.value)}
              placeholder="Enter your updated playbook content..."
              rows={12}
              className="font-mono text-sm"
              disabled={isSubmitting}
            />
            <div className="text-xs text-muted-foreground">
              This content will replace the current playbook content when the PR is merged.
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Create Pull Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
