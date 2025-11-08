import * as React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "primary";
  /** Optional icon to render alongside the button text */
  icon?: React.ReactNode;
  /** Where the icon should appear relative to the children. Defaults to left. */
  iconPosition?: "left" | "right";
  size?: "default" | "micro" | "icon";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      icon,
      iconPosition = "left",
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";
    const styles =
      variant === "ghost"
        ? "bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-100"
        : variant === "primary"
        ? "bg-[#71B27B] text-white hover:bg-[#71B27B]/90"
        : "bg-neutral-900 text-white hover:bg-neutral-800";

    const sizes =
      size === "micro"
        ? "min-h-6 px-2 text-xs"
        : size === "icon"
        ? "h-9 w-9 p-0"
        : "min-h-10 px-4 py-2";

    const hasChildren = React.Children.count(children) > 0;

    return (
      <button ref={ref} className={`${base} ${styles} ${sizes} ${className}`} {...props}>
        {icon && iconPosition === "left" && (
          <span className={hasChildren ? "mr-2" : undefined}>{icon}</span>
        )}
        {children}
        {icon && iconPosition === "right" && (
          <span className={hasChildren ? "ml-2" : undefined}>{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
