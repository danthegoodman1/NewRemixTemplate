import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { Spinner } from "./Spinner"

const buttonStates = ["idle", "loading", "success", "error"]
type ButtonState = (typeof buttonStates)[number]

// The only reason we do props expansion here is because we need to for the button props inheritance

export default function LoaderButton(
  props: {
    children: React.ReactNode
    loading: boolean
    onClick: () => Promise<void>
    spinnerColor?: string
    spinnerSize?: number
    /**
     * If provided, there is an additional success state that will be displayed for 1.5 seconds
     */
    successMessage?: React.ReactNode
    successMessageDuration?: number
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const [buttonState, setButtonState] = useState<ButtonState>("idle")

  return (
    <button
      {...props}
      className={`overflow-hidden relative ${props.className}`}
      onClick={async (e) => {
        e.preventDefault()
        setButtonState("loading")
        try {
          await props.onClick()
          setButtonState(props.successMessage ? "success" : "idle")
          if (props.successMessage) {
            setTimeout(
              () => setButtonState("idle"),
              props.successMessageDuration ?? 2000
            )
          }
        } catch (error) {
          setButtonState("error")
        }
      }}
      disabled={buttonState !== "idle" || props.disabled}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={buttonState}
          transition={{ duration: 0.3, bounce: 0, type: "spring" }}
          initial={{ opacity: 0, y: -25 }}
          exit={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-center items-center"
        >
          {buttonState === "loading" ? (
            <Spinner
              color={props.spinnerColor ?? "rgba(255, 255, 255, 0.65)"}
              size={props.spinnerSize ?? 16}
            />
          ) : buttonState === "success" ? (
            props.successMessage
          ) : (
            props.children
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
