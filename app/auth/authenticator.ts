import { createCookieSessionStorage, redirect } from "@remix-run/node"
import { Authenticator } from "remix-auth"
import { GoogleStrategy } from "remix-auth-google"

import { logger } from "app/logger"
import { extractError } from "app/utils"
import { createOrGetUser, selectUserById } from "app/db/users.server"

import { RowsNotFound } from "app/db/errors"
import { OAuth2Strategy } from "remix-auth-oauth2"
import { getTwitchUser } from "./twitch"
import inTransaction from "~/db/transactional.server"
import { UserRow } from "~/db/users.types"

// export the whole sessionStorage object
export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: false,
    secrets: [process.env.COOKIE_SECRET!],
    secure: process.env.NODE_ENV === "production", // enable this in prod only
    maxAge: 3600 * 24 * 14, // 2 weeks
  },
})

export interface AuthSession {
  id: string
  email: string
  scopes: string
  name: string
}

export let authenticator = new Authenticator<AuthSession>(sessionStorage)

export const googleAuth = "google"

let secret = process.env.COOKIE_SECRET
if (!secret) throw new Error("Missing COOKIE_SECRET env variable.")

const googleScopes = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
]

authenticator.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.MY_URL + "/auth/google/callback",
      accessType: "offline",
      prompt: "consent",
      scope: googleScopes.join(" "),
    },
    async ({ accessToken, refreshToken, extraParams, profile }) => {
      try {
        logger.debug(
          {
            profile,
            extraParams,
          },
          "got user"
        )

        let user: UserRow | undefined
        await inTransaction(async (conn) => {
          user = await createOrGetUser(
            conn,
            profile.emails[0].value,
            profile.displayName,
            "google",
            googleScopes,
            refreshToken
          )
        })

        // pleasing typescript
        if (!user)
          throw new Error("User not created or found THIS SHOULD NOT HAPPEN")

        return {
          email: user.email,
          name: user.name,
          id: user.id,
          scopes: user.scopes,
        } as AuthSession
      } catch (error) {
        logger.error(
          {
            err: extractError(error),
          },
          "error in createOrGetUser"
        )
        throw error
      }
    }
  ),
  googleAuth
)

export const twitchAuth = "twitch"

authenticator.use(
  new OAuth2Strategy(
    {
      authorizationEndpoint: "https://id.twitch.tv/oauth2/authorize",
      tokenEndpoint: "https://id.twitch.tv/oauth2/token",
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
      redirectURI: process.env.MY_URL + "/auth/twitch/callback",
      scopes: ["user:read:email"],
    },
    async ({ request, tokens, context }) => {
      const scopes = tokens.scope as string[] | undefined // it's actually an array...
      try {
        logger.debug(
          {
            tokens,
            context,
            scopes,
          },
          "got user"
        )

        // get their info since the oauth response doesn't have it
        const twitchUser = await getTwitchUser(
          tokens.access_token,
          process.env.TWITCH_CLIENT_ID!
        )

        logger.debug(twitchUser, "got twitchuser")

        let user: UserRow | undefined
        await inTransaction(async (conn) => {
          user = await createOrGetUser(
            conn,
            twitchUser.email,
            twitchUser.login,
            "twitch",
            scopes || [],
            tokens.refresh_token
          )
        })

        // pleasing typescript
        if (!user)
          throw new Error("User not created or found THIS SHOULD NOT HAPPEN")

        return {
          email: user.email,
          id: user.id,
          scopes: user.scopes,
          name: user.name,
        } as AuthSession
      } catch (error) {
        logger.error(
          {
            err: extractError(error),
          },
          "error in createOrGetUser"
        )
        throw error
      }
    }
  ),
  twitchAuth
)

export interface authedUser extends UserRow {
  authSession: AuthSession
}

export async function getAuthedUser(
  request: Request
): Promise<authedUser | null> {
  const user = await authenticator.isAuthenticated(request)
  if (!user) {
    return null
  }

  try {
    // const userInfo = await selectUser(user.id)
    let userInfo: UserRow | undefined
    await inTransaction(async (conn) => {
      userInfo = await selectUserById(conn, user.id)
    })

    if (!userInfo) throw new Error("User not found THIS SHOULD NOT HAPPEN")

    return {
      ...userInfo,
      authSession: user,
    }
  } catch (error) {
    if (error instanceof RowsNotFound) {
      throw redirect("/signout")
    }
    throw error
  }
}
