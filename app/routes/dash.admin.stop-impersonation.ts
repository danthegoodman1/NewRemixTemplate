import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import {
  authenticator,
  sessionStorage,
  impersonationKey,
} from "~/auth/authenticator"
import { redirectWithToast } from "~/utils.server"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  })

  if (!user) {
    return redirectWithToast("/auth/login", {
      message: "Session not found or expired",
      level: "error",
    })
  }

  // if (user.APIKeyRole !== 'superadmin') {
  // 	return redirectWithToast('/dash', {
  // 		message: 'LMAO you are not ALLOWED (skill issue)',
  // 		level: 'error',
  // 	});
  // }

  // Stop impersonation
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))
  session.unset(impersonationKey)

  return redirect("/dash", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  })
}
