import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import "./tailwind.css"
import "./animations.css"
import NavBar from "./components/NavBar"
import SignInDialog from "./components/SignInDialog"
import { $showSignInDialog } from "./stores"
import { useStore } from "@nanostores/react"

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
  return <Outlet />
}
