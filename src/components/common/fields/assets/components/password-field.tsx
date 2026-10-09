'use client';

import { useId, useState } from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LabelAndPlaceholderTextFormat, passwordRules } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import type { InputInterface } from '../interface/input-props';
import { FieldLabel } from './field-label';

/**
 * Password — Reusable password input with:
 * - Show/hide toggle
 * - Optional strength validation rules (mode="validate")
 * - Dual-mode: with or without react-hook-form
 */
export const Password = ({
  form, name, labelName, placeholder, required = false, disabled = false,
  disableLabelFormatting = false, mode = 'normal', customMessage, autoComplete,
}: InputInterface['Password']) => {
  const inputId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const placeholderText = disableLabelFormatting
    ? placeholder || labelName
    : LabelAndPlaceholderTextFormat(placeholder || labelName || '');

  /** Strength checklist for `value` (only in mode="validate"). */
  const renderStrengthRules = (value: string) => {
    if (mode !== 'validate' || !value) return null;
    if (passwordRules.every((rule) => rule.test(value))) return null;

    return (
      <ul className="mt-2 space-y-1 text-sm">
        {passwordRules.map((rule, index) => {
          const passed = rule.test(value);
          return (
            <li
              key={index}
              className={`flex items-center gap-2 ${passed ? 'text-green-600' : 'text-muted-foreground'}`}
            >
              <span className={`w-2 h-2 rounded-full inline-block ${passed ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
              {rule.label}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderInput = (fieldProps?: Record<string, any>) => (
    <div className="w-full relative">
      {/* In form mode FormControl injects id / aria-* into this Input */}
      {form ? (
        <FormControl>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder={placeholderText}
            disabled={disabled}
            autoComplete={autoComplete}
            className="pr-10"
            {...fieldProps}
            onChange={(e) => {
              fieldProps?.onChange?.(e);
              setPasswordValue(e.target.value);
            }}
          />
        </FormControl>
      ) : (
        <Input
          id={inputId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholderText}
          disabled={disabled}
          autoComplete={autoComplete}
          className="pr-10"
          {...fieldProps}
          onChange={(e) => {
            fieldProps?.onChange?.(e);
            setPasswordValue(e.target.value);
          }}
        />
      )}
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        aria-pressed={showPassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
      >
        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );

  if (form) {
    return (
      <FormField
        control={form.control}
        name={name || 'password'}
        render={({ field }) => {
          const error = form.formState.errors?.[name || ''];
          return (
            <FormItem>
              <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
              {/* The form owns the value, so form.reset() clears this input. */}
              {renderInput({ ...field, value: field.value ?? '' })}
              {renderStrengthRules(field.value ?? '')}
              <FormMessage>{error ? String(error?.message || '') : customMessage || ''}</FormMessage>
            </FormItem>
          );
        }}
      />
    );
  }

  return (
    <>
      <FieldLabel labelName={labelName} required={required} htmlFor={inputId} disableLabelFormatting={disableLabelFormatting} />
      {renderInput()}
      {renderStrengthRules(passwordValue)}
    </>
  );
};
