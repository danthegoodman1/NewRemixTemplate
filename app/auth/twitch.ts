import { HighStatusCode } from "~/errors"

interface TwitchRequestOptions {
  path: string
  accessToken: string
  clientId: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  body?: object
}

async function doTwitchRequest<T>({
  path,
  accessToken,
  clientId,
  method,
  body,
}: TwitchRequestOptions): Promise<TwitchResponse<T>> {
  const baseUrl = "https://api.twitch.tv/helix"
  const url = `${baseUrl}${path}`

  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
    "Client-Id": clientId,
    "Content-Type": "application/json",
  }

  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }

  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new HighStatusCode(response.status, await response.text())
    }

    return await response.json()
  } catch (error) {
    console.error("Error making Twitch API request:", error)
    throw error
  }
}

export interface TwitchResponse<T> {
  data: T[]
}

export interface TwitchUserResponse {
  id: string
  login: string
  display_name: string
  type: string
  broadcaster_type: string
  description: string
  profile_image_url: string
  offline_image_url: string
  view_count: number
  email: string
  created_at: Date
}

export async function getTwitchUser(
  accessToken: string,
  clientId: string
): Promise<TwitchUserResponse> {
  const response = await doTwitchRequest<TwitchUserResponse>({
    path: "/users",
    accessToken,
    clientId,
    method: "GET",
  })

  return response.data[0]
}
