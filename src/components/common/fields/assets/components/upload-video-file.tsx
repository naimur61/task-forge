'use client';

import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { FieldLabel } from './field-label';

interface UploadVideoFileProps {
  form: any;
  name: string;
  labelName?: string;
  optional?: boolean;
  maxSizeMB?: number;
}

/**
 * UploadVideoFile — Video upload with preview.
 *
 * ⚠️ Stores a data URL string in the form value, NOT a raw File object.
 */
export const UploadVideoFile = ({
  form, name, labelName, optional = true, maxSizeMB = 50,
}: UploadVideoFileProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const value = form.watch(name);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Store a blob URL string in form — NOT the File object
    const url = URL.createObjectURL(file);
    form.setValue(name, url, { shouldValidate: true });
    setPreviewUrl(url);
  };

  const handleRemove = () => {
    form.setValue(name, null, { shouldValidate: true });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayUrl = previewUrl ?? (typeof value === 'string' ? value : null);

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <FieldLabel inForm labelName={labelName} required={!optional} />
          {displayUrl ? (
            <div className="relative">
              <video src={displayUrl} controls className="w-full max-h-64 rounded-lg" />
              <Button type="button" size="icon" variant="ghost" className="absolute top-2 right-2 h-8 w-8 bg-background/80"
                aria-label="Remove video" onClick={handleRemove}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <button type="button"
              className="w-full border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => inputRef.current?.click()}>
              <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground" aria-hidden="true" />
              <p className="mt-2 text-sm text-muted-foreground">Click to upload video</p>
              <p className="text-xs text-muted-foreground">Max {maxSizeMB}MB</p>
            </button>
          )}
          <FormControl>
            <input ref={inputRef} type="file" accept="video/*" className="sr-only" tabIndex={-1} onChange={handleFileChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
