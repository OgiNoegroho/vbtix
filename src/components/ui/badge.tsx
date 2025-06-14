import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl hover:scale-105",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-lg hover:shadow-xl hover:scale-105",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 hover:shadow-xl hover:scale-105",
        outline: "text-foreground border-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40 shadow-sm hover:shadow-lg hover:scale-105 backdrop-blur-sm",
        success:
          "border-transparent bg-green-600 text-white shadow-lg hover:bg-green-700 hover:shadow-xl hover:scale-105",
        warning:
          "border-transparent bg-amber-500 text-white shadow-lg hover:bg-amber-600 hover:shadow-xl hover:scale-105",
        gradient:
          "border-transparent bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105",
        magic:
          "border-transparent bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 shimmer",
        glow:
          "border-transparent bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 pulse-glow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
