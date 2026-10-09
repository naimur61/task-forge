import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { FieldLabel } from './field-label';

interface RangeDatePickerProps {
  form: any;
  name: string;
  labelName?: string;
  required?: boolean;
  disabled?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: string;
}

export const RangeDatePicker = ({
  form, name, labelName, required = false, disabled = false,
  disableLabelFormatting = false, customMessage,
}: RangeDatePickerProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const error = form.formState.errors?.[name];
        const value = field.value || {};
        return (
          <FormItem>
            <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Calendar aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="date"
                    aria-label={`${labelName ?? 'Date range'} start date`}
                    className="pl-10"
                    disabled={disabled}
                    value={value.from || ''}
                    onChange={(e) => field.onChange({ ...value, from: e.target.value })}
                  />
                </FormControl>
              </div>
              <span className="text-muted-foreground" aria-hidden="true">to</span>
              <div className="relative flex-1">
                <Calendar aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  aria-label={`${labelName ?? 'Date range'} end date`}
                  aria-invalid={!!error}
                  className="pl-10"
                  disabled={disabled}
                  value={value.to || ''}
                  onChange={(e) => field.onChange({ ...value, to: e.target.value })}
                />
              </div>
            </div>
            <FormMessage>{error ? String(error?.message || '') : customMessage || ''}</FormMessage>
          </FormItem>
        );
      }}
    />
  );
};
