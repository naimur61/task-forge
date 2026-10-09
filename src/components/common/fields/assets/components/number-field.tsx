'use client';

import { useId } from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LabelAndPlaceholderTextFormat } from '@/lib/utils';
import type { InputInterface } from '../interface/input-props';
import { FieldLabel } from './field-label';

/**
 * Number — A robust numeric input field with:
 * - Integer or float mode
 * - Scroll prevention (blurs on wheel)
 * - Key filtering (blocks non-numeric chars)
 * - Minimum value of 0
 * - Edge case handling for empty/NaN values
 * - Dual-mode: with or without react-hook-form
 */
export const Number = ({
  form, name, labelName, placeholder, required = false, disabled = false,
  viewOnly = false, disableLabelFormatting = false, numberType = 'integer', customMessage, value, setValue,
}: InputInterface['Number']) => {
  const inputId = useId();
  const placeholderText = disableLabelFormatting
    ? placeholder || labelName
    : LabelAndPlaceholderTextFormat(placeholder || labelName || '');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, arrows
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End',
    ];
    if (allowedKeys.includes(e.key)) return;
    // Allow Ctrl/Cmd shortcuts
    if (e.ctrlKey || e.metaKey) return;

    // For integers: only digits
    if (numberType === 'integer') {
      if (!/^\d$/.test(e.key)) { e.preventDefault(); }
      return;
    }

    // For floats: digits and single decimal point
    if (numberType === 'float') {
      const currentValue = (e.target as HTMLInputElement).value;
      if (e.key === '.' && !currentValue.includes('.')) return;
      if (!/^\d$/.test(e.key)) { e.preventDefault(); }
    }
  };

  const handleChange = (value: string, onChange: (val: any) => void) => {
    if (value === '') {
      onChange('');
      return;
    }

    const parsed = numberType === 'float' ? parseFloat(value) : parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    } else {
      onChange('');
    }
  };

  if (form) {
    return (
      <FormField
        control={form.control}
        name={name || 'number'}
        render={({ field }) => {
          const error = form.formState.errors?.[name || ''];
          return (
            <FormItem>
              <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
              {viewOnly ? (
                <div className="py-2 px-3 text-sm text-foreground bg-background rounded-md border border-border min-h-10">
                  {field.value ?? ''}
                </div>
              ) : (
                <>
                  <FormControl>
                    <Input
                      type="number"
                      step={numberType === 'float' ? 'any' : '1'}
                      min={0}
                      placeholder={placeholderText}
                      disabled={disabled}
                      value={field.value ?? ''}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => handleChange(e.target.value, field.onChange)}
                      className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
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
        type="number"
        step={numberType === 'float' ? 'any' : '1'}
        min={0}
        disabled={disabled}
        readOnly={viewOnly}
        value={value ?? ''}
        onChange={(e) => setValue?.(e.target.value)}
        placeholder={placeholderText}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
        onKeyDown={handleKeyDown}
      />
    </>
  );
};
