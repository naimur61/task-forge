'use client';

import { useRef, useState } from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip, X, Eye } from 'lucide-react';
import Image from 'next/image';
import { FieldLabel } from './field-label';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  file: File;
}

interface TextAreaWithFileProps {
  form: any;
  name: string;
  fileName?: string;
  labelName?: string;
  placeholder?: string;
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  rows?: number;
  onSend?: (data: { text: string; files: FileItem[] }) => void;
}

/**
 * TextAreaWithFile — Textarea with attached file uploads.
 *
 * ⚠️ Stores file metadata (id, name, size, type) in the form value,
 * NOT raw File objects. Actual File references are kept in local state
 * for submission via onSend callback.
 */
export const TextAreaWithFile = ({
  form, name, fileName = 'files', labelName, placeholder,
  disabled = false, rows = 3, onSend,
}: TextAreaWithFileProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileItems, setFileItems] = useState<FileItem[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const newItems: FileItem[] = selectedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    const updated = [...fileItems, ...newItems];
    setFileItems(updated);

    // Store metadata in form (strings only — no File objects)
    const metadata = updated.map((item) => ({
      id: item.id,
      name: item.name,
      size: item.size,
      type: item.type,
    }));
    form.setValue(fileName, metadata);
  };

  const handleRemoveFile = (id: string) => {
    setFileItems((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      const updated = prev.filter((p) => p.id !== id);
      // Update form with metadata only
      const metadata = updated.map((item) => ({
        id: item.id, name: item.name, size: item.size, type: item.type,
      }));
      form.setValue(fileName, metadata);
      return updated;
    });
  };

  return (
    <div className="space-y-2">
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FieldLabel inForm labelName={labelName} />
            <div className="relative">
              <FormControl>
                <Textarea {...field} value={field.value ?? ''} placeholder={placeholder} disabled={disabled} rows={rows}
                  aria-label={labelName ? undefined : placeholder || 'Message'} />
              </FormControl>
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8" disabled={disabled}
                  aria-label="Attach files" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} aria-label="Attach files" tabIndex={-1} />

      {fileItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fileItems.map((item) => (
            <div key={item.id} className="relative group border rounded-lg p-2 pr-8">
              {item.type.startsWith('image/') ? (
                <button type="button" aria-label={`Preview ${item.name}`}
                  className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => window.open(item.previewUrl, '_blank', 'noopener,noreferrer')}>
                  <Image src={item.previewUrl} alt="" width={48} height={48} className="object-cover rounded" />
                </button>
              ) : (
                <div className="flex items-center gap-1 text-xs">
                  <button type="button" aria-label={`Preview ${item.name}`}
                    className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => window.open(item.previewUrl, '_blank', 'noopener,noreferrer')}>
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="truncate max-w-[100px]">{item.name}</span>
                </div>
              )}
              <button type="button" aria-label={`Remove ${item.name}`} onClick={() => handleRemoveFile(item.id)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <X className="h-3 w-3 text-destructive" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {onSend && (
        <Button type="button" size="sm"
          onClick={() => onSend({ text: form.watch(name), files: fileItems })}>
          Send
        </Button>
      )}
    </div>
  );
};
