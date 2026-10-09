'use client';

import { useId } from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import type { InputInterface } from '../interface/input-props';
import { FieldLabel } from './field-label';

export const SwitchField = ({
  form, name, labelName, required = false, disabled = false,
  viewOnly = false, disableLabelFormatting = false, customMessage,
  description, border = false, value, setValue, onCheckedChange,
}: InputInterface['Switch']) => {
  const switchId = useId();

  if (form) {
    return (
      <FormField
        control={form.control}
        name={name || 'switch'}
        render={({ field }) => {
          const error = form.formState.errors?.[name || ''];
          return (
            <FormItem>
              <div className={`flex items-center justify-between ${border ? 'p-4 border rounded-lg' : ''}`}>
                <div className="space-y-0.5">
                  <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
                  {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      onCheckedChange?.(checked);
                    }}
                    disabled={disabled || viewOnly}
                  />
                </FormControl>
              </div>
              <FormMessage>{error ? String(error?.message || '') : customMessage || ''}</FormMessage>
            </FormItem>
          );
        }}
      />
    );
  }

  return (
    <div className={`flex items-center justify-between ${border ? 'p-4 border rounded-lg' : ''}`}>
      <div className="space-y-0.5">
        <FieldLabel labelName={labelName} required={required} htmlFor={switchId} disableLabelFormatting={disableLabelFormatting} />
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch id={switchId} name={name} checked={value} onCheckedChange={(checked) => { setValue?.(checked); onCheckedChange?.(checked); }} disabled={disabled || viewOnly} />
    </div>
  );
};
