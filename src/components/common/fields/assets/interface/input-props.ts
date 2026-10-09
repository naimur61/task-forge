export interface TextInputProps {
  form?: any;
  name?: string;
  placeholder?: string;
  labelName?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: React.ReactNode;
  isArray?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: 'text' | 'email' | 'url' | 'tel' | 'search';
  autoComplete?: string;
  id?: string;
  value?: string;
  setValue?: (value: string) => void;
}

export interface TextAreaInputProps {
  form?: any;
  name?: string;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  rows?: number;
  disableLabelFormatting?: boolean;
  customMessage?: React.ReactNode;
  value?: string;
  setValue?: (value: string) => void;
}

export interface NumberInputProps {
  form?: any;
  name?: string;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  disableLabelFormatting?: boolean;
  numberType?: 'float' | 'integer';
  customMessage?: React.ReactNode;
  value?: string;
  setValue?: (value: string) => void;
}

export interface PasswordInputProps {
  form?: any;
  name?: string;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  disableLabelFormatting?: boolean;
  mode?: 'normal' | 'validate';
  customMessage?: React.ReactNode;
  autoComplete?: string;
}

export interface SingleSelectProps {
  form?: any;
  name?: string;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  options?: string[];
  viewOnly?: boolean;
  isLoading?: boolean;
  defaultValue?: any;
  onValueChange?: (value: any) => void;
  disableLabelFormatting?: boolean;
  customMessage?: string;
}

export interface SelectFieldProps {
  form: any;
  name: string;
  labelName?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string; image?: string; flag?: string; disabled?: boolean }[] | string[];
  placeholder?: string;
  showSearch?: boolean;
  type?: 'single' | 'multiple';
  viewOnly?: boolean;
  onValueChange?: (value: string | string[]) => void;
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  customMessage?: string;
}

export interface SwitchProps {
  form?: any;
  name?: string;
  labelName?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: React.ReactNode;
  description?: string;
  border?: boolean;
  value?: boolean;
  setValue?: (value: boolean) => void;
  onCheckedChange?: (checked: boolean) => void;
}

export interface CheckboxProps {
  form?: any;
  name: string;
  labelName?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  options?: { label: string; value: string }[];
}

export interface RadioProps {
  form?: any;
  name: string;
  labelName?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  options?: { label: string; value: string }[];
}

export interface DatePickerProps {
  form?: any;
  name?: string;
  value?: string;
  setValue?: (value: string) => void;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: string;
}

export interface PhoneNumberProps {
  form?: any;
  name?: string;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: string;
  defaultCountry?: string;
  disableCountryCode?: boolean;
  disableDropdown?: boolean;
  onValueChange?: (value: string) => void;
  isLoading?: boolean;
  hasPhone?: boolean;
}

export interface SearchFieldProps {
  form?: any;
  name?: string;
  placeholder?: string;
  optional?: boolean;
  onSearch?: (value: string) => void;
  value?: string;
  setValue?: (value: string) => void;
}

export interface InputInterface {
  Text: TextInputProps;
  TextArea: TextAreaInputProps;
  Number: NumberInputProps;
  Password: PasswordInputProps;
  SingleSelect: SingleSelectProps;
  PhoneNumber: PhoneNumberProps;
  Switch: SwitchProps;
  DatePicker: DatePickerProps;
  Search: SearchFieldProps;
}

export interface FieldPropsInterface {
  form?: any;
  name: string;
  placeholder?: string;
  labelName?: string;
  description?: string;
  border?: boolean;
  options?: string[];
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  isArray?: boolean;
  style?: string;
  defaultValue?: any;
  viewOnly?: boolean;
  rows?: number;
  disableLabelFormatting?: boolean;
  maxLength?: number;
  suffix?: string;
  mode?: 'normal' | 'validate';
  customMessage?: React.ReactNode;
  onValueChange?: (value: any) => void;
  isLoading?: boolean;
}
