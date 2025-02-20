import { redirect, TypedResponse } from "@remix-run/node"
import { readFile } from "fs/promises"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractError(e: any | Error) {
  return Object.fromEntries(
    Object.getOwnPropertyNames(e).map((key) => [key, e[key]])
  )
}

export async function readMarkdown(fileName: string) {
  const file = await readFile(`app/markdown/${fileName}`)
  return file.toString()
}

export type ToastMessage = {
  message: string
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center"
  level?: "info" | "success" | "warning" | "error"
}

export function redirectWithToast(
  path: string,
  message: ToastMessage
): TypedResponse<never> {
  const separator = path.includes("?") ? "&" : "?"
  const toastPath = `${path}${separator}toast=${encodeURIComponent(
    JSON.stringify(message)
  )}`
  return redirect(toastPath)
}
