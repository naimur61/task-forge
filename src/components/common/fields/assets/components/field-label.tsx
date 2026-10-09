import { FormLabel } from '@/components/ui/form';
import { LabelAndPlaceholderTextFormat } from '@/lib/utils';

const LABEL_CLASS = 'font-semibold leading-6 text-[14px] tracking-[0.02em]';

interface FieldLabelProps {
  labelName?: string;
  required?: boolean;
  /** true when rendered inside a <FormItem> (uses FormLabel, which targets the FormControl id) */
  inForm?: boolean;
  /** standalone mode only: id of the input this label belongs to */
  htmlFor?: string;
  disableLabelFormatting?: boolean;
  className?: string;
}

/**
 * FieldLabel — accessible label shared by all CustomField components.
 * - inForm: `FormLabel` (htmlFor = FormItem id, which FormControl puts on the input)
 * - standalone: plain `<label htmlFor={id}>`
 */
export const FieldLabel = ({
  labelName, required = false, inForm = false, htmlFor, disableLabelFormatting = true, className,
}: FieldLabelProps) => {
  if (!labelName) return null;
  const text = disableLabelFormatting ? labelName : LabelAndPlaceholderTextFormat(labelName);
  const star = required ? <span className="text-destructive">&nbsp;*</span> : null;
  if (inForm) {
    return (
      <FormLabel className={className ?? LABEL_CLASS}>
        {text}
        {star}
      </FormLabel>
    );
  }
  return (
    <label htmlFor={htmlFor} className={className ?? LABEL_CLASS}>
      {text}
      {star}
    </label>
  );
};
