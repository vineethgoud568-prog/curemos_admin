export interface IOption {
  label: string;
  value: string;
  description?: string;
  [key: string]: unknown;
}

export interface ISelectInputProps {
  name: string;
  label?: string;
  options: IOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  search?: boolean;
  virtualized?: boolean;
  optional?: boolean;
  required?: boolean;
  description?: string;
}
