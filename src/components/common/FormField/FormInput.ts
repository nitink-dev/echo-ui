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
    //   return (
//     <div className="space-y-2">
//       <Label htmlFor={id} className="text-sm font-medium text-gray-700">
//         {label} {required && "*"}
//       </Label>
//       <Input
//         id={id}
//         type={type}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         disabled={disabled}
//         className={`h-11 bg-[#f8faff] border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20 ${
//           error ? "border-red-500 focus:border-red-500" : ""
//         } ${className}`}
//       />
//       {error && <p className="text-sm text-red-600">{error}</p>}
//       {helperText && !error && (
//         <p className="text-xs text-gray-500">{helperText}</p>
//       )}
//     </div>
//   );
}
