import { readFile } from "fs/promises"

export function extractError(e: any | Error) {
  return Object.fromEntries(
    Object.getOwnPropertyNames(e).map((key) => [key, e[key]])
  )
}

export function classNames(...classes: string[]) {
  return classes.flat().filter(Boolean).join(" ")
}

export async function readMarkdown(fileName: string) {
  const file = await readFile(`app/markdown/${fileName}`)
  return file.toString()
}

export function getSQLiteDate(dateString: string): Date {
  // 2024-01-20 22:41:22 format
  return new Date(dateString.replace(" ", "T") + "Z")
}
