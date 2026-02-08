"use client";

import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils"; // or replace with your own cn helper

export const Select = RadixSelect.Root;

export const SelectGroup = RadixSelect.Group;
export const SelectValue = RadixSelect.Value;
export const SelectLabel = RadixSelect.Label;
export const SelectSeparator = RadixSelect.Separator;
export const SelectScrollUpButton = RadixSelect.ScrollUpButton;
export const SelectScrollDownButton = RadixSelect.ScrollDownButton;
export const SelectViewport = RadixSelect.Viewport;

export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
    <RadixSelect.Trigger
        ref={ref}
        className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        {...props}
    >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
    </RadixSelect.Trigger>
));
SelectTrigger.displayName = RadixSelect.Trigger.displayName;

export const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
    <RadixSelect.Portal>
        <RadixSelect.Content
            ref={ref}
            className={cn(
                "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
                position === "popper" && "translate-y-1",
                className
            )}
            position={position}
            {...props}
        >
            <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
        </RadixSelect.Content>
    </RadixSelect.Portal>
));
SelectContent.displayName = RadixSelect.Content.displayName;

export const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
    <RadixSelect.Item
        ref={ref}
        className={cn(
            "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        {...props}
    >
        {children}
    </RadixSelect.Item>
));
SelectItem.displayName = RadixSelect.Item.displayName;
