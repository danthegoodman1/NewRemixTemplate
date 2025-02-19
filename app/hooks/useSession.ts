import { useEffect, useState } from "react"
import { AuthSession } from "~/auth/authenticator"

/**
 * Use like:
 *
 * ```
 * type Session = {
 * 	user: AuthSession;
 * 	time: number;
 * };
 *
 * export default function Overview() {
 * 	const session = useSession<Session>();
 * 	return <div>{JSON.stringify(session)}</div>;
 * }
 * ```
 */

export function useSession<
  T extends { user: AuthSession } = { user: AuthSession }
>() {
  const [session, setSession] = useState<T | null>(null)

  useEffect(() => {
    const cookies = document.cookie.split(";")
    const sessionCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("_session=")
    )

    if (sessionCookie) {
      const [, value] = sessionCookie.split("=")
      const [payload] = value.split(".")
      try {
        const decodedSession = JSON.parse(
          atob(decodeURIComponent(payload))
        ) as T
        setSession(decodedSession)
      } catch (error) {
        console.error("Failed to parse session cookie:", error)
      }
    }
  }, [])

  return session
}
