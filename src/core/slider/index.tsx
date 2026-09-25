"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "../../lib/cn";

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(
  ({ className, ...props }, ref) => {
    // Função para prevenir a propagação de eventos
    const handleStopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
    };

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        onClick={handleStopPropagation}
        onPointerDown={handleStopPropagation}
        onMouseDown={handleStopPropagation}
        onTouchStart={handleStopPropagation}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {(props.value ?? props.defaultValue ?? [0]).map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            aria-label={props["aria-label"]}
            aria-labelledby={props["aria-labelledby"]}
            className="block h-5 w-5 rounded-full border-2 border-primary bg-white ring-offset-background transition-colors motion-reduce:!transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Root>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
