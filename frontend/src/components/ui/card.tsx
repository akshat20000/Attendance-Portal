import type { HTMLAttributes, JSX } from "react"

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      {...props}
      className={`rounded-xl border bg-white shadow ${className}`}
    />
  )
}

export function CardContent({ className = "", ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      {...props}
      className={`p-6 ${className}`}
    />
  )
}
