import * as Dialog from "@radix-ui/react-dialog"
import { Drawer } from "vaul"
import { AnimatePresence, motion } from "framer-motion"
import React from "react"
import { useMediaQuery } from "~/hooks/useMediaQuery"

// A Modal or a Drawer depending on the screen size
export default function Modal(props: {
  open: boolean
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useMediaQuery("(max-width: 900px)")

  if (isMobile) {
    return (
      <Drawer.Root
        open={props.open}
        onOpenChange={props.onOpenChange}
        handleOnly
      >
        <Drawer.Trigger asChild />
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-[#090A32]/50 backdrop-blur-sm" />
          <Drawer.Content className="bg-white fixed bottom-0 h-[80vh] p-6 pt-8 rounded-t-[10px] w-full">
            <div className="absolute top-[18px] left-1/2 transform -translate-x-1/2">
              <Drawer.Handle className="!w-[60px] !bg-gray-300" />
            </div>
            <div className="overflow-y-auto h-full">{props.children}</div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
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
              {props.children}
              <Dialog.Close />
            </motion.div>
          </Dialog.Content>
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
