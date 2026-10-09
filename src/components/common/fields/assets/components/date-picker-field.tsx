'use client';

import { useId } from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LabelAndPlaceholderTextFormat } from '@/lib/utils';
import type { InputInterface } from '../interface/input-props';
import { FieldLabel } from './field-label';

export const DatePickerField = ({
  form, name, labelName, placeholder, required = false, disabled = false,
  viewOnly = false, disableLabelFormatting = false, customMessage, value, setValue,
}: InputInterface['DatePicker']) => {
  const inputId = useId();
  const placeholderText = disableLabelFormatting
    ? placeholder || labelName
    : LabelAndPlaceholderTextFormat(placeholder || labelName || '');

  if (form) {
    return (
      <FormField
        control={form.control}
        name={name || 'date'}
        render={({ field }) => {
          const error = form.formState.errors?.[name || ''];
          return (
            <FormItem>
              <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
              {viewOnly ? (
                <div className="py-2 px-3 text-sm text-foreground bg-background rounded-md border border-border min-h-10">
                  {field.value ? new Date(field.value).toLocaleDateString() : ''}
                </div>
              ) : (
                <>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder={placeholderText}
                      disabled={disabled}
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
      <Input id={inputId} name={name} type="date" placeholder={placeholderText} disabled={disabled} readOnly={viewOnly} value={value} onChange={(e) => setValue?.(e.target.value)} />
    </>
  );
};
