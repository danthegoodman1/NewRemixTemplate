import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as Dialog from "@radix-ui/react-dialog"
import { Link } from "@remix-run/react"
import { $showSignInDialog } from "~/stores"
import { Drawer } from "vaul"
import { useMediaQuery } from "~/hooks/useMediaQuery"
import { AnimatePresence, motion } from "framer-motion"

export default function SignInDialog(props: { open: boolean }) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  const delay = isMobile ? "80ms" : "30ms" // because of the drawer animation, the animation needs to be a bit slower to see it

  const content = (
    <div className="upEnter">
      <h3
        style={{ "--stagger": 0, "--delay": delay } as React.CSSProperties}
        className="text-2xl font-bold mb-3"
      >
        Sign in to StreamerTrust
      </h3>
      <p
        style={{ "--stagger": 1, "--delay": delay } as React.CSSProperties}
        className="text-[#9b9cb3] mb-6"
      >
        Continue with
      </p>
      <div className="flex flex-col gap-3 font-bold text-sm upEnter">
        <Link
          to="/auth/twitch/signin"
          className="flex px-6 py-3 border rounded-sm border-[#090A32] justify-between w-full items-center"
          style={{ "--stagger": 3, "--delay": delay } as React.CSSProperties}
        >
          <div className="flex gap-3">
            <img src="/twitch.svg" alt="Twitch" height={20} />
            <span>Twitch</span>
          </div>
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
        <Link
          to="/auth/google/signin"
          className="flex px-5 py-3 border rounded-sm border-[#090A32] justify-between w-full items-center"
          style={{ "--stagger": 4, "--delay": delay } as React.CSSProperties}
        >
          <div className="flex gap-3">
            <img src="/youtube-HEIGHT20.svg" alt="YouTube" height={20} />
            <span>Google</span>
          </div>
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>
    </div>
  )

  // TODO: make this an unstyled then styled DialogDrawer component

  if (isMobile) {
    return (
      <Drawer.Root
        open={props.open}
        onOpenChange={(open) => $showSignInDialog.set(open)}
        handleOnly
      >
        <Drawer.Trigger asChild />
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-[#090A32]/50 backdrop-blur-sm" />
          <Drawer.Content className="bg-white fixed bottom-0 h-[80vh] p-6 pt-8 rounded-t-[10px] w-full">
            <div className="absolute top-[18px] left-1/2 transform -translate-x-1/2">
              <Drawer.Handle className="!w-[60px] !bg-gray-300" />
            </div>
            {content}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={(open) => $showSignInDialog.set(open)}
    >
      <Dialog.Trigger asChild />
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#090A32]/50 backdrop-blur-sm" />
        <AnimatePresence>
          <Dialog.Content asChild>
            <motion.div
              className="fixed top-1/2 left-1/2 bg-white p-8 rounded-md flex flex-col w-full max-w-[500px]"
              initial={{ opacity: 0, y: "-40%", x: "-50%" }}
              animate={{ opacity: 1, y: "-50%", x: "-50%" }}
              exit={{ opacity: 0, y: "-40%", x: "-50%" }}
              transition={{ duration: 0.3, type: "spring", bounce: 0 }}
            >
              {content}
              <Dialog.Close />
            </motion.div>
          </Dialog.Content>
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
