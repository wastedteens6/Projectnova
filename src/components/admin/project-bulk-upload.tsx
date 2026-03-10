'use client';

import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function ProjectBulkUpload({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadSample = async () => {
    try {
      const res = await fetch('/api/admin/projects/bulk/sample');
      if (!res.ok) throw new Error('Failed to download sample');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project_bulk_upload_sample.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      toast({
        title: 'Download failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an Excel (.xlsx) file',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setUploadStats(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/projects/bulk', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        if (data.data?.errors) {
            setUploadStats({ success: 0, errors: data.data.errors });
        } else {
            throw new Error(data.error || 'Upload failed');
        }
      } else {
        setUploadStats({ success: data.data.count, errors: [] });
        toast({
          title: 'Bulk upload successful',
          description: `${data.data.count} projects uploaded successfully.`,
        });
        // Clear input
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <Card className="glass-card mb-8 overflow-hidden">
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    Bulk Project Upload
                </CardTitle>
                <CardDescription>
                    Add multiple projects at once using an Excel spreadsheet.
                </CardDescription>
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadSample}
                className="gap-2 border-primary/20 hover:border-primary/50 transition-colors"
            >
                <Download className="h-4 w-4" />
                Download Sample
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
            ${dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border/50 bg-muted/20 hover:bg-muted/30 hover:border-primary/50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx"
            onChange={handleFileChange}
            disabled={uploading}
          />
          
          <div className="p-4 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>
          
          <p className="font-medium">
            {uploading ? 'Processing your file...' : 'Click or drag Excel file to upload'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Max 500 projects per upload (.xlsx)
          </p>
        </div>

        {uploadStats && (
          <div className={`p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${uploadStats.errors.length > 0 ? 'bg-destructive/10 border-destructive/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
            <div className="flex items-start gap-3">
              {uploadStats.errors.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              )}
              
              <div className="space-y-1">
                <p className={`font-semibold ${uploadStats.errors.length > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                    {uploadStats.errors.length > 0 ? 'Upload Failed' : 'Upload Successful'}
                </p>
                {uploadStats.success > 0 && (
                    <p className="text-sm text-muted-foreground">
                        Successfully created {uploadStats.success} projects.
                    </p>
                )}
                {uploadStats.errors.length > 0 && (
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 mt-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {uploadStats.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>

              <button 
                onClick={() => setUploadStats(null)}
                className="ml-auto p-1 rounded-md hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
