import { useId, forwardRef } from "react";
import { Check } from "lucide-react";
import PropTypes from "prop-types";

const Checkbox = forwardRef(({ label, checked, onChange, onClick }, ref) => {
  const id = useId();

  return (
    <label
      htmlFor={id}
      onClick={onClick}
      className="flex items-center gap-2 cursor-pointer select-none text-slate-200"
      ref={ref}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer hidden"
        aria-checked={checked}
      />
      <div className="h-5 w-5 rounded-md border-2 border-sparkle-border flex items-center justify-center transition-colors peer-checked:bg-sparkle-primary peer-checked:border-sparkle-border">
        {checked && <Check className="h-3.5 w-3.5 text-white" />}
      </div>
      <span className="text-sm">{label}</span>
    </label>
  );
});

Checkbox.displayName = "Checkbox";

Checkbox.propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func,
};

export default Checkbox;
