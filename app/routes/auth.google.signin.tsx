import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import { authenticator, googleAuth } from "~/auth/authenticator"
import { signinRedirectCookie } from "~/auth/signin_redirect_cookie"

export async function loader(args: LoaderFunctionArgs) {
  const searchParams = new URL(args.request.url).searchParams
  const redirectTo = searchParams.get("redirectTo")

  try {
    await authenticator.authenticate(googleAuth, args.request, {
      throwOnError: true,
      successRedirect: "/", // we catch redirectTo below
    })
  } catch (error) {
    // Because redirects work by throwing a Response, you need to check if the
    // caught error is a response and return it or throw it again
    if (error instanceof Response) {
      const cookieHeader = args.request.headers.get("cookie")
      const cookie: string | undefined = await signinRedirectCookie.parse(
        cookieHeader
      )
      if (cookie) {
        return redirect(cookie, {
          headers: {
            "set-cookie": await signinRedirectCookie.serialize(undefined, {
              maxAge: 0, // unset it
            }),
          },
        })
      }

      // Let's inject the cookie to set
      if (redirectTo) {
        const existingCookies = error.headers.get("set-cookie") || ""
        const newCookie = await signinRedirectCookie.serialize(redirectTo)
        error.headers.set(
          "set-cookie",
          existingCookies ? `${existingCookies}, ${newCookie}` : newCookie
        )
      }
      throw error
    }

    return redirect(
      "/signin?failed=" + encodeURIComponent((error as Error).message)
    )
  }
}
