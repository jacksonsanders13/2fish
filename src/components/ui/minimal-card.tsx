/* eslint-disable */
// Vendored from Cult UI (https://cult-ui.com). Edit sparingly; re-pull from the registry to update.
import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

const MinimalCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md bg-neutral-50 p-2 no-underline transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-800/80",
      "",
      "",
      "",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
MinimalCard.displayName = "MinimalCard"

const MinimalCardImage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { src: string; alt: string }
>(({ className, alt, src, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative mb-6 h-[190px] w-full rounded-md",
      "",
      "",
      className
    )}
    {...props}
  >
    <img
      src={src}
      alt={alt}
      width={200}
      height={200}
      className="absolute inset-0 h-full w-full rounded-md object-cover"
    />
    <div className="absolute inset-0 rounded-md">
      <div
        className={cn(
          "absolute inset-0 rounded-md",
          "",
          ""
        )}
      />
      <div
        className={cn(
          "absolute inset-0 rounded-md",
          ""
        )}
      />
    </div>
  </div>
))
MinimalCardImage.displayName = "MinimalCardImage"

const MinimalCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("mt-2 px-1 text-lg leading-tight font-semibold", className)}
    {...props}
  />
))
MinimalCardTitle.displayName = "MinimalCardTitle"

const MinimalCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("px-1 pb-2 text-sm text-neutral-500", className)}
    {...props}
  />
))
MinimalCardDescription.displayName = "MinimalCardDescription"

const MinimalCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
MinimalCardContent.displayName = "MinimalCardContent"

const MinimalCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
MinimalCardFooter.displayName = "MinimalCardFooter"

export {
  MinimalCard,
  MinimalCardImage,
  MinimalCardTitle,
  MinimalCardDescription,
  MinimalCardContent,
  MinimalCardFooter,
}

export default MinimalCard
