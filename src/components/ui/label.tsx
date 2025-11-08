import * as React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className = "", ...props }, ref) => {
  const base = "text-sm font-medium text-neutral-800 mb-1 block";
  return <label ref={ref} className={`${base} ${className}`} {...props} />;
});

Label.displayName = "Label";
