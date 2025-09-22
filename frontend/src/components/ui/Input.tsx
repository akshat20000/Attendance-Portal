// import React from 'react'
import type { InputHTMLAttributes, JSX } from 'react'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return (
    <input
      {...props}
      className={`w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  )
}