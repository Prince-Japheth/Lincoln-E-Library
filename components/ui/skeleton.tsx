import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600", className)}
      {...props}
    />
  )
}

export { Skeleton }
