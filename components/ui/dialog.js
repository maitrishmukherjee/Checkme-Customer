"use client"

import { createContext, useContext, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const DialogContext = createContext()

function Dialog({ children, open, onOpenChange }) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>
}

function DialogTrigger({ children, asChild, ...props }) {
  const { onOpenChange } = useContext(DialogContext)

  if (asChild) {
    return children
  }

  return (
    <button onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  )
}

function DialogOverlay() {
  const { onOpenChange } = useContext(DialogContext)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [onOpenChange])

  return <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)} />
}

function DialogContent({ className, children, ...props }) {
  const { open, onOpenChange } = useContext(DialogContext)

  if (!open) return null

  return (
    <>
      <DialogOverlay />
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <div className={cn("grid gap-4", className)} {...props}>
          {children}
        </div>
      </div>
    </>
  )
}

function DialogHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
}

function DialogFooter({ className, ...props }) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
}

function DialogTitle({ className, ...props }) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
}

function DialogDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription }
