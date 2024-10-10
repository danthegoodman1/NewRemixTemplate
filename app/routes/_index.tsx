import { faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { useState } from "react"
import HeaderTable from "~/components/HeaderTable"
import LoaderButton from "~/components/LoaderButton"
import SignInDialog from "~/components/SignInDialog"

export const meta: MetaFunction = () => {
  return [
    { title: "StreamerTrust" },
    // { name: "description", content: "Welcome to Remix!" },
  ]
}

export default function Index() {
  return (
    <>
      <HeaderSection />
    </>
  )
}

function HeaderSection() {
  return (
    <div className="w-[1200px] border text-[#090A32] border-[#090A32] px-[28px] py-[28px] flex sm:flex-row flex-col justify-between gap-4 items-start">
      <div className="flex flex-col gap-[24px] w-full max-w-[540px]">
        <div className="w-full flex flex-col gap-[12px]">
          <h1 className="font-semibold text-2xl flex items-center gap-1 ml-[-12px]">
            <div className="rounded-sm bg-[#393DF0] h-[20px] w-[6px]" />
            StreamerTrust
          </h1>
          <p className="text-lg font-normal text-[#9b9cb3]">
            Verified, anonymous Sponsor & Agency reviews for Streamers, by
            Streamers
          </p>
          <LoaderButton
            className="justify-center items-center w-full bg-indigo-400 text-white rounded-md h-10 max-w-[200px] flex"
            loading={false}
            onClick={async () => {
              await new Promise((resolve) => setTimeout(resolve, 2000))
            }}
            successMessage={"Login link sent!"}
          >
            Hey this is insane
          </LoaderButton>
        </div>

        <div className="w-full flex gap-10 text-[#090A32] underline">
          <Link
            to="https://x.com/tangiaco"
            className="hover:underline font-mono text-sm"
            target="_blank"
          >
            X (Twitter)
          </Link>
          <Link to="/commitment" className="hover:underline font-mono text-sm">
            Our Commitment to Anonymimity
          </Link>
        </div>
        <p className="font-mono text-[#6A6A6B] text-sm">
          Made with 🧡 by{" "}
          <Link className="underline" to="https://www.tangia.co">
            Tangia
          </Link>
        </p>
      </div>
      <HeaderTable
        pairs={[
          { header: "Reviews", value: 100 },
          { header: "Reviews", value: 100 },
          { header: "Reviews", value: 100 },
          {
            header: "Made By",
            value: (
              <a
                className="underline"
                target="_blank"
                href="https://www.tangia.co"
              >
                Tangia
              </a>
            ),
          },
        ]}
      />
    </div>
  )
}
