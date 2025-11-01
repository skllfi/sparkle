import { useId, forwardRef, InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(
  ({ label, checked, onChange, ...rest }, ref) => {
    const id = useId();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    };

    return (
      <label
        htmlFor={id}
        className="flex items-center gap-2 cursor-pointer select-none text-slate-200"
        ref={ref}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="peer hidden"
          aria-checked={checked}
          {...rest}
        />
        <div className="h-5 w-5 rounded-md border-2 border-sparkle-border flex items-center justify-center transition-colors peer-checked:bg-sparkle-primary peer-checked:border-sparkle-border">
          {checked && <Check className="h-3.5 w-3.5 text-white" />}
        </div>
        <span className="text-sm">{label}</span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
