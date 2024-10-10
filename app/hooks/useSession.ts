import { useEffect, useState } from "react"
import { AuthSession } from "~/auth/authenticator"

export function useSession() {
  const [user, setUser] = useState<AuthSession | null>(null)

  useEffect(() => {
    const cookies = document.cookie.split(";")
    console.log("cookies", cookies)
    const sessionCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("_session=")
    )

    if (sessionCookie) {
      const [, value] = sessionCookie.split("=")
      const [payload] = value.split(".")
      try {
        const decodedUser = JSON.parse(atob(decodeURIComponent(payload))) as {
          user: AuthSession
          strategy: "twitch" | "google"
        }
        setUser(decodedUser.user)
      } catch (error) {
        console.error("Failed to parse session cookie:", error)
      }
    }
  }, [])

  return user
}
