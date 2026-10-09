'use client';

import { useId } from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LabelAndPlaceholderTextFormat } from '@/lib/utils';
import type { InputInterface } from '../interface/input-props';
import { FieldLabel } from './field-label';

export const StringNumber = ({
  form, name, labelName, placeholder, required = false, disabled = false,
  viewOnly = false, disableLabelFormatting = false, customMessage, value, setValue,
}: InputInterface['Number']) => {
  const inputId = useId();
  const placeholderText = disableLabelFormatting
    ? placeholder || labelName
    : LabelAndPlaceholderTextFormat(placeholder || labelName || '');

  if (form) {
    return (
      <FormField
        control={form.control}
        name={name || 'string-number'}
        render={({ field }) => {
          const error = form.formState.errors?.[name || ''];
          return (
            <FormItem>
              <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
              {viewOnly ? (
                <div className="py-2 px-3 text-sm text-foreground bg-background rounded-md border border-border min-h-10">
                  {field.value || ''}
                </div>
              ) : (
                <>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder={placeholderText}
                      disabled={disabled}
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        field.onChange(val);
                      }}
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
      <Input
        id={inputId}
        name={name}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={placeholderText}
        disabled={disabled}
        readOnly={viewOnly}
        value={value}
        onChange={(e) => setValue?.(e.target.value.replace(/[^0-9]/g, ''))}
      />
    </>
  );
};
