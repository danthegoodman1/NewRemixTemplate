import { Link } from "@remix-run/react"
import { useSession } from "~/hooks/useSession"
import { $showSignInDialog } from "~/stores"

export default function NavBar() {
  const user = useSession()

  // TODO: add optimization to signout to current page

  return (
    <div className="h-[36px] bg-[#090A32] w-full flex justify-center items-center">
      <div className="px-[30px] flex justify-between items-center w-full max-w-[1260px] text-sm">
        <div className="gap-10 items-center hidden sm:flex">
          <Link to={"/"}>
            <img src="/stlogo-128w.png" alt="logo" width={39} />
          </Link>
          <Link to="/terms" className="hover:underline font-mono text-white">
            Terms
          </Link>
          <Link to="/context" className="hover:underline font-mono text-white">
            Contact
          </Link>
        </div>

        {/* <div className="items-center hidden sm:flex gap-10"> */}
        <div className="items-center sm:flex gap-10">
          <button
            onClick={() => {
              if (!user) {
                $showSignInDialog.set(true)
              }
            }}
            className="hover:underline cursor-pointer font-mono text-white"
          >
            {user ? user.name : "Sign in"}
          </button>
          {user && (
            <a
              className="text-white hover:underline font-mono"
              href={user ? "/signout" : undefined}
            >
              Sign out
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
