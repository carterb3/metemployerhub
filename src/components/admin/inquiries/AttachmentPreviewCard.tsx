import { useState } from "react";
import { FileText, Download, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AttachmentPreviewCardProps {
  attachmentUrl: string | null;
  attachmentFilename: string | null;
  bucket?: string;
}

export function AttachmentPreviewCard({
  attachmentUrl,
  attachmentFilename,
  bucket = "employer-inquiry-attachments",
}: AttachmentPreviewCardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!attachmentUrl) {
    return null;
  }

  const getSignedUrl = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signedUrlError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(attachmentUrl, 60 * 5); // 5 minutes

      if (signedUrlError) {
        throw signedUrlError;
      }

      return data.signedUrl;
    } catch (err: any) {
      console.error("Error generating signed URL:", err);
      setError("Failed to access file. It may have been moved or deleted.");
      toast({
        title: "Error",
        description: "Could not access the attachment.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    const url = await getSignedUrl();
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleDownload = async () => {
    const url = await getSignedUrl();
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = attachmentFilename || "attachment";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = () => {
    if (!attachmentFilename) return <FileText className="h-5 w-5" />;
    
    const extension = attachmentFilename.split(".").pop()?.toLowerCase();
    
    // Could add more specific icons for different file types
    return <FileText className="h-5 w-5" />;
  };

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {attachmentFilename || "Attachment"}
            </p>
            <p className="text-xs text-muted-foreground">
              Uploaded job description
            </p>
            
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-destructive text-xs">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
