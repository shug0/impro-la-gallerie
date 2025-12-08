import { motion, MotionProps } from "framer-motion";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  enableMotion?: boolean;
  whileTap?: MotionProps["whileTap"];
  children?: ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-6 py-2 text-sm",
  md: "px-8 py-3 text-base",
  lg: "px-10 py-3 text-lg",
  xl: "px-12 py-4 text-xl",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-2 border-gallery-border bg-transparent text-warm-white transition-all duration-300 hover:bg-gallery-gray hover:border-gallery-gray hover:text-black",
  secondary:
    "bg-warm-white text-black transition-colors duration-200 hover:bg-gray-200",
  ghost:
    "bg-transparent text-warm-white border-2 border-gallery-border/40 transition-colors duration-200 hover:bg-gallery-muted/20",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "lg",
      fullWidth = false,
      className = "",
      children,
      enableMotion = true,
      whileTap = { scale: 0.95 },
      ...props
    },
    ref
  ) => {
    const baseClasses = "font-display tracking-wider";
    const widthClass = fullWidth ? "w-full" : "";
    const combinedClassName = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`.trim();

    if (enableMotion) {
      return (
        <motion.button
          ref={ref}
          className={combinedClassName}
          whileTap={whileTap}
          {...props}
        >
          {children}
        </motion.button>
      );
    }

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
