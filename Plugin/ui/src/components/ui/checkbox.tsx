import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded border border-[var(--sona-border)] bg-[var(--sona-surface)] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--sona-ember)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--sona-ember)] data-[state=checked]:border-[var(--sona-ember)] data-[state=checked]:text-[var(--sona-cream)] transition-colors",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("grid place-content-center text-current")}
    >
      <Check className="h-3 w-3" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
