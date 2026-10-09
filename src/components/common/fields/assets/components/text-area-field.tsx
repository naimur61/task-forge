'use client';

import { useId } from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { LabelAndPlaceholderTextFormat } from '@/lib/utils';
import type { InputInterface } from '../interface/input-props';
import { FieldLabel } from './field-label';

export const TextArea = ({
  form, name, labelName, placeholder, required = false, disabled = false,
  viewOnly = false, rows = 4, disableLabelFormatting = false, customMessage, value, setValue,
}: InputInterface['TextArea']) => {
  const inputId = useId();
  const placeholderText = disableLabelFormatting
    ? placeholder || labelName
    : LabelAndPlaceholderTextFormat(placeholder || labelName || '');

  if (form) {
    return (
      <FormField
        control={form.control}
        name={name || 'textarea'}
        render={({ field }) => {
          const error = form.formState.errors?.[name || ''];
          return (
            <FormItem>
              <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
              {viewOnly ? (
                <div className="py-2 px-3 text-sm text-foreground bg-background rounded-md border border-border min-h-10 whitespace-pre-wrap">
                  {field.value || ''}
                </div>
              ) : (
                <>
                  <FormControl>
                    <Textarea
                      placeholder={placeholderText}
                      disabled={disabled}
                      rows={rows}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{error ? String(error?.message || '') : customMessage || ''}</FormMessage>
                </>
              )}
            </FormItem>
          );
        }}
      />
    );
  }

  return (
    <>
      <FieldLabel labelName={labelName} required={required} htmlFor={inputId} disableLabelFormatting={disableLabelFormatting} />
      <Textarea id={inputId} name={name} value={value} onChange={(e) => setValue?.(e.target.value)} placeholder={placeholderText} rows={rows} disabled={disabled} readOnly={viewOnly} />
    </>
  );
};
