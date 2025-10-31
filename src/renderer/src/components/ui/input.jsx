import React from "react";
import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

const Input = React.forwardRef(
  ({ type, defaultValue, onChange, className, placeholder, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        defaultValue={defaultValue}
        onChange={onChange}
        className={cn(
          "w-full bg-sparkle-card border border-sparkle-border rounded-lg px-3 py-2 text-sparkle-text",
          "focus:ring-0 focus:outline-hidden focus:border-sparkle-primary transition-colors",
          className,
        )}
        placeholder={placeholder}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

Input.propTypes = {
  type: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  placeholder: PropTypes.string,
};

const LargeInput = React.forwardRef(
  ({ placeholder, value, onChange, icon: Icon, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 bg-sparkle-card border border-sparkle-border",
          "rounded-xl px-4 backdrop-blur-xs transition-colors",
          "focus-within:border-sparkle-primary",
          className,
        )}
      >
        {Icon && <Icon className="w-5 h-5 text-sparkle-text-secondary" />}
        <input
          type="text"
          placeholder={placeholder}
          className={cn(
            "w-full py-3 px-0 bg-transparent border-none",
            "focus:outline-hidden focus:ring-0 text-sparkle-text",
            "placeholder:text-sparkle-text-secondary",
          )}
          value={value}
          onChange={onChange}
          {...props}
        />
      </div>
    );
  },
);

LargeInput.displayName = "LargeInput";

LargeInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  icon: PropTypes.elementType,
  className: PropTypes.string,
};

export { Input, LargeInput };
