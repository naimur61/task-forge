import { useId } from 'react';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckboxProps } from '../interface/input-props';

export const CheckField = ({
  form, name, labelName, required = false, disabled = false, options = [],
}: CheckboxProps & { options: { label: string; value: string }[] }) => {
  const baseId = useId();
  const labelId = `${baseId}-label`;

  if (!form) return null;

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem role="group" aria-labelledby={labelName ? labelId : undefined}>
          {labelName && (
            <span id={labelId} className="block font-semibold leading-6 text-[14px] tracking-[0.02em]">
              {labelName}
              {required && <span className="text-destructive">&nbsp;*</span>}
            </span>
          )}
          {options.map((opt) => {
            const optionId = `${baseId}-${opt.value}`;
            return (
              <FormField
                key={opt.value}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={optionId}
                      checked={field.value?.includes(opt.value)}
                      onCheckedChange={(checked) => {
                        const current = field.value || [];
                        const updated = checked
                          ? [...current, opt.value]
                          : current.filter((v: string) => v !== opt.value);
                        field.onChange(updated);
                      }}
                      onBlur={field.onBlur}
                      disabled={disabled}
                    />
                    <label htmlFor={optionId} className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {opt.label}
                    </label>
                  </div>
                )}
              />
            );
          })}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
