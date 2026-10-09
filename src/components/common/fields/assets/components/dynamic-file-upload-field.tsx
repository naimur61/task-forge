'use client';

import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Upload, X, File, Eye } from 'lucide-react';
import { useRef, useState } from 'react';
import { FieldLabel } from './field-label';

interface FilePreview {
  id: string;
  name: string;
  url: string;
  size: number;
  isUploaded: boolean;
}

interface DynamicFileUploadFieldProps {
  form: any;
  name: string;
  labelName?: string;
  optional?: boolean;
  viewOnly?: boolean;
  multiple?: boolean;
  maxSizeMB?: number;
  accept?: string;
  onUpload?: (file: File) => Promise<string>;
}

/**
 * DynamicFileUploadField — Drag-and-drop style file upload.
 *
 * ⚠️ Stores URL strings in the form value, NOT raw File objects.
 * - If onUpload is provided: stores the returned URL after upload
 * - If onUpload is omitted: stores an object with file metadata
 *   (no raw File objects in form state)
 */
export const DynamicFileUploadField = ({
  form, name, labelName, optional = false, viewOnly = false,
  multiple = false, maxSizeMB = 5, accept = '*', onUpload,
}: DynamicFileUploadFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<Map<string, File>>(new Map());
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<FilePreview[]>([]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File ${file.name} exceeds ${maxSizeMB}MB`);
        return;
      }
    }

    const newPreviews: FilePreview[] = fileArray.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      url: URL.createObjectURL(f),
      size: f.size,
      isUploaded: false,
    }));

    // Store File refs for later upload
    newPreviews.forEach((p, i) => filesRef.current.set(p.id, fileArray[i]));

    if (onUpload) {
      setUploading(true);
      try {
        const urls = await Promise.all(fileArray.map((f) => onUpload(f)));
        const updated = newPreviews.map((p, i) => ({ ...p, url: urls[i], isUploaded: true }));
        setPreviews((prev) => [...prev, ...updated]);
        // Store URL strings in form
        form.setValue(name, multiple ? updated.map((u) => u.url) : updated[0].url, { shouldValidate: true });
      } finally {
        setUploading(false);
      }
    } else {
      // No upload handler: store metadata objects (strings only, no File objects)
      const metadata = newPreviews.map((p) => ({ id: p.id, name: p.name, size: p.size, type: 'pending' }));
      setPreviews((prev) => [...prev, ...newPreviews]);
      form.setValue(name, multiple ? metadata : metadata[0], { shouldValidate: true });
    }
  };

  const handleRemove = (id: string) => {
    setPreviews((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      const updated = prev.filter((p) => p.id !== id);
      filesRef.current.delete(id);
      // Update form value
      if (multiple) {
        form.setValue(name, updated.map((u) => onUpload ? u.url : { id: u.id, name: u.name, size: u.size }), { shouldValidate: true });
      } else {
        form.setValue(name, null, { shouldValidate: true });
      }
      return updated;
    });
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <FieldLabel inForm labelName={labelName} required={!optional} />
          {!viewOnly && (
            <button type="button" disabled={uploading}
              className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" aria-hidden="true" />
              <p className="mt-2 text-sm text-muted-foreground">
                {uploading ? 'Uploading...' : `Click to upload${multiple ? ' (multiple)' : ''}`}
              </p>
              <p className="text-xs text-muted-foreground">Max {maxSizeMB}MB per file</p>
            </button>
          )}
          {!viewOnly && (
            <FormControl>
              <input ref={fileInputRef} type="file" accept={accept} multiple={multiple} className="sr-only" tabIndex={-1}
                onChange={(e) => handleFiles(e.target.files)} />
            </FormControl>
          )}
          {previews.length > 0 && (
            <div className="space-y-2">
              {previews.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm truncate max-w-[200px]">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.isUploaded && (
                      <button type="button" aria-label={`Preview ${p.name}`} className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => window.open(p.url, '_blank', 'noopener,noreferrer')}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                    {!viewOnly && (
                      <button type="button" aria-label={`Remove ${p.name}`} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => handleRemove(p.id)}>
                        <X className="h-4 w-4 text-destructive" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
