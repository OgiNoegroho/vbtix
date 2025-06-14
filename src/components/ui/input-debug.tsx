import * as React from "react"
import { cn } from "~/lib/utils"

function InputDebug({ 
  className, 
  type, 
  disabled, 
  readOnly, 
  style,
  onClick,
  onFocus,
  onChange,
  ...props 
}: React.ComponentProps<"input">) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    if (inputRef.current) {
      const computedStyle = window.getComputedStyle(inputRef.current);
      console.log('🔍 Input Debug Info:', {
        disabled,
        readOnly,
        hasValue: props.value,
        pointerEvents: computedStyle.pointerEvents,
        userSelect: computedStyle.userSelect,
        cursor: computedStyle.cursor,
        zIndex: computedStyle.zIndex,
        position: computedStyle.position,
        className,
        element: inputRef.current
      });
    }
  }, [disabled, readOnly, props.value, className]);

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    console.log('🖱️ Input clicked:', {
      target: e.target,
      currentTarget: e.currentTarget,
      disabled,
      readOnly
    });
    
    if (!disabled && !readOnly && onClick) {
      onClick(e);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log('🎯 Input focused:', {
      target: e.target,
      disabled,
      readOnly
    });
    
    if (!disabled && !readOnly && onFocus) {
      onFocus(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('✏️ Input changed:', {
      value: e.target.value,
      disabled,
      readOnly
    });
    
    if (!disabled && !readOnly && onChange) {
      onChange(e);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        disabled={disabled}
        readOnly={readOnly}
        data-slot="input"
        style={{
          pointerEvents: disabled ? 'none' : 'auto',
          userSelect: disabled || readOnly ? 'none' : 'auto',
          ...style
        }}
        className={cn(
          // Base styles
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
          "border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs",
          "transition-[color,box-shadow] outline-none",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          
          // Focus styles
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          
          // Error styles  
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          
          // Dark mode
          "dark:bg-input/30",
          
          // Conditional styles
          disabled 
            ? "pointer-events-none cursor-not-allowed opacity-50" 
            : "pointer-events-auto cursor-text",
          
          readOnly 
            ? "cursor-default bg-muted/50" 
            : "",
          
          // Text size responsive
          "md:text-sm",
          
          // Debug mode
          process.env.NODE_ENV === 'development' ? "ring-2 ring-blue-200" : "",
          
          className
        )}
        onClick={handleClick}
        onFocus={handleFocus}
        onChange={handleChange}
        {...props}
      />
      
      {/* Debug overlay */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 right-0 text-xs bg-red-500 text-white px-1 rounded-bl">
          {disabled ? 'D' : ''}{readOnly ? 'R' : ''}
        </div>
      )}
    </div>
  )
}

export { InputDebug }
