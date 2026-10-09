'use client';

import { useId } from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { FieldLabel } from './field-label';

export const OTP = ({
  form, name, labelName, required = false, disableLabelFormatting = false,
  maxLength = 6, customMessage,
}: {
  form?: any; name?: string; labelName?: string; required?: boolean;
  disableLabelFormatting?: boolean; maxLength?: number; customMessage?: React.ReactNode;
}) => {
  const inputId = useId();

  if (!form) {
    return (
      <div>
        <FieldLabel labelName={labelName} required={required} htmlFor={inputId} disableLabelFormatting={disableLabelFormatting} />
        <InputOTP id={inputId} name={name} maxLength={maxLength}>
          <InputOTPGroup>
            {Array.from({ length: maxLength }).map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name={name || 'otp'}
      render={({ field }) => {
        const error = form.formState.errors?.[name || ''];
        return (
          <FormItem>
            <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
            <FormControl>
              <InputOTP maxLength={maxLength} value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur}>
                <InputOTPGroup>
                  {Array.from({ length: maxLength }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </FormControl>
            <FormMessage>{error ? String(error?.message || '') : customMessage || ''}</FormMessage>
          </FormItem>
        );
      }}
    />
  );
};
