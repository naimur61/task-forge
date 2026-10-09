import { useId } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LabelAndPlaceholderTextFormat } from '@/lib/utils';
import type { RadioProps } from '../interface/input-props';

export const RadioField = ({
  form, name, labelName, required = false, disabled = false, viewOnly = false, options = [],
}: RadioProps) => {
  const baseId = useId();
  const labelId = `${baseId}-label`;

  if (!form) return null;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {labelName && (
            <span id={labelId} className="block font-semibold leading-6 text-[14px] tracking-[0.02em]">
              {LabelAndPlaceholderTextFormat(labelName)}
              {required && <span className="text-destructive">&nbsp;*</span>}
            </span>
          )}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value ?? ''}
              aria-labelledby={labelName ? labelId : undefined}
              className="flex flex-col space-y-1"
              disabled={disabled || viewOnly}
            >
              {options.map((opt) => {
                const optionId = `${baseId}-${opt.value}`;
                return (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={optionId} />
                    <FormLabel htmlFor={optionId} className="font-normal">{opt.label}</FormLabel>
                  </div>
                );
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
