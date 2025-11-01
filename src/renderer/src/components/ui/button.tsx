import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { Button as HeadlessButton } from "@headlessui/react";
import { clsx } from "clsx";

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-lg",
};

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "outline" | "secondary" | "danger";
  size?: keyof typeof sizes;
  className?: string;
  as?: React.ElementType;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "sm",
      className = "",
      disabled = false,
      as = "button",
      ...props
    },
    ref,
  ) => {
    const base =
      "flex items-center rounded-lg font-medium transition-all duration-200 select-none focus:outline-hidden active:scale-90";

    const variants = {
      primary:
        "bg-sparkle-primary text-white hover:brightness-110 border-sparkle-secondary hover:bg-sparkle-secondary hover:border-sparkle-primary",
      outline:
        "border border-sparkle-primary text-sparkle-primary hover:bg-sparkle-primary hover:text-white",
      secondary:
        "bg-sparkle-card border border-sparkle-secondary text-sparkle-text hover:bg-sparkle-secondary hover:border-sparkle-card",
      danger:
        "bg-red-600 text-white border border-red-700 hover:bg-red-700 hover:border-red-800 focus:ring-red-500",
    };

    const disabledClasses = "opacity-50 cursor-not-allowed pointer-events-none";

    return (
      <HeadlessButton
        as={as}
        ref={ref}
        className={clsx(
          base,
          sizes[size],
          variants[variant],
          disabled ? disabledClasses : "",
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </HeadlessButton>
    );
  },
);

Button.displayName = "Button";

export default Button;
