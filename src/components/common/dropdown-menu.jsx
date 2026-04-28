import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function DropdownMenu({ modal = false, ...props }) {
  return <DropdownMenuPrimitive.Root modal={modal} {...props} />;
}
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export const DropdownMenuContent = React.forwardRef(
  function DropdownMenuContent(
    { className, sideOffset = 6, align = "end", ...props },
    ref,
  ) {
    return (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          align={align}
          className={cn(
            "z-50 min-w-[180px] overflow-hidden rounded-xl border border-warm-gray-dark/60",
            "bg-white p-1 shadow-lg",
            "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
            className,
          )}
          {...props}
        />
      </DropdownMenuPrimitive.Portal>
    );
  },
);

export const DropdownMenuItem = React.forwardRef(function DropdownMenuItem(
  { className, inset, ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2",
        "text-sm text-charcoal outline-none transition-colors",
        "hover:bg-warm-gray focus:bg-warm-gray",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
});

export const DropdownMenuLabel = React.forwardRef(function DropdownMenuLabel(
  { className, inset, ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn(
        "px-3 py-2 text-xs text-charcoal-subtle font-medium",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
});

export const DropdownMenuSeparator = React.forwardRef(
  function DropdownMenuSeparator({ className, ...props }, ref) {
    return (
      <DropdownMenuPrimitive.Separator
        ref={ref}
        className={cn("my-1 h-px bg-warm-gray-dark/50", className)}
        {...props}
      />
    );
  },
);

export const DropdownMenuCheckboxItem = React.forwardRef(
  function DropdownMenuCheckboxItem(
    { className, children, checked, ...props },
    ref,
  ) {
    return (
      <DropdownMenuPrimitive.CheckboxItem
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-4",
          "text-sm text-charcoal outline-none transition-colors",
          "hover:bg-warm-gray focus:bg-warm-gray",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className,
        )}
        checked={checked}
        {...props}
      >
        <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
          <DropdownMenuPrimitive.ItemIndicator>
            <Check className="h-4 w-4 text-sage" />
          </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
      </DropdownMenuPrimitive.CheckboxItem>
    );
  },
);
