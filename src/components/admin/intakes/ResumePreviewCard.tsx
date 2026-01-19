import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  File,
  FileType
} from "lucide-react";
import { toast } from "sonner";

interface ResumePreviewCardProps {
  resumeUrl: string | null;
  resumeFilename: string | null;
}

export function ResumePreviewCard({ resumeUrl, resumeFilename }: ResumePreviewCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getFileIcon = () => {
    if (!resumeFilename) return <FileText className="h-8 w-8 text-primary" />;
    
    const ext = resumeFilename.toLowerCase().split('.').pop();
    if (ext === 'pdf') {
      return <FileType className="h-8 w-8 text-red-500" />;
    }
    if (ext === 'doc' || ext === 'docx') {
      return <File className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-primary" />;
  };

  const getFileType = () => {
    if (!resumeFilename) return 'Document';
    const ext = resumeFilename.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'PDF Document';
    if (ext === 'doc') return 'Word Document (.doc)';
    if (ext === 'docx') return 'Word Document (.docx)';
    return 'Document';
  };

  const generateSignedUrl = async () => {
    if (!resumeUrl) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Generate a signed URL that expires in 1 hour
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(resumeUrl, 3600); // 1 hour expiry

      if (error) throw error;

      setSignedUrl(data.signedUrl);
      return data.signedUrl;
    } catch (err) {
      console.error('Error generating signed URL:', err);
      setError('Failed to access resume. Please try again.');
      toast.error('Failed to access resume');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    const url = signedUrl || await generateSignedUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = async () => {
    if (!resumeUrl) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(resumeUrl);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = resumeFilename || 'resume';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Resume downloaded');
    } catch (err) {
      console.error('Error downloading resume:', err);
      toast.error('Failed to download resume');
    } finally {
      setIsLoading(false);
    }
  };

  if (!resumeUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No resume uploaded
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Resume
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Info */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="p-3 rounded-lg bg-background border border-border">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {resumeFilename || 'Resume'}
            </p>
            <p className="text-sm text-muted-foreground">
              {getFileType()}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handlePreview}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            Preview
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
        </div>

        {/* Security Note */}
        <p className="text-xs text-muted-foreground text-center">
          Resume access is secured and logged for audit purposes.
        </p>
      </CardContent>
    </Card>
  );
}
