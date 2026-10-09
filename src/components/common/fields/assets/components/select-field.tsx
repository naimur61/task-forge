'use client';

import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { FieldLabel } from './field-label';

interface Option {
  value: string;
  label: string;
  image?: string;
  flag?: string;
  disabled?: boolean;
}

type RawOption = string | Option;

interface SelectFieldProps {
  form: any;
  name: string;
  labelName?: string;
  required?: boolean;
  disabled?: boolean;
  options?: RawOption[];
  placeholder?: string;
  showSearch?: boolean;
  isImageShow?: boolean;
  isFlag?: boolean;
  type?: 'single' | 'multiple';
  viewOnly?: boolean;
  onValueChange?: (value: string | string[]) => void;
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  customMessage?: string;
}

interface SelectControlProps extends SelectFieldProps {
  fieldValue: unknown;
  onBlur: () => void;
}

const SelectControl = React.forwardRef<HTMLDivElement, SelectControlProps>(
  ({
    form, name, labelName, required = false, disabled = false,
    options = [], placeholder = 'Select an option', showSearch = true,
    isImageShow = false, isFlag = false, type = 'single', viewOnly = false,
    onValueChange, isLoading = false, onSearch, customMessage, fieldValue, onBlur,
  }, ref) => {
    const normalizedOptions: Option[] = React.useMemo(
      () => (options || []).map((opt: RawOption) =>
        typeof opt === 'string' ? { label: opt, value: opt } : opt
      ), [options]
    );

    const listId = React.useId();
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');
    const [showMore, setShowMore] = React.useState(false);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const selectedValues = React.useMemo<string[]>(() => {
      if (type === 'multiple') return Array.isArray(fieldValue) ? fieldValue : [];
      return fieldValue ? [fieldValue as string] : [];
    }, [fieldValue, type]);

    const selectedOptions = React.useMemo(
      () => normalizedOptions.filter((opt) => selectedValues.includes(opt.value)),
      [normalizedOptions, selectedValues]
    );

    const filteredOptions = React.useMemo(() => {
      if (!showSearch || !searchValue) return normalizedOptions;
      return normalizedOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchValue.toLowerCase()) ||
          opt.value.toLowerCase().includes(searchValue.toLowerCase())
      );
    }, [normalizedOptions, searchValue, showSearch]);

    const handleSelect = (value: string) => {
      if (type === 'multiple') {
        const newValues = selectedValues.includes(value)
          ? selectedValues.filter((v) => v !== value)
          : [...selectedValues, value];
        form.setValue(name, newValues, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        onValueChange?.(newValues);
      } else {
        form.setValue(name, value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        onValueChange?.(value);
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClear = () => {
      form.setValue(name, type === 'multiple' ? [] : '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      onValueChange?.(type === 'multiple' ? [] : '');
      setShowMore(false);
    };

    const closeDropdown = React.useCallback((restoreFocus: boolean) => {
      setIsOpen(false);
      setSearchValue('');
      onBlur();
      if (restoreFocus) triggerRef.current?.focus();
    }, [onBlur]);

    React.useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (
          dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          !triggerRef.current?.contains(e.target as Node)
        ) closeDropdown(false);
      };
      if (isOpen) {
        document.addEventListener('mousedown', handler);
        searchInputRef.current?.focus();
      }
      return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, closeDropdown]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        closeDropdown(true);
      }
    };

    const iconButtonClass =
      'relative z-10 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

    return (
      <FormItem ref={ref} className="w-full">
        <FieldLabel inForm labelName={labelName} required={required} />

        {viewOnly ? (
          <div className="py-2 px-3 text-sm text-foreground bg-background rounded-md border border-border min-h-10">
            {type === 'multiple'
              ? selectedOptions.map((o) => o.label).join(', ')
              : selectedOptions[0]?.label || ''}
          </div>
        ) : (
          <div className="relative" onKeyDown={handleKeyDown}>
            <div
              className={cn(
                'relative w-full min-h-11 rounded-lg border border-input bg-background px-3 py-2 flex items-center justify-between gap-2',
                'hover:bg-muted/50 transition-colors text-sm focus-within:ring-2 focus-within:ring-ring',
                'has-[[aria-invalid=true]]:border-destructive',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {type === 'multiple' && selectedOptions.slice(0, showMore ? undefined : 2).map((opt) => (
                  <span key={opt.value} className="relative z-10 flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                    {opt.label}
                    <button
                      type="button"
                      aria-label={`Remove ${opt.label}`}
                      disabled={disabled}
                      className={cn(iconButtonClass, 'hover:text-destructive')}
                      onClick={() => handleSelect(opt.value)}
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
                {type === 'multiple' && selectedOptions.length > 2 && (
                  <button
                    type="button"
                    aria-expanded={showMore}
                    className={cn(iconButtonClass, 'text-xs text-primary')}
                    onClick={() => setShowMore((p) => !p)}
                  >
                    {showMore ? 'show less' : `+${selectedOptions.length - 2} more`}
                  </button>
                )}
                <FormControl>
                  <button
                    ref={triggerRef}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen((p) => !p)}
                    className="flex min-w-16 flex-1 items-center gap-2 text-left focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
                  >
                    {selectedOptions.length === 0 && (
                      <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    {type === 'single' && selectedOptions[0] && (
                      <>
                        {isFlag && selectedOptions[0].flag && <span aria-hidden="true">{selectedOptions[0].flag}</span>}
                        {isImageShow && selectedOptions[0].image && (
                          <Image src={selectedOptions[0].image} width={20} height={20} className="w-5 h-5 rounded-full object-cover" alt="" />
                        )}
                        <span>{selectedOptions[0].label}</span>
                      </>
                    )}
                  </button>
                </FormControl>
              </div>
              <div className="flex items-center gap-1">
                {selectedOptions.length > 0 && (
                  <button
                    type="button"
                    aria-label="Clear selection"
                    disabled={disabled}
                    className={cn(iconButtonClass, 'hover:text-destructive')}
                    onClick={handleClear}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
              </div>
            </div>

            {isOpen && (
              <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-lg shadow-md">
                {showSearch && (
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search aria-hidden="true" className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        ref={searchInputRef}
                        type="search"
                        aria-label="Search options"
                        aria-controls={listId}
                        className="w-full pl-8 pr-3 py-2 border rounded-md text-sm bg-background"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => { setSearchValue(e.target.value); onSearch?.(e.target.value); }}
                      />
                    </div>
                  </div>
                )}
                <div
                  id={listId}
                  role="listbox"
                  aria-label={labelName || placeholder}
                  aria-multiselectable={type === 'multiple' || undefined}
                  className="max-h-60 overflow-y-auto"
                >
                  {filteredOptions.length === 0 && (
                    <p className="p-3 text-sm text-center text-muted-foreground">{customMessage || 'No options found'}</p>
                  )}
                  {filteredOptions.map((opt, idx) => {
                    const active = selectedValues.includes(opt.value);
                    return (
                      <button
                        key={opt.value + idx}
                        type="button"
                        role="option"
                        aria-selected={active}
                        disabled={opt.disabled}
                        onClick={() => handleSelect(opt.value)}
                        className={cn('w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none', active && 'bg-primary/10 text-primary', opt.disabled && 'opacity-50 cursor-not-allowed')}
                      >
                        {type === 'multiple' && (
                          <span className="w-4 h-4 border rounded flex items-center justify-center" aria-hidden="true">
                            {active && <Check className="w-3 h-3" />}
                          </span>
                        )}
                        {isFlag && opt.flag && <span aria-hidden="true">{opt.flag}</span>}
                        {isImageShow && opt.image && (
                          <Image src={opt.image} width={20} height={20} className="w-5 h-5 rounded-full" alt="" />
                        )}
                        <span className="flex-1">{opt.label}</span>
                        {type === 'single' && active && <Check className="w-4 h-4" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <FormMessage />
      </FormItem>
    );
  }
);
SelectControl.displayName = 'SelectControl';

export const SelectField = React.forwardRef<HTMLDivElement, SelectFieldProps>(
  (props, ref) => (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <SelectControl ref={ref} {...props} fieldValue={field.value} onBlur={field.onBlur} />
      )}
    />
  )
);
SelectField.displayName = 'SelectField';
