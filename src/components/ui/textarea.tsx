import * as React from "react"

import { cn } from "~/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disabled, readOnly, style, ...props }, ref) => {
    return (
      <textarea
        disabled={disabled}
        readOnly={readOnly}
        style={{
          // Always ensure auto pointer events unless explicitly disabled
          pointerEvents: disabled ? 'none' : 'auto',
          userSelect: disabled ? 'none' : 'auto',
          WebkitUserSelect: disabled ? 'none' : 'auto',
          cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
          ...style
        }}
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          
          // Disabled styles
          disabled && "cursor-not-allowed opacity-50",
          
          // Readonly styles
          readOnly && "cursor-default bg-muted",
            
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
