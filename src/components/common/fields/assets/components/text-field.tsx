'use client';

import { useId } from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn, LabelAndPlaceholderTextFormat } from '@/lib/utils';
import type { InputInterface } from '../interface/input-props';
import { FieldLabel } from './field-label';

export const Text = ({
  form, name, placeholder, labelName, required = false, disabled = false,
  viewOnly = false, disableLabelFormatting = false, customMessage,
  isArray = false, leftIcon, rightIcon, type = 'text', autoComplete, id, value, setValue,
}: InputInterface['Text']) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const placeholderText = disableLabelFormatting
    ? placeholder || labelName
    : LabelAndPlaceholderTextFormat(placeholder || labelName || '');

  if (form) {
    return (
      <FormField
        control={form.control}
        name={name || 'text'}
        render={({ field }) => {
          const error = form.formState.errors?.[name || ''];
          const isError = !!error;
          return (
            <FormItem>
              <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
              {viewOnly ? (
                <div className="py-2 px-3 text-sm text-foreground bg-background rounded-md border border-border min-h-10">
                  {field.value || ''}
                </div>
              ) : (
                <>
                  <div className="w-full relative">
                    {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{leftIcon}</div>}
                    <FormControl>
                      <Input
                        className={cn(leftIcon ? 'pl-10' : 'pl-4', rightIcon ? 'pr-10' : 'pr-4', isError && 'border-destructive')}
                        placeholder={placeholderText}
                        disabled={disabled}
                        autoComplete={autoComplete}
                        {...field}
                        value={field.value ?? ''}
                        type={type}
                        onChange={(event) => {
                          if (isArray) {
                            const arr = event.target.value.split(/[\s,]+/).map(v => v.trim()).filter(v => v.length > 0);
                            form.setValue(name, arr, { shouldValidate: true, shouldDirty: true });
                          }
                          field.onChange(event);
                        }}
                      />
                    </FormControl>
                    {rightIcon && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{rightIcon}</div>}
                  </div>
                  <FormMessage>{isError ? String(error?.message || '') : customMessage || ''}</FormMessage>
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
      <div className="w-full relative">
        {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{leftIcon}</div>}
        <Input
          id={inputId}
          name={name}
          className={cn(leftIcon ? 'pl-10' : 'pl-4', rightIcon ? 'pr-10' : 'pr-4')}
          value={value}
          onChange={(e) => setValue?.(e.target.value || '')}
          type={type}
          autoComplete={autoComplete}
          disabled={disabled}
          readOnly={viewOnly}
          placeholder={placeholderText}
        />
        {rightIcon && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{rightIcon}</div>}
      </div>
    </>
  );
};
