'use client';

import { useId } from 'react';
import { FormField, FormItem, FormMessage, useFormField } from '@/components/ui/form';
import { LabelAndPlaceholderTextFormat, maskString } from '@/lib/utils';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '@/styles/phone-input.css';
import type { InputInterface } from '../interface/input-props';
import { FieldLabel } from './field-label';

const PHONE_WRAPPER_CLASS =
  '[&_.react-tel-input]:w-full [&_.form-control]:!w-full [&_.form-control]:!h-11 [&_.form-control]:!rounded-lg [&_.form-control]:!border-border [&_.form-control]:!bg-background [&_.form-control]:!text-sm [&_.flag-dropdown]:!rounded-l-lg [&_.flag-dropdown]:!border-border';

/** Gives PhoneInput the FormItem id so FormLabel htmlFor targets the real <input>. */
const PhoneControl = ({
  wrapperClassName, children,
}: { wrapperClassName: string; children: (formItemId: string) => React.ReactNode }) => {
  const { formItemId } = useFormField();
  return <div className={wrapperClassName}>{children(formItemId)}</div>;
};

export const PhoneNumber = ({
  form, name, labelName, placeholder, required = false, disabled = false,
  viewOnly = false, disableLabelFormatting = false, customMessage, defaultCountry = 'us',
  disableCountryCode = true, disableDropdown = false, onValueChange, isLoading = false,
  hasPhone = false,
}: InputInterface['PhoneNumber']) => {
  const placeholderText = disableLabelFormatting
    ? placeholder || labelName
    : LabelAndPlaceholderTextFormat(placeholder || labelName || '');

  const inputId = useId();

  if (form) {
    return (
      <FormField
        control={form.control}
        name={name || 'phone'}
        render={({ field }) => {
          const error = form.formState.errors?.[name || ''];
          const isError = !!error;

          return (
            <FormItem>
              <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
              {viewOnly ? (
                <div className="py-2 px-3 text-sm text-foreground bg-background rounded-md border border-border min-h-10">
                  {hasPhone ? maskString(field.value) : field.value || ''}
                </div>
              ) : (
                <>
                  <PhoneControl
                    wrapperClassName={PHONE_WRAPPER_CLASS}
                  >
                    {(formItemId) => (
                      <PhoneInput
                        country={defaultCountry}
                        value={field.value}
                        disabled={disabled || isLoading}
                        disableCountryCode={disableCountryCode}
                        disableDropdown={disableDropdown}
                        placeholder={LabelAndPlaceholderTextFormat(placeholder || 'Enter phone number')}
                        inputStyle={isError ? { borderColor: '#dc2626' } : undefined}
                        inputProps={{ id: formItemId, name: field.name, 'aria-invalid': isError }}
                        onChange={(value) => {
                          field.onChange(value);
                          onValueChange?.(value);
                        }}
                        onBlur={field.onBlur}
                        searchStyle={{ width: '100%' }}
                      />
                    )}
                  </PhoneControl>
                  <FormMessage>
                    {isError ? String(error?.message || '') : customMessage || ''}
                  </FormMessage>
                </>
              )}
            </FormItem>
          );
        }}
      />
    );
  }

  return (
    <div>
      <FieldLabel labelName={labelName} required={required} htmlFor={inputId} disableLabelFormatting={disableLabelFormatting} />
      <PhoneInput
        country={defaultCountry}
        disabled={disabled}
        disableCountryCode={disableCountryCode}
        disableDropdown={disableDropdown}
        placeholder={placeholderText}
        inputProps={{ id: inputId, name }}
        inputClass="!w-full !h-11 !rounded-lg !border-border !bg-background !text-sm"
      />
    </div>
  );
};
