'use client';

import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useId } from 'react';
import { FieldLabel } from './field-label';

interface TinyEditorProps {
  form?: any;
  name?: string;
  labelName?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: React.ReactNode;
  height?: number;
}

export const TinyEditor = ({
  form, name = 'content', labelName, required = false, placeholder = 'Enter content...',
  disabled = false, disableLabelFormatting = false, customMessage, height = 300,
}: TinyEditorProps) => {
  const inputId = useId();

  if (!form) {
    return (
      <div className="space-y-2">
        <FieldLabel labelName={labelName} required={required} htmlFor={inputId} disableLabelFormatting={disableLabelFormatting} />
        <Textarea id={inputId} name={name} placeholder={placeholder} disabled={disabled} style={{ minHeight: height }} />
      </div>
    );
  }

  return (
      <FormField
        control={form.control}
        name={name || 'content'}
        render={({ field }) => {
          const error = form.formState.errors?.[name || ''];
        return (
          <FormItem>
            <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
            <FormControl>
              <Textarea {...field} placeholder={placeholder} disabled={disabled}
                className="font-mono text-sm" style={{ minHeight: height }} />
            </FormControl>
            <FormMessage>{error ? String(error?.message || '') : customMessage || ''}</FormMessage>
          </FormItem>
        );
      }}
    />
  );
};
