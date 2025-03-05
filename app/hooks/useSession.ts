import { useEffect, useState } from "react"
import { AuthSession } from "~/auth/authenticator"

/**
 * ### In the loader
 *
 * ```
 * const session = await sessionStorage.getSession(request.headers.get('Cookie'));
 *
 * session.set('time', {
 * 	value: new Date().toISOString(),
 * });
 *
 * return new Response(null, {
 * 	headers: {
 * 		'Set-Cookie': await sessionStorage.commitSession(session),
 * 	},
 * });
 * ```
 *
 * ### Then in the client:
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
  T extends { user: AuthSession; impersonation?: AuthSession } = {
    user: AuthSession
    impersonation?: AuthSession
  }
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
