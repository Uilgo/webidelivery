import type * as React from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

// Componente Input básico
const Input = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// Componente Input com ícones
interface InputWithIconProps extends React.ComponentProps<"input"> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, leftIcon, rightIcon, onRightIconClick, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {leftIcon}
          </div>
        )}

        <Input
          ref={ref}
          className={cn(leftIcon && "pl-10", rightIcon && "pr-10", className)}
          {...props}
        />

        {rightIcon &&
          (onRightIconClick ? (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground focus:outline-none focus:text-foreground"
              onClick={onRightIconClick}
              tabIndex={0}
            >
              {rightIcon}
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {rightIcon}
            </div>
          ))}
      </div>
    );
  }
);
InputWithIcon.displayName = "InputWithIcon";

export { Input, InputWithIcon };
