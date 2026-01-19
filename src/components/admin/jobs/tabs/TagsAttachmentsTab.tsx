import { useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Plus, Upload, FileText, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { useUploadAttachment, useDeleteAttachment } from "@/hooks/useAdminJobs";
import type { Tag, JobAttachment } from "@/types/jobs";
import { supabase } from "@/integrations/supabase/client";

interface TagsAttachmentsTabProps {
  form: UseFormReturn<any>;
  tags: Tag[];
  onCreateTag: (name: string) => Promise<any>;
  jobId?: string;
  attachments: JobAttachment[];
}

export function TagsAttachmentsTab({
  form,
  tags,
  onCreateTag,
  jobId,
  attachments,
}: TagsAttachmentsTabProps) {
  const [newTag, setNewTag] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPublic, setUploadPublic] = useState(false);

  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();

  const selectedTags = form.watch("tags") ?? [];

  const handleToggleTag = (tagId: string) => {
    const current = form.getValues("tags") ?? [];
    if (current.includes(tagId)) {
      form.setValue(
        "tags",
        current.filter((id: string) => id !== tagId)
      );
    } else {
      form.setValue("tags", [...current, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.trim()) return;
    setIsCreatingTag(true);
    try {
      const tag = await onCreateTag(newTag.trim());
      if (tag) {
        const current = form.getValues("tags") ?? [];
        form.setValue("tags", [...current, tag.id]);
      }
      setNewTag("");
    } catch (err) {
      console.error("Error creating tag:", err);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !jobId) return;

    try {
      await uploadAttachment.mutateAsync({
        jobId,
        file,
        isPublic: uploadPublic,
      });
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAttachment = async (attachment: JobAttachment) => {
    if (!jobId) return;
    try {
      await deleteAttachment.mutateAsync({
        id: attachment.id,
        filePath: attachment.file_path,
        jobId,
      });
    } catch (err) {
      console.error("Error deleting attachment:", err);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Tags Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tags</CardTitle>
          <CardDescription>
            Add tags to help categorize and filter this job
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleToggleTag(tag.id)}
              >
                {tag.name}
                {selectedTags.includes(tag.id) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Create new tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateTag())}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleCreateTag}
              disabled={!newTag.trim() || isCreatingTag}
            >
              {isCreatingTag ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attachments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attachments</CardTitle>
          <CardDescription>
            Upload PDFs like job descriptions, benefits brochures, or application forms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!jobId ? (
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Save the job first to upload attachments
              </p>
            </div>
          ) : (
            <>
              {/* Upload Form */}
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAttachment.isPending}
                >
                  {uploadAttachment.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload File
                </Button>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public"
                    checked={uploadPublic}
                    onCheckedChange={(checked) => setUploadPublic(!!checked)}
                  />
                  <Label htmlFor="public" className="text-sm">
                    Make publicly visible
                  </Label>
                </div>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{attachment.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.file_size)} •{" "}
                            {attachment.file_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={attachment.is_public ? "default" : "secondary"}>
                          {attachment.is_public ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Public
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Staff Only
                            </>
                          )}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAttachment(attachment)}
                          disabled={deleteAttachment.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    No attachments uploaded yet
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
