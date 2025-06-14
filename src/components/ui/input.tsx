import * as React from "react"

import { cn } from "~/lib/utils"

function Input({ className, type, disabled, readOnly, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      disabled={disabled}
      readOnly={readOnly}
      data-slot="input"
      style={{
        // Always ensure auto pointer events unless explicitly disabled
        pointerEvents: disabled ? 'none' : 'auto',
        userSelect: disabled ? 'none' : 'auto',
        WebkitUserSelect: disabled ? 'none' : 'auto',
        cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
        ...style
      }}
      className={cn(
        // Base styles - simplified for better compatibility
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        
        // Focus styles
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        
        // Disabled styles
        disabled && "cursor-not-allowed opacity-50",
        
        // Readonly styles
        readOnly && "cursor-default bg-muted",
        
        className
      )}
      {...props}
    />
  )
}

export { Input }
