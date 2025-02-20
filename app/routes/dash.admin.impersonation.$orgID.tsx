import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import { Form, Outlet, useLoaderData } from "@remix-run/react"
import {
  authenticator,
  sessionStorage,
  impersonationKey,
} from "~/auth/authenticator"
import { doAPIRequest } from "~/helpers/api.server"
import { User } from "~/auth/users_and_orgs.types"
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

  const orgID = params.orgID

  const users = await doAPIRequest<{
    Users: User[]
  }>(`/dashboard/orgs/${orgID}/users`, "GET")

  return {
    users,
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
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

  const formData = await request.formData()

  const impersonateUser = await doAPIRequest(
    "/dashboard/get_or_create_user",
    "POST",
    {
      // zodSchema: GetOrCreateUserSchema,
      body: {
        Email: formData.get("userEmail"),
      },
    }
  )

  // Impersonate the user
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))
  session.set(impersonationKey, impersonateUser)

  return redirect("/dash", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  })
}

export default function Impersonation() {
  const { users } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>Impersonation - Users</h1>
      <div className="flex gap-4">
        <div className="flex flex-col gap-4">
          {users.Users.map((user) => (
            <div key={user.ID}>
              <Form
                className={"text-black bg-white px-2 py-1 rounded-md"}
                method="POST"
              >
                <input type="hidden" name="userID" value={user.ID} />
                <input type="hidden" name="userEmail" value={user.Email} />
                <button type="submit">{user.Email}</button>
              </Form>
            </div>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  )
}
