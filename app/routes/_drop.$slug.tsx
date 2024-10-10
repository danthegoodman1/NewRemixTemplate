/**
 * The leading _drop is ignored by the route
 */

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

interface LoaderData {
  dropName: string
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  if (!data) return [{ title: `StreamDrops: ${params.slug}` }]

  return [
    { title: `${data.dropName} - StreamDrops` },
    // { name: "description", content: "Welcome to Remix!" },
  ]
}

export async function loader(args: LoaderFunctionArgs): Promise<LoaderData> {
  // TODO: Get user from DB by slug or user id
  // TODO: Get the drop information and whether one is active

  return {
    dropName: "Drop Name",
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  return <></>
}
