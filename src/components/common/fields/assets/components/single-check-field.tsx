import { useId } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

export const SingleCheckField = ({
  form, name, labelName, required = false, disabled = false,
  description,
}: {
  form?: any; name?: string; labelName?: string; required?: boolean; disabled?: boolean; description?: string;
}) => {
  const id = useId();

  if (form) {
    return (
      <FormField
        control={form.control}
        name={name || 'checkbox'}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center space-x-2">
              <FormControl>
                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} disabled={disabled} />
              </FormControl>
              <FormLabel className="font-normal">
                {labelName}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            </div>
            {description && <p className="text-sm text-muted-foreground ml-6">{description}</p>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} name={name} disabled={disabled} />
      <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {labelName}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
    </div>
  );
};
