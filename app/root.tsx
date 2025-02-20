import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useSearchParams,
} from "@remix-run/react"
import "./tailwind.css"
import "./animations.css"
import NavBar from "./components/NavBar"
import SignInDialog from "./components/SignInDialog"
import { $showSignInDialog } from "./stores"
import { useStore } from "@nanostores/react"
import { ToastMessage } from "./utils.server"
import { useEffect } from "react"
import { toast, ExternalToast } from "sonner"

export function Layout({ children }: { children: React.ReactNode }) {
  const showSignInDialog = useStore($showSignInDialog)

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <NavBar />
        <div className="w-full flex justify-center mt-10 px-[30px]">
          <SignInDialog open={showSignInDialog} />
          {children}
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const toastMessage = searchParams.get("toast")
    if (toastMessage) {
      const toastMessageObj = JSON.parse(toastMessage) as ToastMessage
      // Remove the 'toast' parameter from the URL
      searchParams.delete("toast")
      setSearchParams(searchParams)

      // Display the toast message
      let toastCall: (
        message: React.ReactNode,
        data?: ExternalToast | undefined
      ) => string | number
      switch (toastMessageObj.level) {
        case "info":
          toastCall = toast.info
          break
        case "success":
          toastCall = toast.success
          break
        case "warning":
          toastCall = toast.warning
          break
        case "error":
          toastCall = toast.error
          break
        default:
          toastCall = toast.info
          break
      }
      toastCall(toastMessageObj.message, {
        position: toastMessageObj.position ?? "top-center",
      })
    }
  }, [searchParams])

  return <Outlet />
}
