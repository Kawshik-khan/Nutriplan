import { motion } from "motion/react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl transition-all duration-200 font-medium";

  const variantStyles = {
    primary:
      "bg-[#22C55E] text-white hover:bg-[#16A34A] active:scale-[0.98] shadow-sm hover:shadow-md",
    secondary:
      "bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <motion.button
      whileHover={{ scale: variant === "ghost" ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
