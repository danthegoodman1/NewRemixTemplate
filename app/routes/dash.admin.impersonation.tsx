import { LoaderFunctionArgs } from "@remix-run/node"
import { NavLink, Outlet, useLoaderData } from "@remix-run/react"
import { authenticator } from "~/auth/authenticator"
import { Org } from "~/auth/users_and_orgs.types"
import { doAPIRequest } from "~/helpers/api.server"
import { redirectWithToast } from "~/utils.server"

export async function loader({ request }: LoaderFunctionArgs) {
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

  const orgs = await doAPIRequest<{
    Orgs: Org[]
  }>("/dashboard/orgs", "GET")

  return {
    orgs,
  }
}

export default function Impersonation() {
  const { orgs } = useLoaderData<typeof loader>()

  return (
    <div>
      <div className="flex gap-4">
        <div className="flex flex-col gap-4">
          <h1>Impersonation - Orgs</h1>
          {orgs.Orgs.map((org) => (
            <div key={org.ID}>
              <NavLink
                className={"text-black bg-white px-2 py-1 rounded-md"}
                to={`/dash/admin/impersonation/${org.ID}`}
              >
                {org.Data.Name || org.Domain || org.ID}
              </NavLink>
            </div>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  )
}
