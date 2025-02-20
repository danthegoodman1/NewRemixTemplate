import { Session } from "@remix-run/node"
import { z } from "node_modules/zod/lib"
import {
  authenticator,
  sessionStorage,
  impersonationKey,
} from "~/auth/authenticator"
import { HighStatusCode } from "~/errors"
import { logger } from "~/logger"

export async function doAPIRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  options?: {
    body?: Record<string, unknown>
    zodSchema?: z.ZodType<T>
    userCookie?: string | null
  }
) {
  let session: Session | null = null
  if (options?.userCookie) {
    session = await sessionStorage.getSession(options.userCookie)
  }

  const impersonation = session?.get(impersonationKey)
  const user = session?.get(authenticator.sessionKey)

  const authHeader =
    impersonation?.APIKeySecret ??
    user?.APIKeySecret ??
    process.env.API_SHARED_SECRET!

  if (session?.get(impersonationKey)) {
    logger.info(
      `user ${user?.Email} impersonating ${impersonation?.Email} for ${method} ${path}`
    )
  }

  const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
    method,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    headers: {
      "content-type": "application/json",
      auth: authHeader,
      ...(authHeader && { Authorization: "Bearer " + authHeader }),
    },
  })
  if (!res.ok) {
    throw new HighStatusCode(res.status, await res.text())
  }

  const contentType = res.headers.get("content-type")
  if (!contentType?.includes("application/json")) {
    return (await res.text()) as T
  }

  if (options?.zodSchema) {
    return options.zodSchema.parse(await res.json())
  }

  return (await res.json()) as T
}
