import { useId } from 'react';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

export const MultiCheckField = ({
  form, name, labelName, options = [],
}: {
  form: any; name: string; labelName?: string; options?: { label: string; value: string }[];
}) => {
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
            <span id={labelId} className="block font-semibold leading-6 text-[14px] tracking-[0.02em]">{labelName}</span>
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
                        field.onChange(
                          checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value)
                        );
                      }}
                      onBlur={field.onBlur}
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
