import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear().toString().slice(-2)
    return `${day}-${month}-${year}`
  } catch (error) {
    console.error("Invalid date string:", dateString)
    return ""
  }
}

export function formatDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) return ""
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  return `${start} to ${end}`
}
