import { Input } from "../../ui/input";

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  helperText?: string;
  className?: string;
}

export function FormInput({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
  required = false,
  type = "text",
  helperText,
  className = "",
}: FormInputProps) {
return ('');
}
