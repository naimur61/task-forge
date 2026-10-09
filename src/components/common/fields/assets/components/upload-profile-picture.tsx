'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Camera, User, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { FieldLabel } from './field-label';

interface UploadProfilePictureProps {
  form?: any;
  name?: string;
  labelName?: string;
  optional?: boolean;
  viewOnly?: boolean;
  removeImage?: boolean;
}

/**
 * UploadProfilePicture — Avatar upload with preview.
 *
 * ⚠️ Stores a data URL string in the form value, NOT a raw File object.
 * Access the actual File via a ref or submit handler if needed.
 */
export const UploadProfilePicture = ({
  form, name = 'avatar', labelName,
  viewOnly = false, removeImage = true,
}: UploadProfilePictureProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store actual File in ref for later upload
    fileRef.current = file;

    // Store data URL string in form — NOT the File object
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      form?.setValue(name, dataUrl, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    fileRef.current = null;
    form?.setValue(name, null, { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const imageSrc = preview || (form?.watch(name) ?? null);

  if (!form) {
    return (
      <div className="flex flex-col items-center gap-4">
        {labelName && <span className="font-semibold text-[14px]">{labelName}</span>}
        <Avatar className="h-24 w-24">
          {imageSrc ? <AvatarImage src={imageSrc} alt={labelName || 'Profile picture'} /> : <AvatarFallback><User className="h-8 w-8" aria-hidden="true" /></AvatarFallback>}
        </Avatar>
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name={name || 'avatar'}
      render={() => (
        <FormItem>
          <div className="flex flex-col items-center gap-4">
            <FieldLabel inForm labelName={labelName} className="font-semibold text-[14px]" />
            <div className="relative">
              <Avatar className="h-24 w-24">
                {imageSrc
                  ? <AvatarImage src={imageSrc} alt={labelName || 'Profile picture'} />
                  : <AvatarFallback><User className="h-8 w-8" aria-hidden="true" /></AvatarFallback>}
              </Avatar>
              {!viewOnly && (
                <Button type="button" size="icon" variant="ghost" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background shadow"
                  aria-label="Upload profile picture"
                  onClick={() => fileInputRef.current?.click()}>
                  <Camera className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
            {removeImage && !viewOnly && (preview || form?.watch(name)) && (
              <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                <X className="h-4 w-4 mr-1" aria-hidden="true" /> Remove
              </Button>
            )}
            <FormControl>
              <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={handleFileSelect} />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
