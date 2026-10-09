'use client';

import { useId, useState } from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LabelAndPlaceholderTextFormat } from '@/lib/utils';
import type { InputInterface } from '../interface/input-props';
import { FieldLabel } from './field-label';

export const SingleSelectField = ({
  form, name, labelName, placeholder, required = false, disabled = false,
  options, viewOnly = false, onValueChange, isLoading = false, defaultValue = '',
  customMessage, disableLabelFormatting = false,
}: InputInterface['SingleSelect']) => {
  const triggerId = useId();
  const [localValue, setLocalValue] = useState(defaultValue);
  const placeholderText = disableLabelFormatting ? placeholder || 'Select an option' : LabelAndPlaceholderTextFormat(`${placeholder || 'Select an option'}`);

  const renderSelect = (value: string, onChange: (val: string) => void, inForm: boolean) => (
    <Select onValueChange={(val) => { onChange(val); onValueChange?.(val); }} value={value} disabled={disabled}>
      {inForm ? (
        <FormControl>
          <SelectTrigger aria-label={labelName ? undefined : placeholderText}>
            <SelectValue placeholder={placeholderText} />
          </SelectTrigger>
        </FormControl>
      ) : (
        <SelectTrigger id={triggerId} aria-label={labelName ? undefined : placeholderText}>
          <SelectValue placeholder={placeholderText} />
        </SelectTrigger>
      )}
      <SelectContent className="capitalize">
        {isLoading ? (
          <SelectItem value="loading" disabled>Loading...</SelectItem>
        ) : options && options.length > 0 ? (
          options.map((option) => (
            <SelectItem key={option} value={option} className="capitalize">{option}</SelectItem>
          ))
        ) : (
          <SelectItem value="no-options" disabled>
            {disableLabelFormatting ? labelName : LabelAndPlaceholderTextFormat(labelName || '')} options not available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );

  if (form) {
    return (
      <FormField
        control={form.control}
        name={name || 'select'}
        render={({ field }) => (
          <FormItem>
            <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
            {viewOnly ? (
              <div className="py-2 px-3 text-sm text-foreground capitalize bg-background rounded-md border border-border min-h-10">
                {field.value || ''}
              </div>
            ) : (
              <>
                {renderSelect(field.value, field.onChange, true)}
                <FormMessage>{customMessage || ''}</FormMessage>
              </>
            )}
          </FormItem>
        )}
      />
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <FieldLabel labelName={labelName} required={required} htmlFor={triggerId} disableLabelFormatting={disableLabelFormatting} />
      {viewOnly ? (
        <div className="py-2 px-3 text-sm text-foreground capitalize bg-background rounded-md border border-border min-h-10">
          {localValue || ''}
        </div>
      ) : (
        renderSelect(localValue, setLocalValue, false)
      )}
    </div>
  );
};
